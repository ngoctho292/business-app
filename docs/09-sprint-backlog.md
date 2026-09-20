# Kế hoạch Sprint & Backlog Dự Án (T-Business CMS)
> **Phiên bản:** v1.0 — Hoàn Thành 100% Toàn Bộ 11 Sprints (Dự án T-Business CMS)  
> **Tổng ước lượng:** ~69 ngày công (11 Sprints)

---

## 📊 Bảng Tổng Kết Hoàn Thành Toàn Bộ 11 Sprints

| Sprint | Module | Nhiệm vụ (Task) | Mô tả chi tiết | Ước lượng | Phụ trách | Trạng thái |
|:---:|---|---|---|:---:|:---:|:---:|
| **Sprint 1** | **Data & Foundation** | **Thiết kế & Dựng Schema DB** | Tạo 9 bảng DB (sites, users, pages, blocks...), composite index, migration Drizzle ORM | 3 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 1** | **Editor** | **Canvas kéo-thả cơ bản** | Dựng khung Canvas, Topbar, Sidebar, Properties Panel, Responsive Switcher | 5 ngày | Frontend | ✅ **Hoàn thành** |
| **Sprint 2** | **Editor** | **Hoàn thiện Thư viện Blocks** | Render và chỉnh sửa đầy đủ 10 blocks (heading, text, image, button, section, video, embed...) | 4 ngày | Frontend | ✅ **Hoàn thành** |
| **Sprint 2** | **API** | **Hoàn thiện CRUD Pages & Blocks** | Tích hợp Granular Autosave `PATCH /blocks/:id`, kiểm tra Circular Reference | 3 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 3** | **Renderer** | **SSR JSON sang HTML Component** | Next.js Multi-tenant Renderer giải mã cây Block Tree thành React JSX chuẩn SEO | 5 ngày | Fullstack | ✅ **Hoàn thành** |
| **Sprint 3** | **Renderer** | **Publish Pipeline & ISR** | Kích hoạt `revalidatePath`, snapshot `current_version_id` live tức thì (<100ms) | 3 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 4** | **Infra / CDN / Engine** | **Dynamic CSS Engine & Edge Caching** | Bộ sinh CSS động Scoped Class, Design Tokens, Nginx Gzip & CDN Cache-Control, LCP < 2s | 2 ngày | Fullstack/DevOps | ✅ **Hoàn thành** |
| **Sprint 5** | **CMS** | **Content Type Builder** | Giao diện và API định nghĩa trường dữ liệu động (`field_schema`), cờ `requires_approval` | 4 ngày | Fullstack | ✅ **Hoàn thành** |
| **Sprint 5** | **CMS** | **Content Editor UI** | Giao diện tối giản cho khách hàng tự nhập bài viết / sản phẩm | 5 ngày | Frontend | ✅ **Hoàn thành** |
| **Sprint 6** | **CMS** | **Block `collection_list`** | Hiển thị danh sách bài viết / sản phẩm động từ CMS ra ngoài trang Live | 3 ngày | Frontend | ✅ **Hoàn thành** |
| **Sprint 6** | **Security** | **RBAC Middleware & Guards** | Enforce quyền `platform_admin`, `owner`, `designer`, `editor`, `viewer`, approval check | 3 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 7** | **Tích hợp** | **Cổng Thanh toán MoMo** | Tích hợp thanh toán sandbox / IPN webhook | 4 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 7** | **Template** | **Bộ Template F&B Đầu tiên** | Xây dựng bộ mẫu website hoàn chỉnh cho ngành ẩm thực / nhà hàng | 5 ngày | Designer | ✅ **Hoàn thành** |
| **Sprint 8** | **Tích hợp** | **Vận chuyển GHN / GHTK** | Tích hợp tính phí và tạo đơn vận chuyển | 4 ngày | Backend | ✅ **Hoàn thành** |
| **Sprint 9** | **AI Layer** | **Sinh Layout từ mô tả (Gemini 2.5)** | Tự động sinh JSON Block Tree từ văn bản mô tả tiếng Việt bằng Gemini 2.5 Flash | 6 ngày | AI/Backend | ✅ **Hoàn thành** |
| **Sprint 10** | **AI Layer** | **Gợi ý SEO & Tóm tắt Excerpt** | Tích hợp `/ai/suggest/seo-meta` (SERP Preview) & `/ai/suggest/excerpt` trên UI | 4 ngày | Fullstack | ✅ **Hoàn thành** |
| **Sprint 11** | **Đo lường** | **Tracking Chuyển đổi & A/B Test** | Tích hợp GA4, FB Pixel, tính năng A/B testing giữa các `page_versions` | 6 ngày | Fullstack | ✅ **Hoàn thành** |

---

## 🎯 Tiêu Chí Nghiệm Thu (Definition of Done — DoD)

| Loại Task | Tiêu chí hoàn thành (DoD) | Trạng thái |
|---|---|:---:|
| **Feature** | Code review xong; test trên staging; không lỗi console; đúng props/schema đã định nghĩa. | ✅ **Đạt** |
| **API Endpoint** | Khớp 100% OpenAPI spec v0.2; có validate input; trả về `ErrorResponse` chuẩn hóa; có trace `X-Request-ID`. | ✅ **Đạt** |
| **UI Component** | Responsive chuẩn trên 3 Breakpoint: Desktop (1280px), Tablet (768px), Mobile (375px); dùng đúng CSS variables từ `05-design-system.md`. | ✅ **Đạt** |
| **Tích hợp bên thứ ba** | Test với tài khoản sandbox (MoMo, GHN, GHTK, Gemini 2.5 Flash, GA4, FB Pixel); xử lý được lỗi timeout/callback; ghi log giao dịch đầy đủ. | ✅ **Đạt** |
| **Bugfix** | Có test case tái hiện lỗi trước khi sửa; verify không phát sinh lỗi hồi quy (regression). | ✅ **Đạt** |
