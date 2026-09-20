import React, { useState } from 'react';
import { BlockStyles, BlockStyleProperties } from '@t-business/shared-types';
import { Smartphone, Tablet } from 'lucide-react';

interface Props {
  styles: BlockStyles;
  onResponsiveStyleChange: (
    bp: 'tablet' | 'mobile',
    prop: keyof BlockStyleProperties,
    val: string
  ) => void;
}

export const ResponsiveOverrideSection: React.FC<Props> = ({
  styles,
  onResponsiveStyleChange,
}) => {
  const [targetResponsiveBp, setTargetResponsiveBp] = useState<'tablet' | 'mobile'>('mobile');

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
        <Smartphone size={14} />
        Đè Kiểu Responsive Cho Mobile / Tablet
      </div>

      {/* Breakpoint Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px' }}>
        <button
          onClick={() => setTargetResponsiveBp('mobile')}
          style={{
            padding: '6px',
            fontSize: '11px',
            border: targetResponsiveBp === 'mobile' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            backgroundColor: targetResponsiveBp === 'mobile' ? 'rgba(47,111,79,0.1)' : '#FFFFFF',
            color: targetResponsiveBp === 'mobile' ? 'var(--color-primary)' : '#4B5563',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: targetResponsiveBp === 'mobile' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Smartphone size={13} />
          📱 Mobile (≤768px)
        </button>
        <button
          onClick={() => setTargetResponsiveBp('tablet')}
          style={{
            padding: '6px',
            fontSize: '11px',
            border: targetResponsiveBp === 'tablet' ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
            backgroundColor: targetResponsiveBp === 'tablet' ? 'rgba(47,111,79,0.1)' : '#FFFFFF',
            color: targetResponsiveBp === 'tablet' ? 'var(--color-primary)' : '#4B5563',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: targetResponsiveBp === 'tablet' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Tablet size={13} />
          📟 Tablet (≤1024px)
        </button>
      </div>

      {/* Responsive Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <label className="form-label">Cỡ chữ trên {targetResponsiveBp} (Font Size)</label>
          <input
            type="text"
            className="form-control"
            placeholder="VD: 18px"
            value={styles.responsive?.[targetResponsiveBp]?.fontSize || ''}
            onChange={(e) => onResponsiveStyleChange(targetResponsiveBp, 'fontSize', e.target.value)}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label className="form-label">Padding Dọc</label>
            <input
              type="text"
              className="form-control"
              placeholder="16px"
              value={styles.responsive?.[targetResponsiveBp]?.paddingTop || ''}
              onChange={(e) => {
                onResponsiveStyleChange(targetResponsiveBp, 'paddingTop', e.target.value);
                onResponsiveStyleChange(targetResponsiveBp, 'paddingBottom', e.target.value);
              }}
            />
          </div>
          <div>
            <label className="form-label">Padding Ngang</label>
            <input
              type="text"
              className="form-control"
              placeholder="12px"
              value={styles.responsive?.[targetResponsiveBp]?.paddingLeft || ''}
              onChange={(e) => {
                onResponsiveStyleChange(targetResponsiveBp, 'paddingLeft', e.target.value);
                onResponsiveStyleChange(targetResponsiveBp, 'paddingRight', e.target.value);
              }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div>
            <label className="form-label">Rộng ({targetResponsiveBp})</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 100%, 280px"
              value={styles.responsive?.[targetResponsiveBp]?.width || ''}
              onChange={(e) => onResponsiveStyleChange(targetResponsiveBp, 'width', e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Cao tối đa ({targetResponsiveBp})</label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: 250px, auto"
              value={styles.responsive?.[targetResponsiveBp]?.maxHeight || ''}
              onChange={(e) => onResponsiveStyleChange(targetResponsiveBp, 'maxHeight', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="form-label">Hiển thị (Display)</label>
          <select
            className="form-control"
            value={styles.responsive?.[targetResponsiveBp]?.display || ''}
            onChange={(e) => onResponsiveStyleChange(targetResponsiveBp, 'display', e.target.value)}
          >
            <option value="">Kế thừa từ Desktop</option>
            <option value="block">Khối (block)</option>
            <option value="none">Ẩn trên {targetResponsiveBp} (none)</option>
            <option value="flex">Flexbox (flex)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
