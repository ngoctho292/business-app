# Design System — Nền tảng CMS kéo-thả
> **Phiên bản:** v0.2 — Cập nhật sau SA Review (17/08/2026)

Bộ token dùng chung cho **Editor Engine** (dashboard nội bộ agency) và **Content Editor UI** (giao diện khách hàng tự đăng bài). Đây là hệ thống cho **công cụ quản trị**, ưu tiên sự rõ ràng, chính xác, ít gây mỏi mắt khi làm việc thời gian dài.

---

## 1. Bảng màu (Color Tokens)

| Token | Hex Code | Ứng dụng |
|---|---|---|
| `--color-bg` | `#FAFAF8` | Nền ứng dụng chính (Warm gray nhạt) |
| `--color-surface` | `#FFFFFF` | Thẻ card, panel thuộc tính, modal, dropdown |
| `--color-border` | `#E4E2DC` | Đường viền, đường phân cách giữa các panel |
| `--color-text-primary` | `#1F1E1B` | Văn bản chính, tiêu đề |
| `--color-text-secondary` | `#6B6A63` | Chữ phụ, nhãn hướng dẫn, placeholder |
| `--color-accent` | `#2F6F4F` | Nút hành động chính (Publish/Lưu), trạng thái Live |
| `--color-accent-hover` | `#24583E` | Hover của nút hành động chính |
| `--color-warning` | `#B7791F` | Trạng thái nháp (Draft), chờ duyệt (In Review) |
| `--color-danger` | `#B3261E` | Nút xóa, cảnh báo nguy hiểm, lỗi validate form |
| `--color-ai` | `#7C3AED` | Tím AI (dành riêng cho các nút trợ lý AI Gemini) |

---

## 2. Typography & Font chữ

- **Font giao diện (UI Font):** `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — tải nhanh, hiển thị số liệu sắc nét.
- **Font nội dung khách nhập (Rich-text WYSIWYG):** Không ép cứng theo UI font — kế thừa theo template hiển thị của website khách hàng.
- **Thang kích thước (Type Scale):**
  - `12px` (Caption / Badge / Label thuộc tính nhỏ)
  - `13px` (Dữ liệu bảng, menu item sidebar)
  - `14px` (Body text chuẩn, input placeholder)
  - `16px` (Tiêu đề panel thuộc tính, section heading)
  - `18px – 20px` (Tiêu đề trang quản trị chính)
- **Độ đậm font (Font Weight):** `400` (Regular) cho nội dung, `500` (Medium) cho nhãn/nút bấm, `600` (Semi-bold) cho tiêu đề.

---

## 3. Không gian & Bố cục (Spacing & Breakpoints)

- **Đơn vị cơ sở:** `4px`. Thang đo khoảng cách: `4px` · `8px` · `12px` · `16px` · `24px` · `32px` · `48px`.
- **Bo góc (Border Radius):**
  - `6px`: Badge, menu item
  - `8px`: Nút bấm (Button), ô nhập liệu (Input/Select)
  - `12px`: Khung Panel, Hộp thoại Modal
- **Kích thước Panel cố định:**
  - Sidebar trái (Danh sách trang & Thư viện Block): `260px`
  - Panel phải (Thuộc tính Props của Block được chọn): `320px`
  - Vùng Canvas làm việc ở giữa: Chiếm toàn bộ không gian còn lại (Flex-grow)

### Breakpoints cho Chế độ Xem trước (Preview Mode):
```css
/* Khớp chuẩn 1-1 với responsiveOverride trong 03-block-schema-catalog.json */
--breakpoint-mobile:  375px;   /* Màn hình điện thoại dọc (< 768px) */
--breakpoint-tablet:  768px;   /* Máy tính bảng dọc (768px - 1279px) */
--breakpoint-desktop: 1280px;  /* Màn hình laptop/máy tính bàn (>= 1280px) */
```

---

## 4. Trạng thái Thành phần (Component States)

| Thành phần | Trạng thái quy định |
|---|---|
| **Button** | `default` · `hover` · `focus-visible` · `disabled` · `loading` (hiển thị spinner) |
| **Input / Select** | `default` · `hover` · `focus` (viền `--color-accent`) · `error` (viền `--color-danger` + dòng text lỗi) |
| **Badge Trạng thái** | `draft` (vàng nhạt) · `in_review` (xám) · `approved` (xanh nhạt) · `published` (xanh lá đậm) |
| **Nút Trợ lý AI** | Nút viền tím nhẹ kèm icon lấp lánh `✨`, khi đang xử lý có hiệu ứng shimmer |
| **Khung Upload Media** | `idle` (kéo thả) · `drag-over` (viền nét đứt màu xanh) · `uploading` (thanh tiến trình %) · `error` |
| **Toast Thông báo** | `success` (xanh lá) · `error` (đỏ) · `info` (xanh dương), tự biến mất sau 3 giây |

---

## 5. Nguyên tắc Áp dụng
1. Toàn bộ mã nguồn giao diện React Admin phải sử dụng CSS Variables từ bộ Design System này.
2. Tuyệt đối không áp bộ CSS token này lên trang website đầu ra của khách hàng (Renderer) — Renderer áp dụng Theme riêng theo từng Template thiết kế.
