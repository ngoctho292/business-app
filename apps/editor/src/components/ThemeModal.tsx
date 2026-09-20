import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useCanvasStore, DEFAULT_THEME } from '../store/canvasStore';
import { SiteThemeDTO } from '@t-business/shared-types';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  theme: SiteThemeDTO;
  previewColors: string[];
}

const PRESETS: ThemePreset[] = [
  {
    id: 'emerald',
    name: '🌿 Ngọc Lục Bảo (Emerald)',
    description: 'Thanh lịch, thiên nhiên, ẩm thực & sức khỏe',
    previewColors: ['#2F6F4F', '#D97706', '#FFFFFF', '#1C1917'],
    theme: {
      primaryColor: '#2F6F4F',
      accentColor: '#D97706',
      backgroundColor: '#FFFFFF',
      textColor: '#1C1917',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      borderRadius: '8px',
    },
  },
  {
    id: 'royal-purple',
    name: '👑 Hoàng Gia (Royal Purple)',
    description: 'Công nghệ cao, SaaS, mỹ phẩm & sáng tạo',
    previewColors: ['#6B4EFF', '#EC4899', '#FAFAFA', '#0F172A'],
    theme: {
      primaryColor: '#6B4EFF',
      accentColor: '#EC4899',
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
      fontHeading: 'Outfit',
      fontBody: 'Inter',
      borderRadius: '12px',
    },
  },
  {
    id: 'corporate-navy',
    name: '💼 Doanh Nghiệp (Corporate Blue)',
    description: 'Tin cậy, tài chính, luật & tập đoàn',
    previewColors: ['#1E3A8A', '#0284C7', '#F8FAFC', '#0F172A'],
    theme: {
      primaryColor: '#1E3A8A',
      accentColor: '#0284C7',
      backgroundColor: '#FFFFFF',
      textColor: '#0F172A',
      fontHeading: 'Roboto',
      fontBody: 'Inter',
      borderRadius: '6px',
    },
  },
  {
    id: 'warm-amber',
    name: '☕ Ấm Áp & Cổ Điển (Warm Amber)',
    description: 'Cafe, nhà hàng, thủ công mỹ nghệ & nghệ thuật',
    previewColors: ['#B45309', '#15803D', '#FFFBEB', '#451A03'],
    theme: {
      primaryColor: '#B45309',
      accentColor: '#15803D',
      backgroundColor: '#FFFDF9',
      textColor: '#451A03',
      fontHeading: 'Playfair Display',
      fontBody: 'Inter',
      borderRadius: '10px',
    },
  },
  {
    id: 'monochrome',
    name: '🖤 Tối Giản Hiện Đại (Monochrome)',
    description: 'Thời trang, nhiếp ảnh & kiến trúc tối giản',
    previewColors: ['#18181B', '#71717A', '#FFFFFF', '#09090B'],
    theme: {
      primaryColor: '#18181B',
      accentColor: '#52525B',
      backgroundColor: '#FFFFFF',
      textColor: '#09090B',
      fontHeading: 'Inter',
      fontBody: 'Inter',
      borderRadius: '2px',
    },
  },
];

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Outfit',
  'Playfair Display',
  'Montserrat',
  'Open Sans',
  'Lora',
];

const RADIUS_OPTIONS = [
  { label: 'Vuông (0px)', value: '0px' },
  { label: 'Nhẹ (4px)', value: '4px' },
  { label: 'Vừa (8px)', value: '8px' },
  { label: 'Tròn (12px)', value: '12px' },
  { label: 'Rất tròn (20px)', value: '20px' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, updateTheme } = useCanvasStore();


  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [currentTheme, setCurrentTheme] = useState<SiteThemeDTO>(theme || DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (theme) setCurrentTheme(theme);
  }, [theme]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetTheme: SiteThemeDTO) => {
    setCurrentTheme(presetTheme);
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await updateTheme(currentTheme);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 800);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu theme');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setCurrentTheme(DEFAULT_THEME);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '780px',
          maxWidth: '100%',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(47,111,79,0.12)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}>
                🎨 Giao Diện & Bảng Màu Thương Hiệu (Theme Editor)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Định nghĩa màu sắc, font chữ và bo góc áp dụng tự động toàn bộ website
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            padding: '0 20px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            gap: '16px',
          }}
        >
          <button
            onClick={() => setActiveTab('presets')}
            style={{
              padding: '12px 4px',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'presets' ? 600 : 400,
              color: activeTab === 'presets' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'presets' ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} /> Mẫu Preset Có Sẵn
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            style={{
              padding: '12px 4px',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              background: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'custom' ? 600 : 400,
              color: activeTab === 'custom' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              borderBottom: activeTab === 'custom' ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sliders size={14} /> Tùy Chỉnh Chi Tiết
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {PRESETS.map((p) => {
                const isSelected =
                  currentTheme.primaryColor === p.theme.primaryColor &&
                  currentTheme.accentColor === p.theme.accentColor;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreset(p.theme)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(47,111,79,0.04)' : 'var(--color-bg)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(47,111,79,0.2)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={12} color="white" />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {p.description}
                    </div>

                    {/* Color Swatch Bars */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      {p.previewColors.map((c, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '24px',
                            backgroundColor: c,
                            borderRadius: '4px',
                            border: '1px solid rgba(0,0,0,0.1)',
                          }}
                          title={c}
                        />
                      ))}
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'flex', gap: '12px' }}>
                      <span>Font: <b>{p.theme.fontHeading}</b></span>
                      <span>Bo góc: <b>{p.theme.borderRadius}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: CUSTOM */}
          {activeTab === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Color Pickers Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Primary Color */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    🎨 Màu Chủ Đạo (Primary Color)
                  </label>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Áp dụng cho nút chính, tiêu đề quan trọng, link
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentTheme.primaryColor || '#2F6F4F'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentTheme.primaryColor || '#2F6F4F'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, primaryColor: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    ✨ Màu Điểm Nhấn (Accent Color)
                  </label>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Áp dụng cho huy hiệu, badge, khuyến mãi, icon
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentTheme.accentColor || '#6B4EFF'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, accentColor: e.target.value })}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentTheme.accentColor || '#6B4EFF'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, accentColor: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Background Color */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    📄 Màu Nền Website (Background)
                  </label>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Màu nền toàn bộ website (trắng, kem, xám nhạt,...)
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentTheme.backgroundColor || '#FFFFFF'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentTheme.backgroundColor || '#FFFFFF'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, backgroundColor: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    🖋️ Màu Chữ Chính (Text Color)
                  </label>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                    Màu văn bản và đoạn văn
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={currentTheme.textColor || '#1F1E1B'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, textColor: e.target.value })}
                      style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={currentTheme.textColor || '#1F1E1B'}
                      onChange={(e) => setCurrentTheme({ ...currentTheme, textColor: e.target.value })}
                      style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                </div>
              </div>

              {/* Typography & Border Radius */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Font Heading */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    🔤 Font Tiêu Đề (Headings)
                  </label>
                  <select
                    value={currentTheme.fontHeading || 'Inter'}
                    onChange={(e) => setCurrentTheme({ ...currentTheme, fontHeading: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '13px', backgroundColor: 'var(--color-surface)' }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Border Radius */}
                <div style={{ padding: '14px', backgroundColor: 'var(--color-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                    🔲 Độ Bo Góc (Border Radius)
                  </label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {RADIUS_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setCurrentTheme({ ...currentTheme, borderRadius: r.value })}
                        style={{
                          flex: 1,
                          padding: '7px 4px',
                          borderRadius: '6px',
                          border: `1px solid ${currentTheme.borderRadius === r.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                          backgroundColor: currentTheme.borderRadius === r.value ? 'rgba(47,111,79,0.1)' : 'var(--color-surface)',
                          color: currentTheme.borderRadius === r.value ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                          fontSize: '11px',
                          fontWeight: currentTheme.borderRadius === r.value ? 600 : 400,
                          cursor: 'pointer',
                        }}
                      >
                        {r.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Mini Preview Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: currentTheme.borderRadius || '8px',
              backgroundColor: currentTheme.backgroundColor || '#FFFFFF',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: currentTheme.fontHeading || 'Inter',
                  color: currentTheme.textColor || '#1F1E1B',
                  fontWeight: 700,
                  fontSize: '16px',
                  marginBottom: '4px',
                }}
              >
                Xem trước diện mạo giao diện
              </div>
              <div
                style={{
                  fontFamily: currentTheme.fontBody || 'Inter',
                  color: currentTheme.textColor || '#1F1E1B',
                  opacity: 0.75,
                  fontSize: '12px',
                }}
              >
                Màu sắc, font chữ và bo góc sẽ được áp dụng tự động trên toàn website
              </div>
            </div>
            <button
              type="button"
              style={{
                backgroundColor: currentTheme.primaryColor || '#2F6F4F',
                color: '#FFFFFF',
                borderRadius: currentTheme.borderRadius || '8px',
                padding: '9px 16px',
                border: 'none',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              Nút Mẫu (Button)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          <button
            type="button"
            className="btn"
            style={{ fontSize: '12px' }}
            onClick={handleResetDefault}
          >
            <RotateCcw size={13} /> Khôi phục mặc định
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" style={{ fontSize: '12px' }} onClick={onClose}>
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveTheme}
              disabled={saving}
              style={{ fontSize: '12px', minWidth: '120px', justifyContent: 'center' }}
            >
              {saving ? (
                'Đang lưu...'
              ) : savedSuccess ? (
                <>
                  <Check size={13} /> Đã áp dụng
                </>
              ) : (
                <>
                  <Check size={13} /> Áp Dụng Theme
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
