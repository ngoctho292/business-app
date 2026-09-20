# Test Plan / QA Checklist & Hướng dẫn sử dụng
> **Phiên bản:** v0.2 — Cập nhật sau SA Review (17/08/2026)  
> **Phạm vi:** Kiểm thử toàn diện các luồng nghiệp vụ, bảo mật Multi-tenant, Renderer Next.js và tích hợp AI Gemini.

---

## Phần A — Test Plan & QA Checklist Chi Tiết

### 1. Kiểm thử Bảo mật & Phân quyền Multi-tenant (Bắt buộc 100% Pass)
- [x] **Multi-tenant Data Isolation:** Đăng nhập với User site A, gọi API lấy danh sách Pages của site B (dùng `siteId` của B). Kết quả: **403 Forbidden / 404 Not Found** ✅ *(Đã kiểm tra tự động)*.
- [x] **RBAC Editor Lockdown:** Đăng nhập tài khoản role `editor`, gọi trực tiếp API `POST /sites/{siteId}/pages`. Kết quả: **403 Forbidden** ✅ *(Đã kiểm tra tự động)*.
- [x] **Check-and-Balance Approval Flow (P2-10):** Designer tạo version mới và submit in_review (`submitted_by = User_Designer`), sau đó Designer tự gọi API `POST /approve`. Kết quả: **403 Forbidden (Người gửi không thể tự duyệt)** ✅ *(Đã kiểm tra tự động)*.
- [x] **Chặn tấn công SSRF trên Form Block (B5):** Form block chỉ nhận `webhook_id` nội bộ, loại trừ hoàn toàn `webhook_url` tự do trỏ về `169.254.169.254` hoặc IP nội bộ `127.0.0.1`. Kết quả: **Schema bảo vệ chặt chẽ** ✅ *(Đã kiểm tra tự động)*.
- [x] **Sanitize XSS Rich-text:** Nhập payload `<script>alert('xss')</script>` vào field `richtext`. Kết quả: Khi render ra Next.js Renderer, thẻ script bị escape an toàn thành thực thể văn bản, không execute JavaScript ✅ *(Đã kiểm tra tự động)*.
- [x] **Platform Admin Override:** Tài khoản `platform_admin` có thể mở và xem dữ liệu các site; hệ thống ghi log audit kèm `X-Request-ID` ✅.

---

### 2. Kiểm thử Canvas Editor & Versioning Engine
- [ ] *(Manual Test)* **Kéo-thả & Nested Block:** Kéo 1 Button vào trong Section, Section đặt trong Section khác. Di chuyển vị trí order_index. Lưu và reload trang: cấu trúc cây block giữ nguyên.
- [x] **Chặn Circular Reference:** Thuật toán DFS trong `blocks.service.ts` chặn vòng lặp cha-con và ném ngoại lệ `400 Bad Request (Circular reference detected)` ✅ *(Đã kiểm tra mã nguồn)*.
- [x] **SEO Heading H1 Rule:** Block Catalog và `HeadingContentEditor` chỉ cung cấp cấp độ từ `H2` đến `H6`. Tiêu đề H1 được dành riêng tự động cho `seo_meta.title` của Page ✅ *(Đã cập nhật & kiểm tra)*.
- [x] **Autosave Granular:** Cơ chế Debounced Autosave (1200ms) tự động đồng bộ bản nháp khi người dùng chỉnh sửa thuộc tính hoặc cây khối ✅ *(Đã kiểm tra)*.
- [x] **Rollback Snapshot (B1):** Bảng `page_versions` lưu trữ snapshot độc lập; đổi `current_version_id` của page lập tức hiển thị lại đúng version mong muốn ✅ *(Đã kiểm tra)*.

---

### 3. Kiểm thử Multi-tenant Renderer & Custom Domain (ADR-001)
- [x] **Hostname Resolution:** Gửi request tới Renderer (`?site=nhahangabc.local`). Next.js Edge Middleware resolve đúng tenant site và trả về HTTP 200 OK ✅ *(Đã kiểm tra tự động)*.
- [x] **Unverified Domain Handling:** Gán domain chưa verify hoặc chưa trỏ CNAME -> Renderer trả về trạng thái thân thiện, không crash lỗi 500 ✅ *(Đã kiểm tra tự động)*.
- [x] **Instant Revalidation (<100ms):** Bấm "Publish" trên Editor -> Backend gửi trigger webhook `/api/revalidate` sang Next.js Renderer xóa cache tức thì ✅ *(Đã kiểm tra)*.
- [x] **404 Handling:** Truy cập slug không tồn tại trong site -> Trả về giao diện 404 tùy chỉnh chuẩn SEO, không bị crash 500 ✅ *(Đã kiểm tra tự động)*.

---

### 4. Kiểm thử Media & Giới hạn Dung lượng (Quota)
- [ ] *(Manual Test)* **Presigned URL Upload:** Gọi `POST /sites/{siteId}/media` -> Nhận presigned URL -> PUT trực tiếp file ảnh lên MinIO -> File xuất hiện trong thư viện Media.
- [ ] *(Manual Test)* **Quota Enforcement (413 Payload Too Large):** Upload file có kích thước vượt quá quota còn lại của gói site -> Backend từ chối ngay ở bước cấp presigned URL với HTTP **413**.
- [x] **MIME Type Validation:** Backend kiểm tra MIME type chỉ cấp phép danh sách ảnh/video hợp lệ (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`) ✅.

---

### 5. Kiểm thử AI Gemini Layer (ADR-002)
- [x] **SEO Suggestion:** Gọi `POST /v1/ai/suggest/seo-meta` -> API Gemini trả về `meta_description` và `title_suggestion` tiếng Việt chuẩn SEO ✅ *(Đã kiểm tra tự động)*.
- [x] **AI Excerpt Generation:** Gọi `POST /v1/ai/suggest/excerpt` -> Trả về đoạn trích dẫn súc tích 2-3 câu ✅ *(Đã kiểm tra tự động)*.
- [x] **Fallback khi Timeout / Quota Limit:** Hệ thống có hàm `fallbackGeneratedLayout` và fallback SEO tự động trích xuất nội dung trang, không văng lỗi 500 ra giao diện ✅ *(Đã kiểm tra)*.

---

### 6. Kiểm thử Auth, Pagination & Observability
- [x] **Token Rotation (B4):** Gọi `POST /v1/auth/refresh` kèm `refresh_token` -> Nhận cặp token mới thành công, hỗ trợ silent-refresh mượt mà ✅ *(Đã kiểm tra tự động)*.
- [x] **Cursor-based Pagination (B2):** Backend `content.service.ts` và `pages.service.ts` hỗ trợ phân trang chuẩn `limit` & `cursor` ✅.
- [x] **Log Correlation (X-Request-ID):** Mỗi request trả về header `X-Request-ID` và log chi tiết thời gian xử lý ✅.

---

## Phần B — Hướng dẫn sử dụng chuẩn hóa (User Guide)

### 1. Dành cho Khách hàng / Biên tập viên (Content Editor)

```
Bước 1: Đăng nhập vào trang quản trị theo đường dẫn: yourdomain.vn/admin
Bước 2: Chọn mục nội dung ở thanh bên trái (Ví dụ: "Bài viết", "Sản phẩm")
Bước 3: Bấm nút "+ Viết bài mới"
Bước 4: Nhập tiêu đề, upload ảnh đại diện và soạn thảo nội dung bài viết
        💡 Mẹo: Bấm nút "✨ AI tóm tắt" để tự động tạo đoạn trích ngắn cho bài viết.
Bước 5: Bấm "Đăng bài" để xuất bản ngay, hoặc "Lưu nháp" nếu muốn chỉnh sửa tiếp.
```

> **Lưu ý quan trọng:** Mọi bài viết đã đăng sẽ tự động xuất hiện ở đúng vị trí trên trang chủ/trang tin tức của website mà bạn không cần chỉnh sửa giao diện.

---

### 2. Dành cho Đội ngũ Thiết kế / Agency (Designer)

```
Bước 1: Mở Editor Engine để quản lý trang của khách hàng
Bước 2: Sử dụng các khối block từ "Thư viện block" ở cột trái kéo vào màn hình Canvas
Bước 3: Chỉnh sửa màu sắc, khoảng cách, font chữ tại "Panel thuộc tính" ở cột phải
Bước 4: Kiểm tra hiển thị trên 3 giao diện: Desktop - Tablet - Mobile
Bước 5: Bấm "Gợi ý SEO Meta" để AI điền tự động thẻ tiêu đề và mô tả tìm kiếm
Bước 6: Bấm "Gửi duyệt" để chuyển trạng thái sang In Review gửi thông báo tới khách hàng
Bước 7: Sau khi khách hàng bấm duyệt (Approved), bấm "Publish" để đưa trang lên live (~100ms).
```

---

*Tài liệu Test Plan v0.2 — Bộ tiêu chuẩn nghiệm thu chất lượng hệ thống trước khi Go-Live.*
