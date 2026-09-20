import React from 'react';
import { ImageBlockProps } from '@t-business/shared-types';
import { Image as ImageIcon } from 'lucide-react';

interface Props {
  blockId: string;
  props: ImageBlockProps;
  onUpdateProps: (updates: Partial<ImageBlockProps>) => void;
  onOpenMediaPicker: (propKey: string, label: string) => void;
}

export const ImageContentEditor: React.FC<Props> = ({
  props,
  onUpdateProps,
  onOpenMediaPicker,
}) => {
  return (
    <>
      <div>
        <label className="form-label">Đường dẫn ảnh (Image URL)</label>
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="form-control"
            value={props.src || ''}
            onChange={(e) => onUpdateProps({ src: e.target.value })}
          />
          <button
            className="btn secondary"
            onClick={() => onOpenMediaPicker('src', 'Chọn ảnh')}
            style={{ padding: '0 10px' }}
            title="Chọn ảnh từ Thư viện Media"
          >
            <ImageIcon size={16} />
          </button>
        </div>
      </div>
      <div>
        <label className="form-label">Văn bản thay thế (Alt text chuẩn SEO)</label>
        <input
          type="text"
          className="form-control"
          value={props.alt || ''}
          onChange={(e) => onUpdateProps({ alt: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Chú thích ảnh (Caption)</label>
        <input
          type="text"
          className="form-control"
          value={props.caption || ''}
          onChange={(e) => onUpdateProps({ caption: e.target.value })}
        />
      </div>
    </>
  );
};
