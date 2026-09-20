import React from 'react';
import { BlockStyleProperties } from '@t-business/shared-types';
import { Type } from 'lucide-react';

interface Props {
  currentStyles: BlockStyleProperties;
  onStyleChange: (prop: keyof BlockStyleProperties, val: string | number) => void;
}

export const TypographySection: React.FC<Props> = ({ currentStyles, onStyleChange }) => {
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
        <Type size={13} />
        Chữ & Căn Lề (Typography)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label className="form-label">Cỡ chữ (Font Size)</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 16px, 2rem"
              value={currentStyles.fontSize || ''}
              onChange={(e) => onStyleChange('fontSize', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Độ đậm (Weight)</label>
            <select
              className="form-control"
              value={currentStyles.fontWeight || ''}
              onChange={(e) => onStyleChange('fontWeight', e.target.value)}
            >
              <option value="">Mặc định</option>
              <option value="400">400 (Regular)</option>
              <option value="500">500 (Medium)</option>
              <option value="600">600 (Semi Bold)</option>
              <option value="700">700 (Bold)</option>
              <option value="800">800 (Extra Bold)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Màu chữ (Text Color)</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="color"
              value={
                currentStyles.color && currentStyles.color.startsWith('#')
                  ? currentStyles.color
                  : '#1F1E1B'
              }
              onChange={(e) => onStyleChange('color', e.target.value)}
              style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="#1F1E1B hoặc var(--color-primary)"
              value={currentStyles.color || ''}
              onChange={(e) => onStyleChange('color', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Căn lề (Text Align)</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px' }}>
            {(['left', 'center', 'right', 'justify'] as const).map((align) => (
              <button
                key={align}
                onClick={() => onStyleChange('textAlign', align)}
                style={{
                  padding: '6px',
                  fontSize: '11px',
                  border: currentStyles.textAlign === align ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: currentStyles.textAlign === align ? 'rgba(47, 111, 79, 0.1)' : '#FFFFFF',
                  color: currentStyles.textAlign === align ? 'var(--color-primary)' : '#4B5563',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: currentStyles.textAlign === align ? 600 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {align === 'left' ? 'Trái' : align === 'center' ? 'Giữa' : align === 'right' ? 'Phải' : 'Đều'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
