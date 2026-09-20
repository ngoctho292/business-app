import React, { useState, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Search, X, Check, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedIcon: string;
  onSelectIcon: (iconName: string, styleVariant?: string) => void;
}

// Danh mục mẫu phổ biến và từ khóa tương ứng
const CATEGORIES = [
  { id: 'popular', label: '🔥 Phổ Biến', keywords: ['star', 'heart', 'phone', 'cart', 'shield', 'check', 'user', 'shop', 'map-point', 'crown', 'bell', 'clock', 'fire', 'like', 'gift'] },
  { id: 'business', label: '💼 Doanh Nghiệp', keywords: ['chart', 'graph', 'presentation', 'diploma', 'case-round', 'document', 'folder', 'archive', 'buildings', 'cup', 'ranking'] },
  { id: 'contact', label: '📞 Liên Hệ', keywords: ['phone', 'letter', 'chat', 'mailbox', 'incoming-call', 'outgoing-call', 'dialog-2', 'unread'] },
  { id: 'ecommerce', label: '🛒 Bán Hàng & Mua Sắm', keywords: ['cart', 'bag', 'shop', 'wallet', 'card', 'tag', 'ticket', 'box', 'sale', 'dollar', 'ruble', 'qr-code'] },
  { id: 'security', label: '🛡️ Bảo Mật & Chứng Nhận', keywords: ['shield', 'lock', 'key', 'verified', 'safe-square', 'eye-closed', 'password', 'check-read'] },
  { id: 'food', label: '🍽️ Ẩm Thực & Nhà Hàng', keywords: ['cup', 'cup-star', 'wine', 'donut', 'chef-hat', 'bottle', 'cookie', 'plate'] },
  { id: 'maps', label: '📍 Vận Chuyển & Bản Đồ', keywords: ['map-point', 'delivery', 'box', 'compass', 'global', 'routing', 'bus', 'scooter', 'tram'] },
  { id: 'social', label: '🌐 Mạng Xã Hội & UI', keywords: ['share', 'like', 'link', 'bookmark', 'camera', 'videocamera', 'music-notes', 'gallery', 'play'] },
];

const STYLES = [
  { id: 'all', label: 'Tất cả Style' },
  { id: 'bold', label: 'Bold (Đậm)' },
  { id: 'linear', label: 'Linear (Nét thanh)' },
  { id: 'bold-duotone', label: 'Bold Duotone' },
  { id: 'line-duotone', label: 'Line Duotone' },
  { id: 'broken', label: 'Broken (Cách điệu)' },
  { id: 'outline', label: 'Outline (Đường nét)' },
];

// Danh sách các icon cốt lõi phong phú
const ICON_BASE_NAMES = [
  // Phổ biến & Tương tác
  'star', 'star-fall', 'star-circle', 'heart', 'heart-angle', 'like', 'dislike', 'hand-stars',
  'check-circle', 'check-square', 'close-circle', 'danger-triangle', 'info-circle', 'question-circle',
  'fire', 'bolt', 'sparkles', 'magic-stick-3', 'crown', 'crown-star', 'medal-star', 'cup-star',
  
  // Liên hệ & Giao tiếp
  'phone', 'phone-calling', 'phone-rounded', 'letter', 'letter-opened', 'inbox', 'mailbox',
  'chat-round-dots', 'chat-dots', 'chat-line', 'chat-round-call', 'dialog-2', 'unread',

  // Thương mại & Bán hàng
  'cart-large-4', 'cart-check', 'cart-plus', 'bag-5', 'bag-heart', 'shop-2', 'shop-minimalistic',
  'tag-price', 'ticket-sale', 'wallet-money', 'card', 'card-recive', 'card-send', 'bill-list',

  // Doanh nghiệp & Văn phòng
  'buildings', 'buildings-2', 'case-round', 'chart', 'chart-2', 'chart-square', 'graph-new',
  'presentation-graph', 'diploma', 'document-add', 'document-text', 'folder-with-files', 'archive',
  'user', 'user-check', 'user-plus', 'users-group-two-rounded', 'user-speak', 'user-id',

  // Bảo mật & Chứng nhận
  'shield-check', 'shield-warning', 'shield-star', 'shield-minimalistic', 'shield-user',
  'lock', 'lock-password', 'lock-keyhole', 'key-square', 'verified-check', 'safe-square',

  // Ăn uống & Dịch vụ
  'cup', 'wine', 'donut', 'chef-hat', 'bottle', 'cookie', 'plate',

  // Địa điểm & Vận chuyển
  'map-point', 'map-point-wave', 'map-point-school', 'map-point-hospital', 'compass', 'global',
  'routing', 'signpost', 'delivery', 'box-minimalistic', 'bus', 'scooter', 'tram',

  // Đa phương tiện & Thiết bị
  'bell', 'bell-bing', 'bell-ringing', 'clock-circle', 'calendar', 'calendar-date',
  'camera', 'videocamera', 'music-notes', 'gallery', 'gallery-wide', 'play-circle',
  'laptop', 'monitor', 'smartphone', 'printer', 'cpu', 'wifi',

  // Điều hướng & Khác
  'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'alt-arrow-right', 'round-alt-arrow-right',
  'settings', 'tuning-square-2', 'magnifer', 'share', 'link', 'bookmark', 'trash-bin-trash',
  'eye', 'eye-closed', 'refresh', 'download', 'upload', 'cloud-upload'
];

export const SolarIconPickerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedIcon,
  onSelectIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [selectedStyle, setSelectedStyle] = useState('bold');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 48;

  // Lọc danh sách icon
  const filteredIcons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let baseList = ICON_BASE_NAMES;

    // Lọc theo Category nếu không gõ search term
    if (!term && selectedCategory !== 'all') {
      const cat = CATEGORIES.find((c) => c.id === selectedCategory);
      if (cat) {
        baseList = ICON_BASE_NAMES.filter((name) =>
          cat.keywords.some((kw) => name.includes(kw))
        );
      }
    }

    // Lọc theo Search term
    if (term) {
      baseList = ICON_BASE_NAMES.filter((name) => name.toLowerCase().includes(term));
    }

    // Ghép với style (bold, linear, duotone...)
    const styleSuffix = selectedStyle === 'all' ? 'bold' : selectedStyle;

    return baseList.map((base) => ({
      baseName: base,
      fullName: `solar:${base}-${styleSuffix}`,
      displayName: base.replace(/-/g, ' '),
    }));
  }, [searchTerm, selectedCategory, selectedStyle]);

  // Phân trang
  const totalPages = Math.ceil(filteredIcons.length / itemsPerPage) || 1;
  const currentIcons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredIcons.slice(start, start + itemsPerPage);
  }, [filteredIcons, currentPage]);

  if (!isOpen) return null;

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
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(47, 111, 79, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary, #2F6F4F)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                Bộ Sưu Tập Solar Icons (7,750+ Icons)
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                Biểu tượng vector hiện đại, sắc nét — 0đ chi phí, bản quyền tự do
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

        {/* Search & Filter Toolbar */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Live Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }}
            />
            <input
              type="text"
              placeholder="Tìm theo tên biểu tượng: phone, star, shield, cart, heart, user, gift, chat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Style Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {STYLES.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setSelectedStyle(st.id);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: selectedStyle === st.id ? 600 : 500,
                  border: selectedStyle === st.id ? '1px solid var(--color-primary, #2F6F4F)' : '1px solid #E5E7EB',
                  backgroundColor: selectedStyle === st.id ? 'rgba(47, 111, 79, 0.08)' : '#FFFFFF',
                  color: selectedStyle === st.id ? 'var(--color-primary, #2F6F4F)' : '#4B5563',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Category Chips (chỉ hiện khi không gõ search term) */}
          {!searchTerm && (
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: selectedCategory === cat.id ? 600 : 500,
                    border: 'none',
                    backgroundColor: selectedCategory === cat.id ? '#1F2937' : '#F3F4F6',
                    color: selectedCategory === cat.id ? '#FFFFFF' : '#4B5563',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Icon Grid Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            minHeight: '320px',
          }}
        >
          {filteredIcons.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#6B7280',
                fontSize: '13px',
              }}
            >
              Không tìm thấy biểu tượng phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;. Hãy thử từ khóa khác như <em>star, heart, phone, cart, shield...</em>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
                gap: '10px',
              }}
            >
              {currentIcons.map((item) => {
                const isSelected = selectedIcon === item.fullName;
                return (
                  <button
                    key={item.fullName}
                    onClick={() => {
                      onSelectIcon(item.fullName, selectedStyle);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 6px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--color-primary, #2F6F4F)' : '1px solid #E5E7EB',
                      backgroundColor: isSelected ? 'rgba(47, 111, 79, 0.08)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      gap: '8px',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--color-primary, #2F6F4F)';
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                    title={item.displayName}
                  >
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          color: 'var(--color-primary, #2F6F4F)',
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <Icon
                      icon={item.fullName}
                      width={28}
                      height={28}
                      style={{
                        color: isSelected ? 'var(--color-primary, #2F6F4F)' : '#374151',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#4B5563',
                        textAlign: 'center',
                        maxWidth: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Pagination */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#6B7280',
          }}
        >
          <div>
            Hiển thị <strong>{currentIcons.length}</strong> / <strong>{filteredIcons.length}</strong> biểu tượng
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: '11px',
                }}
              >
                Trước
              </button>
              <span style={{ padding: '0 4px', fontSize: '11px' }}>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: '11px',
                }}
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
