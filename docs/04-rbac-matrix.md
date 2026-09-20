# Ma tran phan quyen (RBAC) — Nen tang CMS keo-tha
> **Phien ban:** v0.2 — Cap nhat sau SA Review 17/08/2026

---

## 1. Vai tro cap Platform (bang `users.role`)

| Role | Mo ta | Scope |
|---|---|---|
| `platform_admin` | Nhan vien support / billing — co the xem va can thiep toan bo site | Toan he thong |
| `user` | Nguoi dung thuong — quyen duoc xac dinh boi `sites_users.role` theo tung site | Per-site |

> **Luu y:** `platform_admin` la role cap he thong, luu trong `users.role`. Ho **khong co** entry trong `sites_users` — khong the duoc nham voi owner/designer.

---

## 2. Vai tro cap Site (bang `sites_users.role`)

| Role | Mo ta |
|---|---|
| `owner` | Chu site, toan quyen ke ca xoa site, quan ly user |
| `designer` | Agency/doi thiet ke — dung layout, dinh nghia content type |
| `editor` | Khach hang — chi nhap noi dung theo content type co san |
| `viewer` | Xem bao cao/preview, khong chinh sua duoc gi (VD: stakeholder phia khach) |

---

## 3. Ma tran quyen theo entity

| Entity / Hanh dong | platform_admin | owner | designer | editor | viewer |
|---|---|---|---|---|---|
| `pages` — tao/sua layout, block | ✅ (support) | ✅ | ✅ | ❌ | ❌ |
| `pages` — publish | ✅ (support) | ✅ | ✅ | ❌ | ❌ |
| `page_versions` — submit review (in_review) | — | ✅ | ✅ | ❌ | ❌ |
| `page_versions` — duyet (approve) | ✅ (support) | ✅ `*` | ❌ `*` | ❌ | ❌ |
| `page_versions` — xem/preview | ✅ | ✅ | ✅ | ✅ | ✅ |
| `content_types` — dinh nghia/sua cau truc field | ✅ (support) | ✅ | ✅ | ❌ | ❌ |
| `content_items` — tao/sua bai viet, san pham | ✅ (support) | ✅ | ✅ | ✅ | ❌ |
| `content_items` — publish | ✅ (support) | ✅ | ✅ | ✅ neu `requires_approval=false` | ❌ |
| `content_items` — xem | ✅ | ✅ | ✅ | ✅ | ✅ |
| `media_assets` — upload | ✅ (support) | ✅ | ✅ | ✅ | ❌ |
| `sites_users` — moi/xoa thanh vien | ✅ (support) | ✅ | ❌ | ❌ | ❌ |
| `sites` — cau hinh domain, xoa site | ✅ (support) | ✅ | ❌ | ❌ | ❌ |
| `/ai/suggest/*` — goi AI | — | ✅ | ✅ | ✅ | ❌ |

> **`*` Quy tac Approval Flow (P2-10):** `approved_by` PHAI khac `submitted_by`. Tuc la:
> - `designer` submit review → chi `owner` duoc approve (designer khong tu approve duoc).
> - Enforce o tang API: neu `submitted_by == current_user.id` → tra 403 FORBIDDEN.
> - Luu ca `submitted_by` lan `approved_by` vao `page_versions` de audit.

---

## 4. Quy tac `requires_approval` cho content_items

Co hinh trong `content_types.requires_approval` (da vao ERD v0.2 va API Spec v0.2):

| `requires_approval` | editor publish | Hanh dong |
|---|---|---|
| `false` (mac dinh) | Duoc publish truc tiep | POST /items/{id} voi status=published |
| `true` | Phai qua duyet | editor chi duoc dat status=draft; owner/designer moi duyet va set published |

---

## 5. Ghi chu trien khai

- **Ap dung kiem tra quyen o tang API (middleware)**, khong chi an UI — tranh truong hop `editor` goi thang API de sua `blocks`.
- **`platform_admin` check**: moi API handler nen check `req.user.role === 'platform_admin'` truoc — neu co, bypass site-level permission (nhung phai log audit).
- **`updated_by` va `submitted_by`**: Luu vao `content_items`, `page_versions` de truy vet khi co tranh chap noi dung. Da them vao ERD v0.2.
- **Rate limit AI endpoints**: `/ai/suggest/*` nen gioi han 20 request/phut/user de tranh bi toc du phi Gemini API.
- **Webhook security**: `form.webhook_id` chi chua ID — backend phai validate ID thuoc dung site_id truoc khi goi webhook. Khong bao gio tra URL thuc cua webhook ve frontend.
