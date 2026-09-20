import React, { useState, useEffect, useMemo } from 'react';
import { ContentTypeDTO, ContentItemDTO, ContentFieldSchema } from '@t-business/shared-types';
import { Sparkles, Loader2, X } from 'lucide-react';

interface Props {
  contentType: ContentTypeDTO;
  initialItem?: ContentItemDTO | null;
  onClose: () => void;
  onSave: (fields: Record<string, unknown>, status: 'draft' | 'published') => Promise<void>;
}

export const DynamicItemModal: React.FC<Props> = ({
  contentType,
  initialItem,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialItem?.fields ? { ...initialItem.fields } : {}
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSummarizing, setAiSummarizing] = useState(false);

  // Cập nhật formData khi initialItem thay đổi
  useEffect(() => {
    setFormData(initialItem?.fields ? { ...initialItem.fields } : {});
  }, [initialItem]);

  // Parse an toàn field_schema
  const fields: ContentFieldSchema[] = useMemo(() => {
    let schema: any = contentType?.field_schema;
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch {
        schema = [];
      }
    }
    if (Array.isArray(schema) && schema.length > 0) {
      return schema;
    }
    // Fallback mặc định nếu loại nội dung chưa khai báo schema
    return [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'description', label: 'Mô tả / Nội dung', type: 'richtext', required: false },
    ];
  }, [contentType]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAiSummarize = async (targetKey: string) => {
    const sourceText =
      formData.content ||
      formData.body ||
      formData.description ||
      formData.title ||
      Object.values(formData).filter((v) => typeof v === 'string').join(' ');

    if (!sourceText || sourceText.trim().length < 10) {
      setError('Vui lòng nhập nội dung chi tiết bài viết / sản phẩm trước khi yêu cầu AI tóm tắt.');
      return;
    }

    setAiSummarizing(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:4000/v1/ai/suggest/excerpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: sourceText,
          language: 'vi',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.excerpt) {
          handleFieldChange(targetKey, data.excerpt);
        }
      }
    } catch (err: any) {
      setError('Lỗi khi gọi AI tóm tắt: ' + err.message);
    } finally {
      setAiSummarizing(false);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    // Validate required fields
    for (const f of fields) {
      if (f.required && (formData[f.key] === undefined || formData[f.key] === '')) {
        setError(`Vui lòng nhập trường bắt buộc: "${f.label || f.key}"`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(formData, status);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const renderFieldInput = (field: ContentFieldSchema) => {
    const val = formData[field.key] ?? '';
    const fieldType = (field.type || 'text').toLowerCase();
    const isExcerptField = field.key.includes('excerpt') || field.key.includes('summary') || field.key === 'description';

    switch (fieldType) {
      case 'textarea':
      case 'richtext':
        return (
          <div>
            {isExcerptField && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleAiSummarize(field.key)}
                  disabled={aiSummarizing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#F5F3FF',
                    color: '#6B4EFF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  title="Gemini 2.5 Flash tự động tóm tắt từ nội dung chi tiết"
                >
                  {aiSummarizing ? (
                    <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>AI Tóm Tắt (Gemini)</span>
                </button>
              </div>
            )}
            <textarea
              value={val}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              rows={fieldType === 'textarea' ? 3 : 5}
              style={inputStyle}
              placeholder={`Nhập ${field.label.toLowerCase()}...`}
            />
          </div>
        );
      case 'number':
        return (
          <input
            type="number"
            value={val}
            onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
            style={inputStyle}
            placeholder="0"
          />
        );
      case 'boolean':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '6px 0' }}>
            <input
              type="checkbox"
              checked={Boolean(formData[field.key])}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2F6F4F' }}
            />
            <span style={{ fontSize: '14px', color: '#1F1E1B' }}>
              {formData[field.key] ? 'Bật (Có)' : 'Tắt (Không)'}
            </span>
          </label>
        );
      case 'date':
        return (
          <input
            type="date"
            value={val}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            style={inputStyle}
          />
        );
      case 'image':
        return (
          <div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={val}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                style={inputStyle}
                placeholder="https://images.unsplash.com/... hoặc đường dẫn ảnh"
              />
            </div>
            {val && (
              <div style={{ marginTop: '8px' }}>
                <img
                  src={val}
                  alt="Xem trước ảnh"
                  style={{
                    maxWidth: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #E6E4DF',
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <input
            type="text"
            value={val}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            style={inputStyle}
            placeholder={`Nhập ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E6E4DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAF8',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1F1E1B' }}>
              {initialItem ? '✏️ Chỉnh Sửa Bản Ghi' : '➕ Thêm Bản Ghi Mới'}
            </h2>
            <p style={{ fontSize: '12px', color: '#6B6A63', margin: '2px 0 0 0' }}>
              Loại nội dung: <strong>{contentType.name}</strong>
              {contentType.requires_approval && (
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                  }}
                >
                  Yêu cầu duyệt
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6B6A63',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#991B1B',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {fields.map((field) => (
            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#1F1E1B' }}>
                {field.label || field.key}
                {field.required && <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>}
                <span style={{ fontSize: '11px', color: '#9E9D95', fontWeight: 400, marginLeft: '6px' }}>
                  ({field.type || 'text'})
                </span>
              </label>
              {renderFieldInput(field)}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E6E4DF',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#FAFAF8',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #E4E2DC',
              backgroundColor: '#FFFFFF',
              color: '#1F1E1B',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #E4E2DC',
              backgroundColor: '#FFFFFF',
              color: '#B7791F',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {saving ? 'Đang lưu...' : 'Lưu Bản Nháp'}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            style={{
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2F6F4F',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(47, 111, 79, 0.2)',
            }}
          >
            {saving ? 'Đang lưu...' : 'Xuất Bản Ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #E4E2DC',
  fontSize: '14px',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  color: '#1F1E1B',
  boxSizing: 'border-box',
};
