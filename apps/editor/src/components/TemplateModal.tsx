import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { WebsiteTemplate } from '../templates/types';
import { apiClient } from '../services/apiClient';
import { Sparkles, X, CheckCircle, ArrowRight, BookmarkPlus, Search, RefreshCw, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_TABS = [
  { key: 'all', label: 'Tất Cả Mẫu' },
  { key: 'technology', label: '💻 Công Nghệ & SaaS' },
  { key: 'food_beverage', label: '🍕 Ẩm Thực & F&B' },
  { key: 'general', label: '🏢 Đa Ngành Nghề' },
];

export const TemplateModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { blocks, setBlocks } = useCanvasStore();

  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal lưu trang hiện tại thành mẫu mới
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveCategory, setSaveCategory] = useState('technology');
  const [saveDescription, setSaveDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách templates từ Database qua API
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<WebsiteTemplate[]>('/templates');
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[TemplateModal] Không thể tải templates từ Database API:', err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleApplyTemplate = (template: WebsiteTemplate) => {
    const sourceBlocks = template.block_nodes || template.blocks || [];
    if (sourceBlocks.length === 0) {
      alert('Mẫu này chưa có khối nội dung.');
      return;
    }

    const timestamp = Date.now();
    const idMap: Record<string, string> = {};

    // Bước 1: Sinh ID mới duy nhất cho từng block trong template
    sourceBlocks.forEach((b, idx) => {
      idMap[b.id] = `block-${timestamp}-${idx}`;
    });

    // Bước 2: Bảo toàn quan hệ phân cấp cây (parent_id: Section -> Container -> Content)
    const preparedBlocks = sourceBlocks.map((b, idx) => ({
      ...b,
      id: idMap[b.id] || `block-${timestamp}-${idx}`,
      parent_id: b.parent_id ? (idMap[b.parent_id] || b.parent_id) : null,
      order_index: idx,
    }));

    setBlocks(preparedBlocks as any);
    onClose();
  };

  const handleSaveCurrentPageAsTemplate = async () => {
    if (!saveName.trim()) {
      alert('Vui lòng nhập tên mẫu giao diện.');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/templates/save-from-page', {
        name: saveName.trim(),
        category: saveCategory,
        description: saveDescription.trim() || 'Mẫu website được lưu từ trang thiết kế hiện tại.',
        badge: '⭐ Bản Mẫu Độc Quyền',
        features: [
          `Gồm ${blocks.length} khối phân cấp`,
          'Thiết kế chuẩn Responsive',
          'Sẵn sàng tùy chỉnh kéo thả',
        ],
        block_nodes: blocks,
      });

      alert(`Đã lưu thành công mẫu "${saveName.trim()}" vào Database!`);
      setShowSaveModal(false);
      setSaveName('');
      setSaveDescription('');
      await loadTemplates();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu trang thành mẫu.');
    } finally {
      setIsSaving(false);
    }
  };

  // Lọc templates theo category và search
  const filteredTemplates = templates.filter((t) => {
    const matchCategory =
      activeCategory === 'all' ||
      t.category === activeCategory ||
      (activeCategory === 'general' && !['technology', 'food_beverage'].includes(t.category));

    const matchSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.features && t.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchCategory && matchSearch;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FAFAF8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(107, 78, 255, 0.1)',
                color: 'var(--color-ai)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                  Kho Mẫu Giao Diện Website (Database)
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    border: '1px solid #BFDBFE',
                  }}
                >
                  {filteredTemplates.length} Mẫu Khả Dụng
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                Các mẫu website lưu trữ động trong cơ sở dữ liệu — Khởi tạo trang chuẩn doanh nghiệp với 1 click.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#4F46E5',
                borderColor: '#C7D2FE',
                backgroundColor: '#EEF2FF',
              }}
              title="Lưu toàn bộ các khối trên trang hiện tại thành mẫu mới"
            >
              <BookmarkPlus size={14} />
              <span>Lưu Trang Này Thành Mẫu</span>
            </button>

            <button
              onClick={loadTemplates}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '6px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Tải lại danh sách từ Database"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toolbar: Category Tabs & Search */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {CATEGORY_TABS.map((tab) => {
              const active = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: active ? '1px solid #4F46E5' : '1px solid var(--color-border)',
                    backgroundColor: active ? '#4F46E5' : 'transparent',
                    color: active ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
              }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm mẫu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                fontSize: '12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Modal Body: Templates Grid */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
              <div>Đang tải danh sách mẫu từ Database...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-secondary)' }}>
              <Layers size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, fontSize: '15px' }}>Không tìm thấy mẫu phù hợp</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Thử chọn danh mục khác hoặc bấm "Lưu Trang Này Thành Mẫu" để thêm mẫu mới.
              </div>
            </div>
          ) : (
            filteredTemplates.map((tmpl: WebsiteTemplate) => {
              const thumbnailSrc = tmpl.thumbnail_url || tmpl.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80';
              const blockCount = (tmpl.block_nodes || tmpl.blocks || []).length;

              return (
                <div
                  key={tmpl.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', height: '100%', minHeight: '210px' }}>
                    <img
                      src={thumbnailSrc}
                      alt={tmpl.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(15, 23, 42, 0.85)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {tmpl.category === 'technology' ? 'Công Nghệ' : tmpl.category === 'food_beverage' ? 'Ẩm Thực' : tmpl.category}
                    </span>

                    <span
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#1E293B',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {blockCount} khối
                    </span>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
                          {tmpl.name}
                        </h3>
                        {tmpl.badge && (
                          <span
                            style={{
                              fontSize: '11px',
                              backgroundColor: tmpl.id === 'cloudnext-tech-saas' ? '#EEF2FF' : '#ECFDF5',
                              color: tmpl.id === 'cloudnext-tech-saas' ? '#4338CA' : '#059669',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontWeight: 600,
                              border: `1px solid ${tmpl.id === 'cloudnext-tech-saas' ? '#C7D2FE' : '#A7F3D0'}`,
                            }}
                          >
                            {tmpl.badge}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                        {tmpl.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', fontSize: '12px', color: 'var(--color-text-primary)' }}>
                        {(tmpl.features || [
                          'Hero Header & Giới thiệu',
                          'Bố cục đa cột hiện đại',
                          'Tối ưu chuyển đổi khách hàng',
                          'Chuẩn SEO & Tự động thích ứng',
                        ]).map((feat, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={14} style={{ color: 'var(--color-accent)' }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                      <button
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="btn btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        <span>Áp dụng mẫu này</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Con: Lưu Trang Này Thành Mẫu Mới */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookmarkPlus size={20} color="#4F46E5" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Lưu Trang Này Thành Mẫu Mới</h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Toàn bộ <strong>{blocks.length} khối</strong> hiện tại trên Canvas sẽ được đóng gói và lưu trực tiếp vào bảng <code>website_templates</code> trong Database.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Tên Mẫu Giao Diện *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bất Động Sản Cao Cấp 2026"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Ngành Nghề / Phân Loại *
                </label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="technology">Công Nghệ & SaaS</option>
                  <option value="food_beverage">Ẩm Thực & Nhà Hàng</option>
                  <option value="real_estate">Bất Động Sản & Nghỉ Dưỡng</option>
                  <option value="ecommerce">Thương Mại & Bán Lẻ</option>
                  <option value="general">Doanh Nghiệp Đa Ngành</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Mô Tả Ngắn
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả ưu điểm và đối tượng phù hợp của mẫu..."
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    resize: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '12px' }}
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCurrentPageAsTemplate}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '12px', fontWeight: 600 }}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu vào DB...' : '💾 Lưu Vào Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
