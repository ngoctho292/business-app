# Kế hoạch Triển khai: Sprint 1 — Khởi tạo Nền tảng & Hạ tầng (Foundation Setup)

Tài liệu này chi tiết hóa các bước khởi tạo cấu trúc Monorepo, thiết lập môi trường Docker Compose local, xây dựng hệ thống Type dùng chung, và khởi tạo Backend NestJS với Drizzle ORM cùng Renderer Next.js Multi-tenant theo đúng đặc tả v0.2 đã chốt.

---

## 1. Kiến trúc Tổng thể & Cấu trúc Thư mục

```
c:\workspace\t-business\
├── docs\                         # 11 tài liệu kiến trúc v0.2 đã hoàn thiện
├── docker-compose.yml            # Môi trường chạy local (Postgres, Redis, MinIO, Nginx)
├── nginx\
│   └── nginx.conf                # Reverse proxy config
├── .env.example                  # Template biến môi trường
├── .gitignore
├── package.json                  # Root Monorepo Workspace
├── tsconfig.base.json            # Base TypeScript config
├── packages\
│   └── shared-types\             # Types sinh tự động từ OpenAPI & Block Catalog
│       ├── package.json
│       ├── src\
│       │   ├── api.types.ts      # Sinh từ 02-api-specification.yaml
│       │   ├── blocks.types.ts   # Sinh từ 03-block-schema-catalog.json
│       │   └── index.ts
│       └── scripts\
│           └── generate-types.ts
└── apps\
    ├── backend\                  # NestJS 10 API + Drizzle ORM
    │   ├── package.json
    │   ├── drizzle.config.ts     # Cấu hình Drizzle Kit
    │   ├── src\
    │   │   ├── db\               # Drizzle Schema & Connection
    │   │   │   ├── schema\       # 9 bảng theo ERD v0.2
    │   │   │   ├── index.ts
    │   │   │   └── migrations\
    │   │   ├── modules\
    │   │   │   ├── auth\         # Login, Refresh, Logout, JWT
    │   │   │   ├── rbac\         # Guards (PlatformAdmin, SiteRole)
    │   │   │   ├── sites\
    │   │   │   ├── pages\
    │   │   │   ├── blocks\
    │   │   │   ├── content\
    │   │   │   ├── media\        # MinIO Presigned URL
    │   │   │   └── ai\           # Gemini 1.5 Flash SDK
    │   │   ├── common\           # Pino Logger, X-Request-ID Interceptor, Error Filters
    │   │   └── main.ts
    ├── renderer\                 # Next.js 14 App Router Multi-tenant
    │   ├── package.json
    │   ├── middleware.ts         # Hostname -> Redis -> x-site-id
    │   └── src\app\
    │       ├── [domain]\         # Dynamic routing theo site
    │       │   └── [...slug]\
    │       └── api\revalidate\   # On-demand ISR revalidation
    └── editor\                   # React 18 + Vite + Zustand + dnd-kit (Canvas Editor)
```

---

## 2. Các Bước Triển Khai Chi Tiết (Proposed Changes)

### Bước 1: Root Workspace & Docker Compose
- Khởi tạo `package.json` với npm workspaces (`apps/*`, `packages/*`).
- Tạo file `docker-compose.yml` định nghĩa 4 containers:
  1. `postgres:15-alpine` (Port 5432)
  2. `redis:7-alpine` (Port 6379)
  3. `minio/minio:latest` (Port 9000 API, Port 9001 Console)
  4. `nginx:alpine` (Port 80/443 reverse proxy)
- Tạo `nginx/nginx.conf` định tuyến request `/v1/*` về Backend và các domain khác về Renderer.
- Tạo `.env.example` chứa toàn bộ biến môi trường đã chuẩn hóa ở `11-tech-stack.md`.

---

### Bước 2: Gói `packages/shared-types` (Code Generation)
- Cài đặt `openapi-typescript` và `json-schema-to-typescript`.
- Viết script `generate-types` đọc trực tiếp từ `docs/02-api-specification.yaml` và `docs/03-block-schema-catalog.json`.
- Xuất khẩu các interface: `UserDTO`, `SiteDTO`, `PageDTO`, `PageVersionDTO`, `BlockDTO`, `BlockPropsMap`, `ErrorResponse` để Backend và Frontend dùng chung, đảm bảo 0% sai lệch kiểu dữ liệu.

---

### Bước 3: `apps/backend` — NestJS + Drizzle ORM + Auth + RBAC
- Khởi tạo NestJS project với Node 20.
- Cài đặt `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`.
- Xây dựng **Drizzle Schema** khớp 100% với `01-erd-database-schema.md` v0.2:
  - `sitesTable` (kèm `domain_verified`, `domain_verified_at`)
  - `usersTable` (kèm `role = 'platform_admin' | 'user'`)
  - `sitesUsersTable` (kèm `role = 'owner' | 'designer' | 'editor' | 'viewer'`)
  - `pagesTable` (kèm `current_version_id FK`, `deleted_at`, audit fields)
  - `pageVersionsTable` (kèm `submitted_by`, `approved_by`, `review_notes`)
  - `blocksTable` (kèm `parent_id self-ref`, `props JSONB`)
  - `contentTypesTable` (kèm `requires_approval`)
  - `contentItemsTable` (kèm `site_id FK`, `deleted_at`, audit fields)
  - `mediaAssetsTable` (kèm `file_size`, `mime_type`, `deleted_at`)
- Cấu hình script migration `drizzle-kit generate` & `drizzle-kit migrate`.
- Triển khai **Observability**:
  - `nestjs-pino` cấu hình JSON structured logs.
  - Middleware gán `X-Request-ID` (UUID) cho mọi request.
  - Global `HttpExceptionFilter` chuẩn hóa response lỗi theo `Error` schema.
- Triển khai **Auth & RBAC**:
  - `POST /auth/login` (JWT access token TTL 15m + refresh token TTL 30d).
  - `POST /auth/refresh` (xoay vòng token an toàn).
  - `POST /auth/logout`.
  - `RolesGuard` kiểm tra role cấp site (`owner`, `designer`, `editor`, `viewer`).
  - `PlatformAdminGuard` hỗ trợ role cấp hệ thống.
  - Enforce rule `submitted_by ≠ approved_by` ở tầng controller/service.

---

### Bước 4: `apps/renderer` — Next.js 14 Multi-tenant Engine
- Khởi tạo Next.js 14 App Router.
- Viết `middleware.ts`:
  - Lấy `req.headers.get('host')`.
  - Tra cứu Redis cache: `hostname -> site_id` (nếu cache miss thì gọi API Backend).
  - Rewrite request sang route nội bộ `/[site_id]/[...slug]`.
- Xây dựng layout & page renderer với `revalidatePath` on-demand qua endpoint `/api/revalidate`.

---

## 3. Kế hoạch Kiểm Thử & Nghiệm Thu (Verification Plan)

### Kiểm thử Tự động (Automated Verification)
1. **Docker Services:**
   - Chạy `docker compose up -d`.
   - Kiểm tra kết nối tới Postgres 5432, Redis 6379, MinIO Console 9001.
2. **Drizzle Migration:**
   - Chạy `npm run db:migrate` trong `apps/backend`.
   - Xác nhận 9 bảng cùng toàn bộ index và foreign keys được tạo thành công trong PostgreSQL.
3. **Type Generation:**
   - Chạy `npm run generate-types` trong `packages/shared-types`.
   - Xác nhận sinh file `api.types.ts` và `blocks.types.ts` không có lỗi.
4. **Auth & RBAC Test Suite:**
   - Viết Integration Test cho luồng: Login -> Nhận Token -> Gọi API với role hợp lệ -> Gọi API trái quyền (nhận 403) -> Thử Designer tự approve version (nhận 403) -> Refresh token.

---

### 💡 Bước tiếp theo cần Bạn xác nhận
Bạn vui lòng xem kế hoạch trên, nếu bạn đồng ý, tôi sẽ bắt đầu khởi tạo cấu trúc Monorepo và viết các file mã nguồn đầu tiên!
