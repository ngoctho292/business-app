# Tech Stack — Nen tang CMS keo-tha
> **Phien ban:** v0.2 — Cap nhat sau SA Review 17/08/2026

## 1. Bang tong quan

| Thanh phan | Lua chon | Phien ban de xuat | Ly do |
|---|---|---|---|
| Frontend Editor | React + TypeScript, Zustand, dnd-kit | React 18, TS 5 | He sinh thai lon, hieu nang tot cho canvas phuc tap |
| Renderer/SSR | Next.js (App Router) — **1 app multi-tenant** | Next.js 14+ | SSR/ISR san co, toi uu SEO, Edge Middleware ho tro hostname routing (ADR-001) |
| Backend API | Node.js + NestJS | Node 20 LTS | Cau truc module ro rang, de mo rong theo domain (Pages, Content, Media...) |
| Reverse Proxy | **Nginx** — **khong can API Gateway rieng** | latest stable | SSL termination, reverse proxy, rate limit co ban — NestJS xu ly auth/RBAC (ADR-003) |
| Database | PostgreSQL | 15+ | JSONB cho schema dong, manh ve quan he, ACID cho du lieu multi-tenant |
| Media/Object Storage | **MinIO** (self-hosted) | Server RELEASE moi nhat | S3-compatible, self-host duoc, khong phu thuoc nha cung cap ngoai, de migrate sau |
| CDN | Cloudflare (dung truoc MinIO + truoc Renderer) | — | Cache HTML tinh va media, giam tai origin, co PoP gan Viet Nam, Free tier du dung |
| Cache | Redis | 7+ | Cache session, hostname→site_id lookup (Renderer), rate-limit |
| Queue | **Redis + BullMQ** | BullMQ 5+ | NestJS Bull module, retry/delay/dead-letter queue cho publish job, email, cleanup |
| **AI Layer** | **Google Gemini API** | gemini-1.5-flash (default), gemini-1.5-pro (heavy) | Free tier du cho ca nhan; SDK `@google/generative-ai` (ADR-002) |
| Auth | JWT (access 15 phut + refresh 30 ngay) | — | Stateless, NestJS Guards xu ly RBAC |
| Ha tang | Docker + Docker Compose (dev), Kubernetes (prod sau nay) | — | Container hoa tung service, de scale doc lap |
| CI/CD | GitHub Actions | — | Tich hop san voi GitHub, du dung cho team nho/ca nhan |
| **Observability** | **Pino (log) + Prometheus + Grafana + OpenTelemetry** | — | Logging co cau truc, metrics, tracing — bat buoc cho production (B8) |
| Thanh toan/van chuyen VN | MoMo, ZaloPay, GHN, GHTK API | — | Theo yeu cau thi truong Viet Nam da khao sat |

---

## 2. Observability Stack (B8 — Bat buoc truoc khi code)

Khong co Observability, debug production incident gan nhu khong the. Bo 3 toi thieu:

### Logging — Pino (structured JSON)
```typescript
// backend/src/main.ts
const app = await NestFactory.create(AppModule, {
  logger: new Logger(), // dung PinoLogger qua nestjs-pino
});
// Moi log phai co: request_id, site_id, user_id, duration
```

### Metrics — Prometheus + Grafana Cloud (Free)
- `@willsoto/nestjs-prometheus` — export `/metrics` endpoint.
- Dashboard can theo doi: API p95 latency, error rate per endpoint, queue depth BullMQ, Postgres connection pool.
- Grafana Cloud Free: 10k series, 14 ngay retention — du cho ca nhan.

### Tracing — OpenTelemetry
```typescript
// Tich hop vao NestJS qua @opentelemetry/sdk-node
// Trace moi request: NestJS -> Postgres -> Redis -> Gemini API
// Export sang Grafana Tempo (free tier) hoac Jaeger self-hosted
```

### X-Request-ID (correlation header)
```typescript
// NestJS middleware: moi request nhan hoac gen UUID, gan vao context
// Tat ca log trong request phai chua request_id nay
// Response tra ve header X-Request-ID de frontend debug
```

---

## 3. AI Layer — Google Gemini API (ADR-002)

```
Provider:  Google Gemini API (https://generativelanguage.googleapis.com)
SDK:       @google/generative-ai (npm, chinh thuc)
Model mac dinh:  gemini-1.5-flash  (nhanh, re, free tier 15 RPM / 1M token/ngay)
Model heavy:     gemini-1.5-pro    (chi dung cho tinh nang phan tich phuc tap)
```

**Bien moi truong Gemini:**
```
GEMINI_API_KEY=xxx
GEMINI_MODEL_DEFAULT=gemini-1.5-flash
GEMINI_MODEL_HEAVY=gemini-1.5-pro
GEMINI_RATE_LIMIT_RPM=14
```

**Use case MVP:**
- `POST /ai/suggest/seo-meta` — tu dong gen meta description khi publish.
- `POST /ai/suggest/excerpt` — goi y excerpt khi editor tao bai viet.

---

## 4. Chi tiet Media/Object Storage — MinIO

Thay cho S3 của AWS, dùng **MinIO** self-hosted để chủ động hạ tầng và chi phí trong giai đoạn đầu, vẫn giữ khả năng migrate sang S3/GCS thật sau này nhờ tương thích API S3.

### Cấu trúc bucket đề xuất

| Bucket | Nội dung | Chính sách truy cập |
|---|---|---|
| `media-public` | Ảnh/video hiển thị công khai trên website đã publish (blocks, content_items) | Public-read qua CDN, ghi qua presigned URL |
| `media-private` | File chưa publish, ảnh nháp, file nội bộ (bảng thiết kế đính kèm feedback...) | Private, chỉ truy cập qua presigned URL có thời hạn |
| `site-exports` | File export (backup page_version, báo cáo) | Private |

### Luong upload (Editor Engine & Content Editor UI) — cap nhat theo API v0.2

1. Frontend goi `POST /sites/{siteId}/media` voi metadata (filename, mime_type, file_size).
2. Backend NestJS kiem tra storage quota cua site, sau do sinh **presigned PUT URL** tu MinIO (SDK `minio-js` hoac `aws-sdk` tro endpoint MinIO), tra ve `upload_url` + `asset_id`.
3. Frontend upload file truc tiep len MinIO qua presigned URL (khong qua backend, tranh nghen bang thong backend).
4. Sau khi upload xong, frontend goi `POST /sites/{siteId}/media/{assetId}/confirm` → backend luu ban ghi vao bang `media_assets`.
5. CDN (Cloudflare) dung truoc bucket `media-public` de cache, giam tai truc tiep len MinIO khi nhieu nguoi xem trang.

### Bien moi truong can chuan bi

```
# MinIO
MINIO_ENDPOINT=minio.internal.example.com
MINIO_PORT=9000
MINIO_ACCESS_KEY=xxx
MINIO_SECRET_KEY=xxx
MINIO_USE_SSL=true
MINIO_BUCKET_PUBLIC=media-public
MINIO_BUCKET_PRIVATE=media-private
MEDIA_CDN_BASE_URL=https://cdn.example.com

# Gemini AI (ADR-002)
GEMINI_API_KEY=xxx
GEMINI_MODEL_DEFAULT=gemini-1.5-flash
GEMINI_MODEL_HEAVY=gemini-1.5-pro
GEMINI_RATE_LIMIT_RPM=14

# JWT Auth
JWT_ACCESS_SECRET=xxx
JWT_ACCESS_TTL=900
JWT_REFRESH_SECRET=xxx
JWT_REFRESH_TTL=2592000

# Renderer (Next.js)
RENDERER_URL=https://renderer.internal.example.com
RENDERER_REVALIDATE_SECRET=xxx
```

### Lưu ý vận hành
- Bật **versioning** cho bucket `media-private` để không mất file khi khách/designer lỡ ghi đè.
- Đặt **lifecycle policy** dọn file nháp không dùng tới sau X ngày (tránh phình dung lượng từ ảnh upload thử rồi bỏ).
- MinIO chạy dạng cluster (nhiều node, erasure coding) ngay từ môi trường production đầu tiên nếu ngân sách cho phép, để tránh single point of failure — môi trường dev/staging dùng 1 node là đủ.

---

## 5. Moi truong phat trien local (Docker Compose)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: cms
      POSTGRES_PASSWORD: cms_local_pw
      POSTGRES_DB: cms_dev
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7
    ports: ["6379:6379"]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin_local
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Console web
    volumes: ["miniodata:/data"]

  backend:
    build: ./backend
    env_file: ./backend/.env
    depends_on: [postgres, redis, minio]
    ports: ["4000:4000"]

  renderer:  # Next.js multi-tenant (ADR-001)
    build: ./renderer
    env_file: ./renderer/.env
    depends_on: [backend, redis]
    ports: ["3000:3000"]

  nginx:
    image: nginx:alpine
    volumes: ["./nginx/nginx.conf:/etc/nginx/nginx.conf:ro"]
    ports: ["80:80", "443:443"]
    depends_on: [backend, renderer]

volumes:
  pgdata:
  miniodata:
```

> Sau khi chay `docker compose up`:
> 1. Vao MinIO Console tai `http://localhost:9001` (tai khoan `minioadmin` / `minioadmin_local`) de tao san 2 bucket `media-public` va `media-private`.
> 2. Renderer `http://localhost:3000` — them entry vao `/etc/hosts` local de test hostname routing: `127.0.0.1  test-site.local`

---

## 6. Ghi chu lua chon thay the
- **MinIO → AWS S3 / Backblaze B2**: mig ra sau khi scale, khong doi code nho tuong thich S3 API, chi doi endpoint/credentials.
- **NestJS → FastAPI**: neu team quen Python hon — schema DB va API spec khong doi, chi doi tang implement.
- **Grafana Cloud → self-hosted**: neu can data retention dai hon 14 ngay ma khong muon tra phi.
- **BullMQ → Inngest / Trigger.dev**: neu can workflow phuc tap hon (multi-step, branching) — nhung BullMQ la du cho MVP.

---

*Tech Stack v0.2 — Cap nhat theo SA Review 17/08/2026 (ADR-001, ADR-002, ADR-003 da chot)*
