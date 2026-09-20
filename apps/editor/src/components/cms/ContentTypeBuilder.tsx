import React, { useState } from 'react';
import { ContentTypeDTO, ContentFieldSchema, FieldType } from '@t-business/shared-types';
import { cmsService } from '../../services/cmsService';

interface Props {
  contentTypes: ContentTypeDTO[];
  onRefresh: () => Promise<void>;
}

const FIELD_TYPES: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Văn bản ngắn (Text)' },
  { type: 'richtext', label: 'Đoạn văn dài / Soạn thảo phong phú (Rich Text)' },
  { type: 'number', label: 'Số (Number)' },
  { type: 'image', label: 'Đường dẫn ảnh (Image URL)' },
  { type: 'boolean', label: 'Bật / Tắt (Boolean)' },
  { type: 'date', label: 'Ngày tháng (Date)' },
];

export const ContentTypeBuilder: React.FC<Props> = ({ contentTypes, onRefresh }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ContentTypeDTO | null>(null);

  const [typeName, setTypeName] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [fields, setFields] = useState<ContentFieldSchema[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingType(null);
    setTypeName('');
    setRequiresApproval(false);
    setFields([
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả', type: 'richtext', required: false },
    ]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (ct: ContentTypeDTO) => {
    setEditingType(ct);
    setTypeName(ct.name);
    setRequiresApproval(ct.requires_approval);
    setFields([...(ct.field_schema || [])]);
    setError(null);
    setModalOpen(true);
  };

  const handleAddField = () => {
    const newIdx = fields.length + 1;
    setFields((prev) => [
      ...prev,
      {
        key: `field_${newIdx}`,
        label: `Trường dữ liệu ${newIdx}`,
        type: 'text',
        required: false,
      },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateField = (index: number, patch: Partial<ContentFieldSchema>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  };

  const handleSave = async () => {
    if (!typeName.trim()) {
      setError('Vui lòng nhập tên loại nội dung');
      return;
    }
    if (fields.length === 0) {
      setError('Cần ít nhất 1 trường dữ liệu');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editingType) {
        await cmsService.updateContentType(undefined, editingType.id, {
          name: typeName,
          requires_approval: requiresApproval,
          field_schema: fields,
        });
      } else {
        await cmsService.createContentType(undefined, {
          name: typeName,
          requires_approval: requiresApproval,
          field_schema: fields,
        });
      }
      await onRefresh();
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu Content Type');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa loại dữ liệu "${name}"? Toàn bộ bản ghi của loại này sẽ bị xóa.`)) {
      return;
    }
    try {
      await cmsService.deleteContentType(undefined, id);
      await onRefresh();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1F1E1B' }}>
            Cấu Trúc Dữ Liệu (Content Types)
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B6A63' }}>
            Định nghĩa các loại bảng dữ liệu động cho website (Thực đơn, Tin tức, Sản phẩm, Banner...)
          </p>
        </div>
        <button onClick={handleOpenCreate} style={btnPrimaryStyle}>
          + Tạo Loại Dữ Liệu Mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {contentTypes.map((ct) => (
          <div key={ct.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1F1E1B' }}>
                  {ct.name}
                </h3>
                <span style={{ fontSize: '12px', color: '#9E9D95', fontFamily: 'monospace' }}>
                  ID: {ct.id.slice(0, 8)}...
                </span>
              </div>
              {ct.requires_approval && (
                <span style={badgeApprovalStyle}>Yêu cầu duyệt</span>
              )}
            </div>

            <div style={{ borderTop: '1px solid #E4E2DC', paddingTop: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B6A63', marginBottom: '8px' }}>
                Danh sách trường ({ct.field_schema?.length || 0}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(ct.field_schema || []).map((f) => (
                  <span key={f.key} style={fieldTagStyle}>
                    {f.label} <code style={{ fontSize: '11px', color: '#888' }}>({f.type})</code>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => handleOpenEdit(ct)} style={btnSmallSecondary}>
                ✏️ Chỉnh sửa
              </button>
              <button onClick={() => handleDelete(ct.id, ct.name)} style={btnSmallDanger}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tạo/Sửa Content Type */}
      {modalOpen && (
        <div style={backdropStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                {editingType ? 'Chỉnh Sửa Loại Dữ Liệu' : 'Tạo Loại Dữ Liệu Mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={closeBtnStyle}>✕</button>
            </div>

            {error && <div style={errorStyle}>{error}</div>}

            <div style={bodyStyle}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Tên loại nội dung *</label>
                <input
                  type="text"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="Ví dụ: Thực đơn món ăn, Bài viết tin tức..."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#2F6F4F' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1B' }}>
                    Yêu cầu Designer / Admin phê duyệt trước khi xuất bản
                  </span>
                </label>
              </div>

              <div style={{ borderTop: '1px solid #E4E2DC', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1F1E1B' }}>
                    Cấu Trúc Các Trường (Field Schema)
                  </h4>
                  <button onClick={handleAddField} style={btnAddFieldStyle}>
                    + Thêm Trường
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {fields.map((field, idx) => (
                    <div key={idx} style={fieldRowStyle}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#6B6A63', display: 'block', marginBottom: '3px' }}>
                          Mã trường (Key)
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => handleUpdateField(idx, { key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          style={smallInputStyle}
                          placeholder="title, price..."
                        />
                      </div>
                      <div style={{ flex: 1.5 }}>
                        <label style={{ fontSize: '11px', color: '#6B6A63', display: 'block', marginBottom: '3px' }}>
                          Tên hiển thị (Label)
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateField(idx, { label: e.target.value })}
                          style={smallInputStyle}
                          placeholder="Tiêu đề, Giá tiền..."
                        />
                      </div>
                      <div style={{ flex: 1.3 }}>
                        <label style={{ fontSize: '11px', color: '#6B6A63', display: 'block', marginBottom: '3px' }}>
                          Kiểu dữ liệu
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, { type: e.target.value as FieldType })}
                          style={smallInputStyle}
                        >
                          {FIELD_TYPES.map((ft) => (
                            <option key={ft.type} value={ft.type}>{ft.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '16px', gap: '4px' }}>
                        <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                          />
                          Bắt buộc
                        </label>
                        <button
                          onClick={() => handleRemoveField(idx)}
                          style={{ background: 'none', border: 'none', color: '#B3261E', cursor: 'pointer', fontSize: '16px', marginLeft: '6px' }}
                          title="Xóa trường"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={footerStyle}>
              <button onClick={() => setModalOpen(false)} disabled={saving} style={btnSecondaryStyle}>
                Hủy Bỏ
              </button>
              <button onClick={handleSave} disabled={saving} style={btnPrimaryStyle}>
                {saving ? 'Đang lưu...' : 'Lưu Cấu Trúc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E4E2DC',
  borderRadius: '10px',
  padding: '18px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const badgeApprovalStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: '999px',
  backgroundColor: '#FEF3C7',
  color: '#92400E',
};

const fieldTagStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '3px 8px',
  borderRadius: '4px',
  backgroundColor: '#F3F4F6',
  color: '#374151',
  border: '1px solid #E5E7EB',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '9px 18px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#2F6F4F',
  color: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const btnSmallSecondary: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid #E4E2DC',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
};

const btnSmallDanger: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid #FCA5A5',
  backgroundColor: '#FFF5F5',
  color: '#B91C1C',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500,
};

const btnAddFieldStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid #2F6F4F',
  backgroundColor: '#EBF4F0',
  color: '#2F6F4F',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
};

const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  width: '680px',
  maxWidth: '92vw',
  maxHeight: '88vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
};

const headerStyle: React.CSSProperties = {
  padding: '18px 24px',
  borderBottom: '1px solid #E4E2DC',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#6B6A63',
};

const bodyStyle: React.CSSProperties = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
};

const footerStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '1px solid #E4E2DC',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  backgroundColor: '#F9F8F6',
  borderBottomLeftRadius: '12px',
  borderBottomRightRadius: '12px',
};

const btnSecondaryStyle: React.CSSProperties = {
  padding: '9px 16px',
  borderRadius: '6px',
  border: '1px solid #E4E2DC',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '14px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#1F1E1B',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #E4E2DC',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const smallInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '4px',
  border: '1px solid #E4E2DC',
  fontSize: '13px',
  boxSizing: 'border-box',
};

const fieldRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  alignItems: 'flex-start',
  padding: '10px',
  backgroundColor: '#F9F8F6',
  borderRadius: '6px',
  border: '1px solid #EAE8E3',
};

const errorStyle: React.CSSProperties = {
  margin: '12px 24px 0',
  padding: '10px 14px',
  backgroundColor: '#FEE2E2',
  color: '#B91C1C',
  borderRadius: '6px',
  fontSize: '13px',
};
