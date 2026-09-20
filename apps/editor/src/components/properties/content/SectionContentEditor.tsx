import React from 'react';
import { SectionBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: SectionBlockProps;
  onUpdateProps: (updates: Partial<SectionBlockProps>) => void;
}

const LAYOUT_OPTIONS = [
  { id: 'stack', label: '1 Cột', desc: 'Xếp chồng dọc tiêu chuẩn' },
  { id: 'grid-2', label: '2 Cột Đều', desc: '50% - 50% song song' },
  { id: 'split-left', label: 'Tỉ Lệ 60 / 40', desc: 'Cột trái to hơn cột phải' },
  { id: 'split-right', label: 'Tỉ Lệ 40 / 60', desc: 'Cột phải to hơn cột trái' },
  { id: 'grid-3', label: '3 Cột Đều', desc: '33% x 3 (Bảng giá, Lợi thế)' },
  { id: 'grid-4', label: '4 Cột Đều', desc: '25% x 4 (Đội ngũ, Thống kê)' },
];

export const SectionContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  const currentLayout = props.layout || 'stack';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Bộ Chọn Bố Cục Cột Trực Quan */}
      <div>
        <label className="form-label">
          📐 Bố Cục Chia Cột (Grid & Columns Layout)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = currentLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateProps({ layout: opt.id as any })}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid var(--color-accent)' : '1px solid #E5E7EB',
                  backgroundColor: isSelected ? 'rgba(47, 111, 79, 0.08)' : '#FFFFFF',
                  color: isSelected ? 'var(--color-accent)' : '#374151',
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>{opt.label}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', fontWeight: 400 }}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px', fontStyle: 'italic' }}>
          💡 Tự động co về 1 cột trên màn hình điện thoại (Mobile Responsive).
        </div>
      </div>

      {/* 2. Thẻ HTML ngữ nghĩa */}
      <div>
        <label className="form-label">Thẻ HTML Ngữ Nghĩa (SEO Semantic Tag)</label>
        <select
          className="form-control"
          value={props.tag || 'section'}
          onChange={(e) => onUpdateProps({ tag: e.target.value as any })}
        >
          <option value="section">&lt;section&gt; (Phần nội dung chính)</option>
          <option value="div">&lt;div&gt; (Khối bọc chung)</option>
          <option value="article">&lt;article&gt; (Bài viết / Tin tức)</option>
          <option value="aside">&lt;aside&gt; (Thanh bên lề)</option>
          <option value="main">&lt;main&gt; (Khu vực chính trang)</option>
        </select>
      </div>
    </div>
  );
};
