import React from 'react';
import { ContainerBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: ContainerBlockProps;
  onUpdateProps: (updates: Partial<ContainerBlockProps>) => void;
}

export const ContainerContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label className="form-label">Thẻ HTML Ngữ Nghĩa</label>
        <select
          className="form-control"
          value={props.tag || 'div'}
          onChange={(e) => onUpdateProps({ tag: e.target.value as any })}
        >
          <option value="div">&lt;div&gt; (Hộp chứa tiêu chuẩn)</option>
          <option value="article">&lt;article&gt; (Thẻ bài viết / Sản phẩm)</option>
          <option value="aside">&lt;aside&gt; (Thẻ thông tin phụ)</option>
        </select>
      </div>
      <div style={{ padding: '10px 12px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '11px', color: '#4B5563', lineHeight: 1.4 }}>
        💡 <strong>Mẹo thiết kế Thẻ (Card):</strong> Bạn hãy chuyển sang tab <strong>Kiểu dáng</strong> hoặc <strong>Nâng cao</strong> bên cạnh để chỉnh màu nền, bo góc (Border Radius), viền và bóng đổ (Box Shadow) cho Thẻ này!
      </div>
    </div>
  );
};
