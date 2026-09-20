import React, { useState } from 'react';
import { IconBlockProps } from '@t-business/shared-types';
import { Icon } from '@iconify/react';
import { SolarIconPickerModal } from './SolarIconPickerModal';
import { AlignLeft, AlignCenter, AlignRight, Link, Palette, Sparkles } from 'lucide-react';

interface Props {
  blockId: string;
  props: IconBlockProps;
  onUpdateProps: (updates: Partial<IconBlockProps>) => void;
}

const THEME_COLORS = [
  { label: 'Chủ đạo (Primary)', value: 'var(--color-primary, #2F6F4F)' },
  { label: 'Điểm nhấn (Accent)', value: 'var(--color-accent, #52B788)' },
  { label: 'Tối (Dark)', value: '#1F2937' },
  { label: 'Trắng (White)', value: '#FFFFFF' },
  { label: 'Đỏ (Danger)', value: '#EF4444' },
  { label: 'Vàng (Warning)', value: '#F59E0B' },
  { label: 'Xanh dương (Blue)', value: '#3B82F6' },
  { label: 'Tím (Purple)', value: '#8B5CF6' },
];

const BG_SHAPES = [
  { id: 'none', label: 'Không nền' },
  { id: 'circle', label: 'Hình tròn' },
  { id: 'rounded', label: 'Bo góc' },
  { id: 'square', label: 'Hình vuông' },
];

export const IconContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const rawIcon = props.icon || 'solar:star-bold';
  const iconName = rawIcon.startsWith('solar:') ? rawIcon : `solar:${rawIcon}`;
  const size = props.size || 36;
  const color = props.color || 'var(--color-primary, #2F6F4F)';
  const align = props.align || 'center';
  const bgShape = props.bg_shape || 'none';
  const bgColor = props.bg_color || 'rgba(47, 111, 79, 0.1)';
  const padding = props.padding !== undefined ? props.padding : 12;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Icon Preview & Selector Button */}
      <div
        style={{
          padding: '14px',
          borderRadius: '10px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: bgShape === 'circle' ? '50%' : bgShape === 'rounded' ? '10px' : bgShape === 'square' ? '4px' : '8px',
              backgroundColor: bgShape !== 'none' ? bgColor : '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
            }}
          >
            <Icon icon={iconName} width={28} height={28} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {iconName.replace('solar:', '')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
              Solar Icon Set
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsPickerOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={13} /> Đổi Biểu Tượng
        </button>
      </div>

      {/* 2. Kích thước (Size) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label className="form-label" style={{ margin: 0 }}>
            Kích thước biểu tượng: <strong>{size}px</strong>
          </label>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="range"
            min="16"
            max="120"
            step="2"
            value={size}
            onChange={(e) => onUpdateProps({ size: parseInt(e.target.value, 10) })}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min="16"
            max="120"
            value={size}
            onChange={(e) => onUpdateProps({ size: parseInt(e.target.value, 10) || 16 })}
            className="form-control"
            style={{ width: '60px', textAlign: 'center', padding: '4px' }}
          />
        </div>
      </div>

      {/* 3. Màu sắc Biểu Tượng */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Palette size={13} /> Màu sắc biểu tượng
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {THEME_COLORS.map((tc) => (
            <button
              key={tc.label}
              onClick={() => onUpdateProps({ color: tc.value })}
              title={tc.label}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: tc.value.includes('var(') ? 'var(--color-primary)' : tc.value,
                border: color === tc.value ? '2px solid #000' : '1px solid rgba(0,0,0,0.15)',
                cursor: 'pointer',
                boxShadow: color === tc.value ? '0 0 0 2px rgba(47, 111, 79, 0.3)' : 'none',
              }}
            />
          ))}
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onUpdateProps({ color: e.target.value })}
          placeholder="Mã màu (e.g. #2F6F4F hoặc CSS var)"
          className="form-control"
          style={{ fontSize: '11px' }}
        />
      </div>

      {/* 4. Căn Lề (Alignment) */}
      <div>
        <label className="form-label">Căn lề</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
          {[
            { id: 'left', label: 'Trái', icon: <AlignLeft size={14} /> },
            { id: 'center', label: 'Giữa', icon: <AlignCenter size={14} /> },
            { id: 'right', label: 'Phải', icon: <AlignRight size={14} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onUpdateProps({ align: item.id as any })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '6px',
                borderRadius: '6px',
                border: align === item.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: align === item.id ? 'rgba(47, 111, 79, 0.08)' : 'var(--color-surface)',
                color: align === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: align === item.id ? 600 : 400,
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Khung Nền (Background Shape) */}
      <div>
        <label className="form-label">Kiểu khung nền</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
          {BG_SHAPES.map((sh) => (
            <button
              key={sh.id}
              onClick={() => onUpdateProps({ bg_shape: sh.id as any })}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: bgShape === sh.id ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: bgShape === sh.id ? 'rgba(47, 111, 79, 0.08)' : 'var(--color-surface)',
                color: bgShape === sh.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: bgShape === sh.id ? 600 : 400,
                textAlign: 'center',
              }}
            >
              {sh.label}
            </button>
          ))}
        </div>

        {bgShape !== 'none' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', display: 'block' }}>
                Màu nền khung
              </label>
              <input
                type="text"
                value={bgColor}
                onChange={(e) => onUpdateProps({ bg_color: e.target.value })}
                placeholder="rgba(47, 111, 79, 0.1)"
                className="form-control"
                style={{ fontSize: '11px' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                <span>Độ rộng đệm (Padding):</span>
                <strong>{padding}px</strong>
              </div>
              <input
                type="range"
                min="4"
                max="40"
                step="2"
                value={padding}
                onChange={(e) => onUpdateProps({ padding: parseInt(e.target.value, 10) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Liên Kết (Link / URL) */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Link size={13} /> Đường dẫn liên kết (Tùy chọn)
        </label>
        <input
          type="text"
          value={props.href || ''}
          onChange={(e) => onUpdateProps({ href: e.target.value })}
          placeholder="https://zalo.me/... hoặc tel:0988... hoặc #section"
          className="form-control"
          style={{ fontSize: '11px' }}
        />
        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
          Gắn link Zalo, Hotline, Facebook hoặc địa chỉ trang web khi bấm vào icon.
        </span>
      </div>

      {/* Solar Icon Picker Modal */}
      <SolarIconPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedIcon={iconName}
        onSelectIcon={(newIcon) => {
          onUpdateProps({ icon: newIcon });
        }}
      />
    </div>
  );
};
