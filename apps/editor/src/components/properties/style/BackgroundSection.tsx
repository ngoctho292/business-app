import React from 'react';
import { BlockStyleProperties } from '@t-business/shared-types';
import { Palette } from 'lucide-react';

interface Props {
  currentStyles: BlockStyleProperties;
  onStyleChange: (prop: keyof BlockStyleProperties, val: string | number) => void;
}

export const BackgroundSection: React.FC<Props> = ({ currentStyles, onStyleChange }) => {
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
        <Palette size={13} />
        Nền & Màu Sắc (Background)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label className="form-label">Màu nền (Background Color)</label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <input
              type="color"
              value={
                currentStyles.backgroundColor && currentStyles.backgroundColor.startsWith('#')
                  ? currentStyles.backgroundColor
                  : '#FFFFFF'
              }
              onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
              style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="#FFFFFF hoặc transparent"
              value={currentStyles.backgroundColor || ''}
              onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
            />
          </div>
        </div>

        {/* Quick Color Presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['#FFFFFF', '#F8FAFC', '#F3F4F6', '#1E1B4B', '#18181B', 'transparent'].map((hex) => (
            <button
              key={hex}
              onClick={() => onStyleChange('backgroundColor', hex)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: hex === 'transparent' ? '#FFF' : hex,
                border: '1px solid #D1D5DB',
                cursor: 'pointer',
                backgroundImage: hex === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)' : 'none',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 4px 4px',
              }}
              title={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
