import React from 'react';
import { BlockStyleProperties } from '@t-business/shared-types';
import { Square } from 'lucide-react';

interface Props {
  currentStyles: BlockStyleProperties;
  onStyleChange: (prop: keyof BlockStyleProperties, val: string | number) => void;
}

export const BordersSection: React.FC<Props> = ({ currentStyles, onStyleChange }) => {
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
        <Square size={13} />
        Bo Góc, Viền & Đổ Bóng (Borders)
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label className="form-label">Bo góc (Border Radius)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
            {[
              { label: '0', val: '0px' },
              { label: '4px', val: '4px' },
              { label: '8px', val: '8px' },
              { label: '16px', val: '16px' },
              { label: 'Tròn', val: '9999px' },
            ].map((rad) => (
              <button
                key={rad.val}
                onClick={() => onStyleChange('borderRadius', rad.val)}
                style={{
                  padding: '4px',
                  fontSize: '11px',
                  border: currentStyles.borderRadius === rad.val ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: currentStyles.borderRadius === rad.val ? 'rgba(47,111,79,0.1)' : '#FFFFFF',
                  color: currentStyles.borderRadius === rad.val ? 'var(--color-primary)' : '#4B5563',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {rad.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label className="form-label">Độ dày viền (Width)</label>
            <input
              type="text"
              className="form-control"
              placeholder="1px"
              value={currentStyles.borderWidth || ''}
              onChange={(e) => onStyleChange('borderWidth', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Kiểu viền (Style)</label>
            <select
              className="form-control"
              value={currentStyles.borderStyle || 'none'}
              onChange={(e) => onStyleChange('borderStyle', e.target.value)}
            >
              <option value="none">Không viền (none)</option>
              <option value="solid">Nét liền (solid)</option>
              <option value="dashed">Nét đứt (dashed)</option>
              <option value="dotted">Chấm chấm (dotted)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Đổ bóng (Box Shadow)</label>
          <select
            className="form-control"
            value={currentStyles.boxShadow || 'none'}
            onChange={(e) => onStyleChange('boxShadow', e.target.value)}
          >
            <option value="none">Không đổ bóng (None)</option>
            <option value="0 1px 3px rgba(0,0,0,0.08)">Nhẹ (Small)</option>
            <option value="0 4px 14px rgba(0,0,0,0.1)">Trung bình (Medium)</option>
            <option value="0 10px 25px rgba(0,0,0,0.15)">Nổi bật (Large)</option>
            <option value="0 20px 40px rgba(0,0,0,0.2)">Floating 3D</option>
          </select>
        </div>
      </div>
    </div>
  );
};
