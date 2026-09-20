import React from 'react';
import { BlockStyleProperties, BlockType } from '@t-business/shared-types';
import { Minimize2 } from 'lucide-react';

interface Props {
  currentStyles: BlockStyleProperties;
  blockType: BlockType;
  onStyleChange: (prop: keyof BlockStyleProperties, val: string | number) => void;
}

export const SizingSection: React.FC<Props> = ({
  currentStyles,
  blockType,
  onStyleChange,
}) => {
  return (
    <div
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Minimize2 size={13} />
        Kích Thước & Tỷ Lệ (Sizing & Fit)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label className="form-label">Chiều Rộng (Width)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '6px' }}>
            {['100%', '75%', '50%', 'auto'].map((w) => (
              <button
                key={w}
                onClick={() => onStyleChange('width', w)}
                style={{
                  padding: '5px 2px',
                  fontSize: '11px',
                  border: currentStyles.width === w ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: currentStyles.width === w ? 'rgba(47, 111, 79, 0.1)' : '#F9FAFB',
                  color: currentStyles.width === w ? 'var(--color-primary)' : '#4B5563',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentStyles.width === w ? 600 : 400,
                }}
              >
                {w}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="VD: 100%, 350px, auto"
            value={currentStyles.width || ''}
            onChange={(e) => onStyleChange('width', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label className="form-label">Cao tối đa (Max H)</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 400px, none"
              value={currentStyles.maxHeight || ''}
              onChange={(e) => onStyleChange('maxHeight', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Rộng tối đa (Max W)</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 100%, 800px"
              value={currentStyles.maxWidth || ''}
              onChange={(e) => onStyleChange('maxWidth', e.target.value)}
            />
          </div>
        </div>

        {blockType === 'image' && (
          <div>
            <label className="form-label">Chế độ cắt ảnh (Object Fit)</label>
            <select
              className="form-control"
              value={currentStyles.objectFit || ''}
              onChange={(e) => onStyleChange('objectFit', e.target.value)}
            >
              <option value="">Mặc định (Cover)</option>
              <option value="cover">Phủ kín vừa khung (cover)</option>
              <option value="contain">Giữ trọn tỉ lệ ảnh (contain)</option>
              <option value="fill">Kéo dãn lấp đầy (fill)</option>
              <option value="scale-down">Tự thu nhỏ khi quá lớn (scale-down)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
