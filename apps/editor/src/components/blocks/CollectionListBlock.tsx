import React, { useState, useEffect, useMemo } from 'react';
import { CollectionListBlockProps, Breakpoint, ContentItemDTO } from '@t-business/shared-types';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { cmsService } from '../../services/cmsService';

interface Props {
  props: CollectionListBlockProps;
  breakpoint: Breakpoint;
}

export const CollectionListBlock: React.FC<Props> = ({ props, breakpoint }) => {
  const { siteId } = useCanvasStore();
  const layout = props.layout || 'grid';
  const limit = props.limit || 3;
  const contentTypeId = props.content_type_id;

  const [items, setItems] = useState<ContentItemDTO[]>([]);
  const [typeName, setTypeName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contentTypeId) {
      setItems([]);
      setTypeName('');
      return;
    }

    let isMounted = true;
    setLoading(true);

    // Lấy tên loại dữ liệu thân thiện
    cmsService.getContentTypes(siteId).then((types) => {
      if (!isMounted) return;
      const found = types.find((t) => t.id === contentTypeId);
      if (found) setTypeName(found.name);
    }).catch(() => {});

    // Lấy bản ghi thực tế từ CMS backend
    cmsService.getContentItems(siteId, contentTypeId)
      .then((res) => {
        if (!isMounted) return;
        setItems(res.data || []);
      })
      .catch((err) => {
        console.warn('[CollectionListBlock] Không thể tải items từ CMS:', err);
        if (isMounted) setItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [contentTypeId, siteId, limit, props.sort_by]);

  // Trích xuất các trường dữ liệu động từ CMS
  const displayItems = useMemo(() => {
    if (items.length > 0) {
      return items.slice(0, limit).map((item) => {
        const f = (item.fields || {}) as Record<string, any>;
        const title = f.name || f.title || f.label || 'Không có tiêu đề';
        const img =
          f.image ||
          f.banner ||
          f.thumbnail ||
          f.cover_image ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
        const rawExcerpt =
          f.description ||
          f.excerpt ||
          f.content ||
          f.body ||
          (f.price !== undefined ? `Giá: ${Number(f.price).toLocaleString('vi-VN')} đ` : '');
        const excerpt = typeof rawExcerpt === 'string' ? rawExcerpt.replace(/<[^>]+>/g, '') : '';
        const meta =
          f.price !== undefined
            ? `${Number(f.price).toLocaleString('vi-VN')} đ`
            : f.publish_date || (f.is_bestseller || f.is_signature ? '⭐ Nổi bật' : '');

        return {
          id: item.id,
          title,
          excerpt,
          img,
          meta,
          isReal: true,
        };
      });
    }

    // Fallback mẫu khi chưa có bản ghi nào
    return [
      {
        id: 'sample-1',
        title: 'Bản ghi mẫu 1',
        excerpt: 'Mô tả tóm tắt nội dung bản ghi mẫu trong CMS.',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        meta: 'Mẫu',
        isReal: false,
      },
      {
        id: 'sample-2',
        title: 'Bản ghi mẫu 2',
        excerpt: 'Mô tả tóm tắt nội dung bản ghi mẫu trong CMS.',
        img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        meta: 'Mẫu',
        isReal: false,
      },
      {
        id: 'sample-3',
        title: 'Bản ghi mẫu 3',
        excerpt: 'Mô tả tóm tắt nội dung bản ghi mẫu trong CMS.',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        meta: 'Mẫu',
        isReal: false,
      },
    ].slice(0, limit);
  }, [items, limit]);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px',
        border: '1px dashed #C4B5FD',
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
      {/* CMS Source Header Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#F5F3FF',
          borderRadius: '8px',
          border: '1px solid #DDD6FE',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600, color: '#6D28D9' }}>
          <Database size={15} />
          {contentTypeId ? (
            <span>
              Nguồn CMS: <strong>{typeName || 'Đang kết nối...'}</strong>
            </span>
          ) : (
            <span style={{ color: '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={14} /> Chưa chọn Nguồn dữ liệu CMS (chọn trong bảng Thuộc tính bên phải)
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#6B7280' }}>
          {loading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
          <span>
            {items.length > 0 ? `${items.length} bản ghi thực tế` : 'Dữ liệu mẫu'} ({limit} mục, {layout})
          </span>
        </div>
      </div>

      {/* Grid / List Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            layout === 'list' || breakpoint === 'mobile'
              ? '1fr'
              : 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {displayItems.map((item) => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
              display: layout === 'list' && breakpoint !== 'mobile' ? 'flex' : 'block',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s ease',
            }}
          >
            <div
              style={{
                width: layout === 'list' && breakpoint !== 'mobile' ? '160px' : '100%',
                height: layout === 'list' && breakpoint !== 'mobile' ? '100%' : '140px',
                position: 'relative',
                backgroundColor: '#F3F4F6',
              }}
            >
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.target as HTMLElement).style.opacity = '0.5';
                }}
              />
            </div>

            <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#1F2937', lineHeight: 1.3 }}>
                    {item.title}
                  </h4>
                  {item.meta && (
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2F6F4F', whiteSpace: 'nowrap' }}>
                      {item.meta}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5, margin: 0 }}>
                  {item.excerpt || 'Không có mô tả'}
                </p>
              </div>

              {!item.isReal && (
                <div style={{ marginTop: '8px', fontSize: '10px', color: '#9CA3AF', fontStyle: 'italic' }}>
                  * Bản ghi xem trước mẫu
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
