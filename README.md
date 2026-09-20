# T-Business CMS — Nền tảng CMS Kéo-thả Multi-tenant

Nền tảng thiết kế và quản trị website kéo-thả hiện đại dành cho doanh nghiệp và agency, xây dựng theo kiến trúc **Next.js 14 Multi-tenant Renderer + NestJS 10 API + Drizzle PostgreSQL**.

---

## 📦 Cấu trúc Dự án (Monorepo)

```
c:\workspace\t-business\
├── docs\                         # 11 tài liệu kiến trúc v0.2 đã hoàn thiện
├── docker-compose.yml            # Docker: Postgres 15, Redis 7, MinIO, Nginx
├── nginx\nginx.conf              # Reverse proxy định tuyến /v1/ API và CDN media
├── .env.example / .env           # Biến môi trường chuẩn hóa
├── packages\
│   └── shared-types\             # Types dùng chung sinh từ OpenAPI 02 & Block Catalog 03
└── apps\
    ├── backend\                  # NestJS 10 API + Drizzle ORM (Auth, RBAC, Gemini AI, MinIO)
    ├── renderer\                 # Next.js 14 App Router Multi-tenant Renderer (ISR)
    └── editor\                   # React 18 + Vite + Zustand + dnd-kit (Canvas Editor)
```

---

## 🚀 Hướng dẫn Khởi chạy Nhanh (Quick Start)

### 1. Khởi động Hạ tầng Docker (Postgres, Redis, MinIO)
```bash
npm run docker:up
```

### 2. Cài đặt Thư viện
```bash
npm install
```

### 3. Khởi tạo Database & Dữ Liệu Mẫu (Seeding)
```bash
# Sinh migration từ Drizzle schema
npm run db:generate

# Chạy migration tạo các bảng DB
npm run db:migrate

# Khởi tạo tài khoản hệ thống ban đầu (Admin, Designer, Editor)
npm run db:seed

# Nạp lại website mẫu CloudNext hoàn chỉnh (72 blocks đa cột) vào Database
npm run seed:sample

# Nạp lại toàn bộ Kho Mẫu Giao Diện vào Database (CloudNext SaaS & Nhà Hàng F&B)
npm run seed:templates
```

### 4. Khởi chạy Ứng dụng
```bash
# Terminal 1: Chạy Backend NestJS API (Port 4000)
npm run dev:backend

# Terminal 2: Chạy Visual Canvas Editor (Port 3000)
npm run dev:editor

# Terminal 3: Chạy Multi-tenant Renderer (Port 3001)
npm run dev:renderer
```

---

## 🔑 Tài khoản Mẫu Đã Tạo Sẵn

Sau khi chạy `npm run db:seed`, bạn có thể đăng nhập vào Editor (`http://localhost:3000`) bằng các tài khoản sau:

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Quyền hạn |
|---|---|---|---|
| **Platform Admin** | `admin@tbusiness.local` | `admin123456` | Toàn quyền hệ thống, can thiệp mọi site |
| **Designer (Agency)** | `designer@agency.vn` | `designer123` | Dựng layout blocks, tạo content types, submit review |
| **Editor (Khách hàng)** | `khachhang@nhahangabc.vn` | `khachhang123` | Nhập bài viết/sản phẩm theo content types có sẵn |

- **Website mẫu Flagship:** *CloudNext Technologies — Giải Pháp Chuyển Đổi Số* (`domain: cloudnext.local`) với 72 khối phân cấp, bố cục đa cột CSS Grid (Split Hero, 3 Cột Card Solar Icons, Bảng giá 3 gói Pro, Testimonials, Form liên hệ, Footer).
- **Website ẩm thực:** *Nhà hàng Ẩm thực ABC* (`domain: nhahangabc.local`).
- **Kho Mẫu Giao Diện (Template Library):** Lưu trữ động trong PostgreSQL (`website_templates`), quản lý hoàn toàn qua API `GET/POST /v1/templates` và hỗ trợ tính năng *"Lưu Trang Hiện Tại Thành Mẫu Mới"*.
- **MinIO Web Console:** `http://localhost:9001` (Tài khoản: `minioadmin` / `minioadmin_local`).
