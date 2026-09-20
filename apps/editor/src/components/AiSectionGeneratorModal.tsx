import React, { useState, useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { Sparkles, X, Loader2, CheckCircle, ArrowRight, Paperclip, FolderOpen, Trash2, LayoutTemplate } from 'lucide-react';
import { MediaLibraryModal } from './MediaLibraryModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_CATEGORIES = [
  { id: 'hero', label: '🌟 Hero Banner', hint: 'Tiêu đề lớn, slogan, nút kêu gọi hành động CTA và hình ảnh nổi bật' },
  { id: 'features', label: '💎 Tính Năng / Lợi Thế', hint: 'Tiêu đề, các khối biểu tượng (Icon Solar) và mô tả điểm mạnh' },
  { id: 'pricing', label: '🏷️ Bảng Giá Gói Dịch Vụ', hint: 'Các gói giá, tính năng đi kèm và nút mua hàng / đăng ký' },
  { id: 'testimonials', label: '💬 Đánh Giá Khách Hàng', hint: 'Cảm nhận của khách hàng, đánh giá 5 sao và tên người đánh giá' },
  { id: 'team', label: '👥 Đội Ngũ Nhân Sự', hint: 'Hình ảnh nhân sự, chức danh và lời giới thiệu chuyên môn' },
  { id: 'contact', label: '📞 Liên Hệ & Đặt Chỗ', hint: 'Biểu mẫu điền thông tin khách hàng và nút gửi' },
  { id: 'custom', label: '⚙️ Section Tùy Chỉnh', hint: 'Dựng chính xác theo bố cục ảnh chụp màn hình mẫu' },
];

/**
 * Hàm nén ảnh Client-side bằng Canvas (giảm dung lượng < 120KB)
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

export const AiSectionGeneratorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { siteId, domain, selectedBlockId, appendBlocks, loadCustomBlocks, blocks } = useCanvasStore();

  const [category, setCategory] = useState('features');
  const [prompt, setPrompt] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);

  const [insertPosition, setInsertPosition] = useState<'end' | 'after_selected'>('end');
  const [saveToLibrary, setSaveToLibrary] = useState(true);
  const [customBlockName, setCustomBlockName] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successSummary, setSuccessSummary] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessSummary(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Xử lý nén ảnh tải lên hoặc dán từ clipboard
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP)');
      return;
    }

    setError(null);
    setCompressing(true);

    try {
      const { dataUrl, sizeKb } = await compressImage(file);
      setImageBase64(dataUrl);
      setImageUrl(null);
      setImageName(file.name || 'Ảnh chụp section');
      setImageSize(`${sizeKb} KB (Đã tối ưu)`);
    } catch {
      setError('Không thể xử lý hình ảnh này. Hãy thử ảnh khác.');
    } finally {
      setCompressing(false);
    }
  };

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFromMediaLibrary = (url: string) => {
    setImageUrl(url);
    setImageBase64(null);
    const filename = url.split('/').pop() || 'Ảnh từ Thư viện Media';
    setImageName(filename);
    setImageSize('Thư viện Media');
    setMediaPickerOpen(false);
    setError(null);
  };

  const handleGenerateAndInsert = async () => {
    if (!prompt.trim() && !imageBase64 && !imageUrl) {
      setError('Vui lòng nhập mô tả ý tưởng hoặc chọn ảnh chụp section mẫu.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessSummary(null);

    try {
      const res = await fetch('http://localhost:4000/v1/ai/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_type: category,
          prompt: prompt.trim(),
          image_base64: imageBase64 || undefined,
          image_url: imageUrl || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Lỗi từ máy chủ AI [${res.status}]`);
      }

      const data = await res.json();
      if (!data.blocks || data.blocks.length === 0) {
        throw new Error('Không nhận được danh sách khối từ AI');
      }

      // Vị trí chèn
      const insertAfterId = insertPosition === 'after_selected' && selectedBlockId ? selectedBlockId : undefined;
      appendBlocks(data.blocks, insertAfterId);

      // Tùy chọn: Lưu vào Thư viện Block của Site
      if (saveToLibrary && siteId) {
        const blockName =
          customBlockName.trim() ||
          `${SECTION_CATEGORIES.find((c) => c.id === category)?.label.replace(/^[^\s]+\s/, '') || 'Section'} (${new Date().toLocaleDateString('vi-VN')})`;

        try {
          await fetch(`http://localhost:4000/v1/sites/${siteId}/custom-blocks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: blockName,
              category,
              block_nodes: data.blocks,
            }),
          });
          loadCustomBlocks(siteId);
        } catch (saveErr) {
          console.warn('Lỗi khi lưu vào Thư viện Block của Site:', saveErr);
        }
      }

      setSuccessSummary(data.summary || 'Đã chèn Section thành công vào trang!');

      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Không thể sinh Section vào lúc này.');
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
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(126, 34, 206, 0.25)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(126, 34, 206, 0.3)',
              }}
            >
              <LayoutTemplate size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: '#581C87' }}>
                  AI Sinh Section Mẫu (Từ Ảnh Chụp / Mô Tả)
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: '#7E22CE',
                    color: '#FFFFFF',
                    padding: '2px 7px',
                    borderRadius: '8px',
                  }}
                >
                  Section Clone
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#7E22CE', margin: '2px 0 0 0' }}>
                Chụp ảnh 1 section bạn thích hoặc mô tả, AI sẽ dựng lại và chèn trực tiếp vào trang hiện tại
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
              color: '#7E22CE',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
          onPaste={handlePaste}
        >
          {error && (
            <div style={{ padding: '10px 14px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', fontSize: '13px', color: '#991B1B' }}>
              ⚠️ {error}
            </div>
          )}

          {successSummary && (
            <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>{successSummary}</span>
            </div>
          )}

          {/* 1. Chọn loại Section */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>
              1. Chọn phân loại Section mong muốn:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SECTION_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #7E22CE' : '1px solid #E5E7EB',
                      backgroundColor: isSelected ? '#FAF5FF' : '#FFFFFF',
                      color: isSelected ? '#6B21A8' : '#4B5563',
                      fontSize: '12px',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', fontStyle: 'italic' }}>
              💡 {SECTION_CATEGORIES.find((c) => c.id === category)?.hint}
            </div>
          </div>

          {/* 2. Khung đính kèm ảnh & nhập mô tả */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#4B5563', marginBottom: '8px' }}>
              2. Đính kèm ảnh chụp Section mẫu và/hoặc mô tả nội dung:
            </label>
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
                border: isDragging ? '2px dashed #7E22CE' : '1.5px solid #DDD6FE',
                backgroundColor: isDragging ? '#FAF5FF' : '#FFFFFF',
                boxShadow: '0 2px 6px rgba(126, 34, 206, 0.04)',
                overflow: 'hidden',
              }}
            >
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                placeholder={
                  hasAttachedImage
                    ? 'Ghi chú thêm cho ảnh section này (Tùy chọn): Vd: Bố cục giống ảnh nhưng đổi màu sang xanh ngọc và đổi chữ thành...'
                    : 'Nhập mô tả ý tưởng cho section này hoặc dán ảnh chụp màn hình vào đây (Ctrl + V)...'
                }
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: 'none',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.5',
                  boxSizing: 'border-box',
                }}
              />

              {/* Thumbnail nếu có ảnh */}
              {hasAttachedImage && currentPreviewSrc && (
                <div
                  style={{
                    margin: '0 14px 10px 14px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    border: '1px solid #E9D5FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={currentPreviewSrc}
                      alt="Preview"
                      style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#581C87' }}>
                        📸 {imageName || 'Ảnh section'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#7E22CE' }}>
                        {imageSize} • Gemini Vision sẽ dựng lại section này
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
                    title="Gỡ ảnh"
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#F9FAFB',
                  borderTop: '1px solid #F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #7E22CE',
                      backgroundColor: '#FAF5FF',
                      color: '#6B21A8',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <FolderOpen size={13} /> Thư Viện Media
                  </button>

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
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      backgroundColor: '#FFFFFF',
                      color: '#4B5563',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {compressing ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />} Tải Ảnh Lên
                  </button>
                </div>

                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  Hỗ trợ dán ảnh bằng phím <strong>Ctrl + V</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Tùy chọn vị trí chèn & Lưu vào thư viện */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Vị trí chèn */}
            <div style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                📍 Vị trí chèn vào trang:
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', marginBottom: '4px' }}>
                <input
                  type="radio"
                  name="insertPos"
                  checked={insertPosition === 'end'}
                  onChange={() => setInsertPosition('end')}
                />
                <span>Chèn vào cuối cùng của trang</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: selectedBlock ? 'pointer' : 'not-allowed', opacity: selectedBlock ? 1 : 0.5 }}>
                <input
                  type="radio"
                  name="insertPos"
                  disabled={!selectedBlock}
                  checked={insertPosition === 'after_selected'}
                  onChange={() => setInsertPosition('after_selected')}
                />
                <span>Chèn sau khối đang chọn ({selectedBlock ? selectedBlock.type : 'chưa chọn'})</span>
              </label>
            </div>

            {/* Lưu vào Thư Viện của Site */}
            <div style={{ padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: '#F9FAFB' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                ⭐ Lưu trữ vào Thư viện Block của Site:
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px' }}>
                <input
                  type="checkbox"
                  checked={saveToLibrary}
                  onChange={(e) => setSaveToLibrary(e.target.checked)}
                />
                <span>Lưu để dùng lại cho các trang khác của {domain}</span>
              </label>
              {saveToLibrary && (
                <input
                  type="text"
                  placeholder="Tên đặt cho block (vd: Bảng Giá VIP)"
                  value={customBlockName}
                  onChange={(e) => setCustomBlockName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '11px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFAF8',
          }}
        >
          <div style={{ fontSize: '11px', color: '#6B7280' }}>
            Không ảnh hưởng đến các khối có sẵn trên trang
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} disabled={loading} className="btn" style={{ padding: '7px 14px', fontSize: '12px' }}>
              Hủy
            </button>
            <button
              onClick={handleGenerateAndInsert}
              disabled={loading || !hasInput}
              style={{
                backgroundColor: '#7E22CE',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading || !hasInput ? 0.6 : 1,
                cursor: loading || !hasInput ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(126, 34, 206, 0.25)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Gemini Vision đang phân tích & dựng section...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Phân Tích & Chèn Section Vào Trang</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

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
