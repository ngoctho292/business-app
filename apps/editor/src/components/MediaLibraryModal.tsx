import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Trash2, Image as ImageIcon, RefreshCw, Check, Search, Loader2 } from 'lucide-react';
import { useMediaLibrary, MediaAsset } from '../hooks/useMediaLibrary';

interface MediaLibraryModalProps {
  siteId: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  /** Nếu true, chỉ hiển thị ảnh (image), ẩn video */
  imagesOnly?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const MediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  siteId,
  onSelect,
  onClose,
  imagesOnly = false,
}) => {
  const {
    assets,
    loading,
    uploading,
    uploadStatus,
    hasMore,
    error,
    uploadFiles,
    deleteAsset,
    loadMore,
    refresh,
  } = useMediaLibrary(siteId);
  const [selected, setSelected] = useState<MediaAsset | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    if (imagesOnly && a.type === 'video') return false;
    if (search && !a.filename.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleFileChange = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const results = await uploadFiles(files);
      if (results && results.length > 0) {
        setSelected(results[0]);
      }
    },
    [uploadFiles]
  );


  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileChange(e.dataTransfer.files);
    },
    [handleFileChange]
  );

  const handleConfirmSelect = () => {
    if (selected) {
      onSelect(selected.url);
      onClose();
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    await deleteAsset(assetId);
    if (selected?.id === assetId) setSelected(null);
    setDeleteConfirm(null);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '900px',
          maxWidth: '100%',
          height: '85vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <ImageIcon size={18} color="var(--color-accent)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
              Thư Viện Media
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              {assets.length} file • Chọn ảnh hoặc kéo thả để upload mới
            </div>
          </div>
          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Search
              size={13}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}
            />
            <input
              type="text"
              placeholder="Tìm tên file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
                width: '180px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
          <button
            onClick={refresh}
            style={{ padding: '7px', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'none', cursor: 'pointer', display: 'flex' }}
            title="Làm mới"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={onClose}
            style={{ padding: '7px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', color: 'var(--color-text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Upload + Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Upload Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: dragOver ? 'rgba(47,111,79,0.06)' : 'var(--color-bg)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm"
                style={{ display: 'none' }}
                onChange={(e) => handleFileChange(e.target.files)}
              />
              {uploading && uploadStatus ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={24} color="var(--color-accent)" style={{ animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>
                    Đang tải lên {uploadStatus.completed}/{uploadStatus.total} file ({uploadStatus.percent}%)
                  </div>
                  {uploadStatus.currentFileName && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Đang xử lý: {uploadStatus.currentFileName}
                    </div>
                  )}
                  <div
                    style={{
                      width: '240px',
                      height: '6px',
                      backgroundColor: 'var(--color-border)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadStatus.percent}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-accent)',
                        borderRadius: '3px',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={22} color="var(--color-text-secondary)" />
                  <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Kéo thả nhiều ảnh/video vào đây hoặc click để chọn nhiều file
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Hỗ trợ chọn & tải lên nhiều file cùng lúc • JPG, PNG, WebP, GIF, SVG, MP4, WebM (Tối đa 50 MB/file)
                  </div>
                </>
              )}
            </div>

            {error && (
              <div style={{ fontSize: '12px', color: '#B3261E', backgroundColor: '#FFF1F0', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FFCDD2' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Grid */}
            {loading && assets.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--color-text-secondary)', flexDirection: 'column', gap: '12px' }}>
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '13px' }}>Đang tải thư viện...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                {search ? '🔍 Không tìm thấy file nào khớp.' : '📭 Thư viện trống. Upload ảnh đầu tiên!'}
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gap: '10px',
                  }}
                >
                  {filtered.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => setSelected(asset)}
                      style={{
                        position: 'relative',
                        aspectRatio: '1',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selected?.id === asset.id ? '3px solid var(--color-accent)' : '2px solid transparent',
                        boxShadow: selected?.id === asset.id ? '0 0 0 2px rgba(47,111,79,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.15s ease',
                        backgroundColor: '#F3F3F0',
                      }}
                    >
                      {asset.type === 'image' ? (
                        <img
                          src={asset.url}
                          alt={asset.filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23F0EFEB"/><text x="50" y="55" text-anchor="middle" font-size="28">🖼️</text></svg>';
                          }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A2E', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: '28px' }}>🎬</div>
                          <div style={{ fontSize: '9px', color: '#AAA', textAlign: 'center', padding: '0 6px' }}>{asset.filename.slice(0, 15)}</div>
                        </div>
                      )}
                      {selected?.id === asset.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={12} color="white" />
                        </div>
                      )}
                      {/* Delete button on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(asset.id);
                        }}
                        style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(179,38,30,0.85)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          opacity: 0,
                          transition: 'opacity 0.15s ease',
                        }}
                        className="delete-btn"
                      >
                        <Trash2 size={10} color="white" />
                      </button>
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="btn"
                      style={{ fontSize: '12px', margin: '0 auto' }}
                    >
                      {loading ? 'Đang tải...' : 'Tải thêm'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: Selected Preview */}
          <div
            style={{
              width: '220px',
              borderLeft: '1px solid var(--color-border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto',
              backgroundColor: 'var(--color-bg)',
            }}
          >
            {selected ? (
              <>
                <div
                  style={{
                    borderRadius: '10px',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    backgroundColor: '#F0EFEB',
                  }}
                >
                  {selected.type === 'image' ? (
                    <img
                      src={selected.url}
                      alt={selected.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <video
                      src={selected.url}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      controls
                      muted
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', wordBreak: 'break-all' }}>
                    {selected.filename}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    {formatBytes(selected.file_size)} • {selected.mime_type}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {new Date(selected.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#9E9D95', fontFamily: 'monospace', backgroundColor: '#F5F3F0', padding: '6px 8px', borderRadius: '6px', wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {selected.url}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSelect}
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  <Check size={14} /> Chọn ảnh này
                </button>
                <button
                  onClick={() => setDeleteConfirm(selected.id)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #FFCDD2',
                    backgroundColor: 'transparent',
                    color: '#B3261E',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={13} /> Xóa file này
                </button>
              </>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--color-text-secondary)',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px' }}>🖼️</div>
                <div>Chọn 1 ảnh bên trái để xem chi tiết và chèn vào trang</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <button
            className="btn"
            style={{ fontSize: '12px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={13} /> Upload ảnh mới
          </button>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn" style={{ fontSize: '12px' }} onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn btn-primary"
              disabled={!selected}
              onClick={handleConfirmSelect}
              style={{ fontSize: '12px', opacity: selected ? 1 : 0.5 }}
            >
              <Check size={13} /> Chèn vào trang
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              padding: '24px',
              width: '320px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>🗑️ Xác nhận xóa file?</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              File đã xóa sẽ không thể khôi phục. Các trang đang dùng ảnh này sẽ bị ảnh hưởng.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDeleteConfirm(null)}>Hủy</button>
              <button
                className="btn"
                style={{ backgroundColor: '#B3261E', color: 'white', border: 'none' }}
                onClick={() => handleDeleteAsset(deleteConfirm)}
              >
                Xóa file
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .delete-btn { opacity: 0 !important; }
        div:hover > .delete-btn { opacity: 1 !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
