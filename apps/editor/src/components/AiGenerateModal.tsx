import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { Sparkles, X, Wand2, Loader2, CheckCircle, ArrowRight, Paperclip, FolderOpen, Trash2 } from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  {
    title: '🍲 Nhà Hàng Lẩu & Nướng',
    prompt: 'Nhà hàng Lẩu Nấm & Buffet Nướng Hoàng Gia tại Hà Nội, không gian ấm cúng sang trọng, có thực đơn món ăn và đặt bàn online',
  },
  {
    title: '☕ Quán Cafe & Trà Sữa',
    prompt: 'Quán The Coffee House phong cách tối giản Nhật Bản, có menu đồ uống đặc sắc, không gian làm việc yên tĩnh và đặt giao hàng tận nơi',
  },
  {
    title: '🍰 Tiệm Bánh & Tráng Miệng',
    prompt: 'Tiệm bánh ngọt Pháp Artisan Bakery, chuyên bánh kem sinh nhật, bánh mì sourdough và trà chiều cao cấp, có form đặt bánh trước',
  },
  {
    title: '🌿 Spa & Chăm Sóc Sức Khỏe',
    prompt: 'Trung tâm Trị Liệu & Dưỡng Sinh Đông Y An Nhiên, các gói massage thảo mộc, xông hơi đá muối và đăng ký tư vấn trực tuyến',
  },
];

/**
 * Hàm nén và resize ảnh trên trình duyệt bằng Canvas (Client-side Compression)
 * Giảm dung lượng từ 5-15MB xuống chỉ còn ~80-150KB mà vẫn sắc nét cho AI Vision
 */
const compressImage = (
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<{ dataUrl: string; sizeKb: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: '', sizeKb: 0 });
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const sizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);
      resolve({ dataUrl, sizeKb });
    };
    img.onerror = (err) => reject(err);
    img.src = objectUrl;
  });
};

export const AiGenerateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setBlocks, pageId, siteId } = useCanvasStore();
  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset khi đóng mở
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setAiSummary(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Xử lý nén ảnh file tải lên hoặc dán từ clipboard
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, WEBP, GIF)');
      return;
    }

    setError(null);
    setCompressing(true);

    try {
      const { dataUrl, sizeKb } = await compressImage(file);
      setImageBase64(dataUrl);
      setImageUrl(null); // Ưu tiên ảnh base64 vừa nén
      setImageName(file.name || 'Ảnh chụp màn hình');
      setImageSize(`${sizeKb} KB (Đã tối ưu)`);
    } catch (err: any) {
      setError('Không thể xử lý hình ảnh này. Hãy thử ảnh khác.');
    } finally {
      setCompressing(false);
    }
  };

  // Bắt sự kiện dán ảnh từ Clipboard (Ctrl + V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          processImageFile(blob);
          e.preventDefault();
          break;
        }
      }
    }
  };

  // Kéo thả ảnh vào khung
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Chọn ảnh từ Thư viện Media có sẵn
  const handleSelectFromMediaLibrary = (url: string) => {
    setImageUrl(url);
    setImageBase64(null); // Dùng URL trực tiếp, không dùng base64
    const filename = url.split('/').pop() || 'Ảnh từ Thư viện Media';
    setImageName(filename);
    setImageSize('Thư viện Media');
    setMediaPickerOpen(false);
    setError(null);
  };

  const handleGenerate = async (customPrompt?: string) => {
    const textToUse = customPrompt !== undefined ? customPrompt : prompt;
    if (!textToUse.trim() && !imageBase64 && !imageUrl) {
      setError('Vui lòng nhập mô tả ý tưởng hoặc chọn ảnh mẫu.');
      return;
    }

    setLoading(true);
    setError(null);
    setAiSummary(null);

    try {
      const res = await fetch('http://localhost:4000/v1/ai/generate-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse.trim(),
          image_base64: imageBase64 || undefined,
          image_url: imageUrl || undefined,
          page_id: pageId,
        }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi kết nối máy chủ AI [${res.status}]`);
      }

      const data = await res.json();
      if (!data.blocks || data.blocks.length === 0) {
        throw new Error('Không nhận được danh sách khối giao diện từ AI');
      }

      setAiSummary(data.summary);

      // Nạp các blocks do AI sinh ra vào Canvas
      const blocksWithIds = data.blocks.map((b: any, idx: number) => ({
        ...b,
        id: `ai-${Date.now()}-${idx}`,
        order_index: idx,
      }));

      setTimeout(() => {
        setBlocks(blocksWithIds);
        setLoading(false);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Không thể sinh giao diện AI vào lúc này.');
      setLoading(false);
    }
  };

  const hasAttachedImage = imageBase64 !== null || imageUrl !== null;
  const currentPreviewSrc = imageBase64 || imageUrl;
  const hasInput = prompt.trim().length > 0 || hasAttachedImage;

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(107, 78, 255, 0.25)',
          border: '1px solid rgba(107, 78, 255, 0.2)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#6B4EFF',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(107, 78, 255, 0.3)',
              }}
            >
              <Wand2 size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#4C1D95' }}>
                  AI Tạo Giao Diện Web Thông Minh
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  Multimodal Gemini Flash
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#6D28D9', margin: '2px 0 0 0' }}>
                Gõ ý tưởng, chọn từ Thư viện Media hoặc dán ảnh chụp màn hình (hỗ trợ <strong>Ctrl + V</strong>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6D28D9',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
          onPaste={handlePaste}
        >
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '13px', color: '#991B1B' }}>
              ⚠️ {error}
            </div>
          )}

          {aiSummary && (
            <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>{aiSummary}</span>
            </div>
          )}

          {/* Unified Smart Input Card (Textarea + Attach Image + Drag & Drop) */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '12px',
              border: isDragging ? '2px dashed #6B4EFF' : '1.5px solid #DDD6FE',
              backgroundColor: isDragging ? '#F5F3FF' : '#FFFFFF',
              boxShadow: '0 2px 8px rgba(107, 78, 255, 0.05)',
              overflow: 'hidden',
              transition: 'all 0.15s ease',
            }}
          >
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder={
                hasAttachedImage
                  ? 'Ghi chú thêm cho ảnh này (Tùy chọn): Vd: Giữ nguyên bố cục ảnh nhưng đổi màu sang xanh lá và nội dung cho tiệm trà sữa...'
                  : 'Mô tả ý tưởng trang web của bạn hoặc dán ảnh chụp màn hình vào đây (Ctrl + V)... Vd: Quán Cafe phong cách mộc mạc ấm áp...'
              }
              style={{
                width: '100%',
                padding: '14px 16px',
                border: 'none',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                boxSizing: 'border-box',
              }}
            />

            {/* Thumbnail Preview nếu có ảnh đính kèm */}
            {hasAttachedImage && currentPreviewSrc && (
              <div
                style={{
                  margin: '0 16px 12px 16px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #E9D5FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={currentPreviewSrc}
                    alt="Ảnh mẫu đính kèm"
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #DDD6FE',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4C1D95' }}>
                      📸 {imageName || 'Ảnh mẫu'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#7C3AED', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{imageSize}</span>
                      <span>•</span>
                      <span>Gemini Vision sẽ phân tích bố cục từ ảnh này</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setImageBase64(null);
                    setImageUrl(null);
                    setImageName(null);
                    setImageSize(null);
                  }}
                  disabled={loading}
                  title="Gỡ bỏ ảnh này"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Bottom Toolbar of the Input Box */}
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: '#FBFBFB',
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Nút 1: Chọn từ Thư viện Media có sẵn */}
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #7E22CE',
                    backgroundColor: '#FAF5FF',
                    color: '#6B21A8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FolderOpen size={14} />
                  <span>📁 Thư Viện Media</span>
                </button>

                {/* Nút 2: Tải ảnh trực tiếp từ máy tính */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processImageFile(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || compressing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#4B5563',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {compressing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang tối ưu...
                    </>
                  ) : (
                    <>
                      <Paperclip size={14} /> Tải Ảnh Lên
                    </>
                  )}
                </button>
              </div>

              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                💡 Hỗ trợ dán ảnh nhanh bằng phím <strong>Ctrl + V</strong>
              </span>
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              💡 Hoặc bấm chọn nhanh các mẫu ý tưởng doanh nghiệp:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(qp.prompt);
                    handleGenerate(qp.prompt);
                  }}
                  disabled={loading}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B21B6', marginBottom: '2px' }}>
                    {qp.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7C3AED', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {qp.prompt}
                  </div>
                </button>
              ))}
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
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Hỗ trợ bởi <strong>Google Gemini Flash Multimodal</strong> (0 VNĐ chi phí)
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              disabled={loading}
              className="btn"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Hủy
            </button>
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !hasInput}
              className="btn"
              style={{
                backgroundColor: '#6B4EFF',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading || !hasInput ? 0.65 : 1,
                cursor: loading || !hasInput ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(107, 78, 255, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>
                    {hasAttachedImage ? 'Gemini Vision đang phân tích ảnh & dựng website...' : 'Gemini Flash đang sinh trang...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>{hasAttachedImage ? 'Phân Tích Ảnh & Dựng Website' : 'Sinh Giao Diện AI'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tích hợp MediaLibraryModal để chọn ảnh từ thư viện */}
      {mediaPickerOpen && siteId && (
        <MediaLibraryModal
          siteId={siteId}
          imagesOnly={true}
          onSelect={handleSelectFromMediaLibrary}
          onClose={() => setMediaPickerOpen(false)}
        />
      )}
    </div>
  );
};
