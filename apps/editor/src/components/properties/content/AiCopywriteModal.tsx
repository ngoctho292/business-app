import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, Wand2, Copy } from 'lucide-react';
import { useCanvasStore } from '../../../store/canvasStore';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  fieldType: 'heading' | 'text' | 'button' | 'about_story' | 'slogan';
  currentValue?: string;
  onApply: (content: string) => void;
  title?: string;
}

interface Suggestion {
  id: string;
  label: string;
  content: string;
  description?: string;
}

const INDUSTRIES = [
  { id: 'restaurant', label: '🍽️ Ẩm thực & Nhà hàng / Cafe' },
  { id: 'spa_beauty', label: '💆 Spa & Thẩm mỹ viện' },
  { id: 'real_estate', label: '🏠 Bất động sản & Xây dựng' },
  { id: 'fashion', label: '👗 Thời trang & Phong cách' },
  { id: 'tech', label: '💻 Công nghệ & Phần mềm' },
  { id: 'education', label: '📚 Giáo dục & Đào tạo' },
  { id: 'healthcare', label: '🏥 Y tế & Sức khỏe' },
  { id: 'general', label: '💼 Doanh nghiệp & Dịch vụ' },
];

const TONES = [
  { id: 'luxury', label: '💎 Sang trọng & Đẳng cấp', desc: 'Tinh tế, lịch lãm, tôn vinh vị thế khách hàng' },
  { id: 'friendly', label: '🤝 Thân thiện & Ấm áp', desc: 'Gần gũi, chân thành, dễ kết nối' },
  { id: 'professional', label: '💼 Chuyên nghiệp & Uy tín', desc: 'Chuẩn mực, đáng tin cậy cho khách hàng B2B' },
  { id: 'urgent_sale', label: '🔥 Khuyến mãi & Giục giã', desc: 'Thôi thúc chốt đơn, nhấn mạnh ưu đãi giới hạn' },
];

export const AiCopywriteModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fieldType,
  currentValue = '',
  onApply,
  title,
}) => {
  const { domain } = useCanvasStore();
  const [industry, setIndustry] = useState('restaurant');
  const [tone, setTone] = useState('luxury');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const modalTitle =
    title ||
    (fieldType === 'heading'
      ? '✨ AI Gợi Ý Tiêu Đề Hấp Dẫn'
      : fieldType === 'button'
      ? '✨ AI Gợi Ý Lời Kêu Gọi Hành Động (CTA)'
      : '✨ Trợ Lý Sáng Tạo Nội Dung AI (Copywriter)');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/v1/ai/copywrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_type: fieldType,
          industry,
          tone,
          keywords: keywords.trim(),
          existing_text: currentValue,
          site_name: domain || 'Doanh nghiệp',
        }),
      });

      if (!res.ok) throw new Error('Không thể kết nối tới dịch vụ AI');
      const data = await res.json();
      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gọi AI Copywriter');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
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
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAF5FF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#F3E8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7E22CE',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#581C87' }}>
                {modalTitle}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#7E22CE' }}>
                Sử dụng Gemini Flash AI sinh nội dung chuẩn tiếng Việt — 0đ chi phí
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#6B7280',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1. Chọn Ngành Nghề */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Ngành nghề của website
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: industry === ind.id ? 600 : 400,
                    border: industry === ind.id ? '1px solid #7E22CE' : '1px solid #E5E7EB',
                    backgroundColor: industry === ind.id ? '#F3E8FF' : '#FFFFFF',
                    color: industry === ind.id ? '#6B21A8' : '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chọn Giọng Điệu (Tone) */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Sắc thái & giọng điệu thương hiệu
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: tone === t.id ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                    backgroundColor: tone === t.id ? '#FAF5FF' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: tone === t.id ? '#6B21A8' : '#1F2937' }}>
                    {t.label}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '2px' }}>
                    {t.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Từ Khóa / Điểm Nhấn */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
              Từ khóa hoặc điểm nhấn bạn muốn đưa vào (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Vd: 30 năm gia truyền, hải sản tươi sống trong ngày, giảm 20% đặt bàn online..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Nút Kích Hoạt Sinh Nội Dung */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#7E22CE',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Đang sáng tạo 3 phương án...
              </>
            ) : (
              <>
                <Wand2 size={16} /> Bấm Để Sinh 3 Phương Án Bằng AI
              </>
            )}
          </button>

          {/* Danh Sách 3 Gợi Ý */}
          {suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>
                🎉 Chọn 1 phương án bạn ưng ý nhất:
              </div>
              {suggestions.map((sug) => (
                <div
                  key={sug.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C084FC';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: '#F3E8FF',
                        color: '#7E22CE',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {sug.label}
                    </span>
                    <button
                      onClick={() => handleCopy(sug.id, sug.content)}
                      title="Sao chép vào bộ nhớ tạm"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedId === sug.id ? '#16A34A' : '#9CA3AF',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      {copiedId === sug.id ? (
                        <>
                          <Check size={13} /> Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy size={13} /> Copy
                        </>
                      )}
                    </button>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: 500,
                      color: '#1F2937',
                      lineHeight: '1.5',
                    }}
                  >
                    &ldquo;{sug.content}&rdquo;
                  </p>

                  {sug.description && (
                    <div style={{ fontSize: '11px', color: '#6B7280', fontStyle: 'italic' }}>
                      💡 {sug.description}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      onClick={() => {
                        onApply(sug.content);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        backgroundColor: '#7E22CE',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Check size={13} strokeWidth={2.5} /> Sử dụng gợi ý này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
