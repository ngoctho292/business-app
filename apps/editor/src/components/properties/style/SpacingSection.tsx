import React from 'react';
import { BlockStyleProperties } from '@t-business/shared-types';
import { Maximize2 } from 'lucide-react';

interface Props {
  currentStyles: BlockStyleProperties;
  onStyleChange: (prop: keyof BlockStyleProperties, val: string | number) => void;
}

export const SpacingSection: React.FC<Props> = ({ currentStyles, onStyleChange }) => {
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
        <Maximize2 size={13} />
        Khoảng Cách & Vùng Đệm (Box Model)
      </div>

      {/* Visual Spacing Matrix */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Margin Label */}
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
          Margin (Khoảng cách ngoài)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Top / Trên</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.marginTop || ''}
              onChange={(e) => onStyleChange('marginTop', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Bottom / Dưới</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.marginBottom || ''}
              onChange={(e) => onStyleChange('marginBottom', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Left / Trái</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px / auto"
              value={currentStyles.marginLeft || ''}
              onChange={(e) => onStyleChange('marginLeft', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Right / Phải</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px / auto"
              value={currentStyles.marginRight || ''}
              onChange={(e) => onStyleChange('marginRight', e.target.value)}
            />
          </div>
        </div>

        {/* Padding Label */}
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#0D9488',
            textTransform: 'uppercase',
            marginTop: '6px',
          }}
        >
          Padding (Đệm trong)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Top / Trên</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.paddingTop || ''}
              onChange={(e) => onStyleChange('paddingTop', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Bottom / Dưới</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.paddingBottom || ''}
              onChange={(e) => onStyleChange('paddingBottom', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Left / Trái</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.paddingLeft || ''}
              onChange={(e) => onStyleChange('paddingLeft', e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: '#64748B' }}>Right / Phải</label>
            <input
              type="text"
              className="form-control"
              style={{ fontSize: '11px', padding: '4px 6px' }}
              placeholder="0px"
              value={currentStyles.paddingRight || ''}
              onChange={(e) => onStyleChange('paddingRight', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
