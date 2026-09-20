import React from 'react';
import { Sliders } from 'lucide-react';

interface Props {
  customCss?: string;
  onCustomCssChange: (val: string) => void;
}

export const CustomCssSection: React.FC<Props> = ({ customCss, onCustomCssChange }) => {
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
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <Sliders size={13} />
        Tùy Biến CSS Scoped
      </div>
      <p style={{ fontSize: '11px', color: '#6B7280', margin: '0 0 8px 0' }}>
        Nhập các thuộc tính CSS mở rộng cho khối này:
      </p>
      <textarea
        rows={3}
        className="form-control"
        style={{ fontFamily: 'monospace', fontSize: '11px' }}
        placeholder="opacity: 0.95;&#10;transform: rotate(-1deg);"
        value={customCss || ''}
        onChange={(e) => onCustomCssChange(e.target.value)}
      />
    </div>
  );
};
