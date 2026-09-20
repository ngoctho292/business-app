import React from 'react';
import { CollectionListBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const CollectionListSSR: React.FC<{
  id: string;
  props: CollectionListBlockProps;
  siteId?: string;
}> = async ({ id, props, siteId = '6afeff8e-4fd9-4df7-8f49-eff1e558cd3f' }) => {
  const scopedClass = getBlockScopedClass(id);
  const limit = props.limit || 3;
  const layout = props.layout || 'grid';
  const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';

  let displayItems: { title: string; excerpt: string; img: string; meta?: string }[] = [];

  if (props.content_type_id) {
    try {
      const res = await fetch(
        `${backendUrl}/v1/sites/${siteId}/content-types/${props.content_type_id}/items?status=published&limit=${limit}`,
        {
          next: { tags: [`content-type-${props.content_type_id}`, `site-${siteId}`] },
          cache: 'no-store',
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawItems: any[] = json.data || [];

        displayItems = rawItems.map((item) => {
          const f = item.fields || {};
          const title = f.name || f.title || f.label || 'Không có tiêu đề';
          const img =
            f.image ||
            f.banner ||
            f.thumbnail ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
          const excerpt =
            f.description ||
            f.excerpt ||
            f.content ||
            (f.price !== undefined ? `Giá: ${Number(f.price).toLocaleString('vi-VN')} đ` : '');
          const meta =
            f.price !== undefined
              ? `${Number(f.price).toLocaleString('vi-VN')} đ`
              : f.publish_date || '';

          return { title, excerpt, img, meta };
        });
      }
    } catch (e) {
      console.warn(`[Renderer] Không thể fetch items cho content_type_id ${props.content_type_id}:`, e);
    }
  }

  // Fallback demo items if no items returned from CMS
  if (displayItems.length === 0) {
    displayItems = [
      {
        title: 'Khai vị Đặc sản Tây Bắc',
        excerpt: 'Món ăn truyền thống hấp dẫn với hương vị thảo mộc thiên nhiên vùng cao nguyên.',
        img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        meta: '95.000 đ',
      },
      {
        title: 'Set Lẩu Hải Sản Thượng Hạng',
        excerpt: 'Được chế biến từ hải sản tươi sống nhập khẩu mỗi ngày bởi đầu bếp 5 sao.',
        img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        meta: '385.000 đ',
      },
      {
        title: 'Tráng Miệng Chè Sen Long Nhãn',
        excerpt: 'Thanh mát giải nhiệt, ngọt dịu nhẹ nhàng theo phong cách ẩm thực cung đình Huế.',
        img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        meta: '55.000 đ',
      },
    ].slice(0, limit);
  }

  return (
    <div className={`tb-collection-wrapper ${scopedClass}`}>
      <div className={layout === 'list' ? 'tb-collection-list' : 'tb-collection-grid'}>
        {displayItems.map((item, idx) => (
          <article key={idx} className="tb-card">
            <img src={item.img} alt={item.title} loading="lazy" decoding="async" />
            <div className="tb-card-body">
              <div className="tb-card-header">
                <h3 className="tb-card-title">{item.title}</h3>
                {item.meta && (
                  <span className="tb-card-price">{item.meta}</span>
                )}
              </div>
              <p className="tb-card-text">{item.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
