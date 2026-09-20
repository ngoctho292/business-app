import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { Sparkles, X, Loader2, Check, Copy, Globe, Search } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSeoModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { blocks, slug, domain, seoMeta, updateSeoMeta } = useCanvasStore();

  const [title, setTitle] = useState(seoMeta?.title || '');
  const [description, setDescription] = useState(seoMeta?.description || '');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Extract content from blocks
  const extractPageContent = () => {
    return blocks
      .map((b) => {
        const p = b.props as any;
        return [p.text, p.richtext, p.label, p.alt].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join('\n');
  };

  const handleGenerateSeo = async () => {
    setLoading(true);
    setSaved(false);
    const content = extractPageContent();

    try {
      const res = await fetch('http://localhost:4000/v1/ai/suggest/seo-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_content: content || `Trang web thương hiệu ${domain} - Đường dẫn /${slug}`,
          language: 'vi',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTitle(data.title_suggestion || '');
        setDescription(data.meta_description || '');
      }
    } catch (err) {
      console.error('Error generating SEO meta:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (seoMeta?.title) setTitle(seoMeta.title);
      if (seoMeta?.description) setDescription(seoMeta.description);
      if (!title && !seoMeta?.title) {
        handleGenerateSeo();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const titleLength = title.length;
  const descLength = description.length;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSeoMeta({ title, description });
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err) {
      console.error('Lỗi khi lưu SEO Meta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Title: ${title}\nMeta Description: ${description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 10000,
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
          maxWidth: '750px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#16A34A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#14532D' }}>
                  Tối Ưu Hóa SEO Bằng AI (SEO Meta Suggester)
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#15803D',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  Gemini 2.5 Flash
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#166534', margin: '2px 0 0 0' }}>
                Tự động phân tích nội dung trang và tối ưu hóa thứ hạng tìm kiếm trên Google.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#166534',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Google SERP Preview Card */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
              <Search size={14} style={{ color: '#4285F4' }} />
              <span>Xem trước kết quả trên Google Tìm Kiếm (SERP Live Preview):</span>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {/* Google Breadcrumb / URL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={11} style={{ color: '#6B7280' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#202124' }}>
                  {domain} <span style={{ color: '#5F6368' }}>› {slug}</span>
                </div>
              </div>

              {/* Google Title */}
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 400,
                  color: '#1a0dab',
                  lineHeight: '1.3',
                  margin: '0 0 4px 0',
                  cursor: 'pointer',
                }}
              >
                {loading ? 'Đang phân tích tiêu đề tối ưu...' : title || 'Tiêu đề trang web'}
              </h3>

              {/* Google Meta Description */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#4d5156',
                  lineHeight: '1.4',
                  margin: 0,
                }}
              >
                {loading
                  ? 'Gemini 2.5 Flash đang đọc nội dung trang và sinh thẻ mô tả chuẩn SEO...'
                  : description || 'Thẻ mô tả trang web hiển thị trên Google.'}
              </p>
            </div>
          </div>

          {/* Form Inputs & Character Counter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Title Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Tiêu đề SEO (Title Tag)
                </label>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: titleLength >= 40 && titleLength <= 60 ? '#16A34A' : titleLength > 60 ? '#DC2626' : '#D97706',
                  }}
                >
                  {titleLength} / 60 ký tự ({titleLength >= 40 && titleLength <= 60 ? 'Hoàn hảo' : titleLength > 60 ? 'Quá dài' : 'Hơi ngắn'})
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Description Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Thẻ mô tả SEO (Meta Description)
                </label>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: descLength >= 120 && descLength <= 160 ? '#16A34A' : descLength > 160 ? '#DC2626' : '#D97706',
                  }}
                >
                  {descLength} / 160 ký tự ({descLength >= 120 && descLength <= 160 ? 'Tối ưu' : descLength > 160 ? 'Quá dài' : 'Hơi ngắn'})
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFAF8',
          }}
        >
          <button
            onClick={handleGenerateSeo}
            disabled={loading}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '12px',
              color: '#15803D',
              borderColor: '#BBF7D0',
            }}
          >
            {loading ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Sinh lại bằng AI</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '12px',
              }}
            >
              {copied ? <Check size={14} style={{ color: '#16A34A' }} /> : <Copy size={14} />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handleSave}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#16A34A',
                borderColor: '#15803D',
              }}
            >
              {saved ? <Check size={15} /> : <Check size={15} />}
              <span>{saved ? 'Đã áp dụng!' : 'Áp Dụng SEO'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
