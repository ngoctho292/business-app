import React from 'react';
import { HeaderBlockProps } from '@t-business/shared-types';
import { Image as ImageIcon, Menu, Plus, Trash2, CornerDownRight } from 'lucide-react';

interface Props {
  blockId: string;
  props: HeaderBlockProps;
  onUpdateProps: (updates: Partial<HeaderBlockProps>) => void;
  onOpenMediaPicker: (propKey: string, label: string) => void;
}

export const HeaderContentEditor: React.FC<Props> = ({
  props,
  onUpdateProps,
  onOpenMediaPicker,
}) => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="form-label" style={{ fontWeight: 700 }}>Thông Tin Thương Hiệu Header</label>
        <div>
          <label className="form-label">Tên thương hiệu (Site Title)</label>
          <input
            type="text"
            className="form-control"
            value={props.site_title || ''}
            onChange={(e) => onUpdateProps({ site_title: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Khẩu hiệu (Tagline)</label>
          <input
            type="text"
            className="form-control"
            value={props.tagline || ''}
            onChange={(e) => onUpdateProps({ tagline: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Logo URL</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              className="form-control"
              value={props.logo_src || ''}
              onChange={(e) => onUpdateProps({ logo_src: e.target.value })}
            />
            <button
              className="btn secondary"
              onClick={() => onOpenMediaPicker('logo_src', 'Chọn Logo')}
            >
              <ImageIcon size={16} />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <input
            type="checkbox"
            id="sticky-header"
            checked={props.sticky || false}
            onChange={(e) => onUpdateProps({ sticky: e.target.checked })}
          />
          <label htmlFor="sticky-header" style={{ fontSize: '13px', cursor: 'pointer' }}>
            Ghim Header khi cuộn trang (Sticky Header)
          </label>
        </div>
      </div>

      {/* Quản lý Menu điều hướng (Navigation Menu & Submenu) */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="form-label" style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Menu size={14} />
            Menu Điều Hướng ({props.nav_links?.length || 0})
          </label>
          <button
            className="btn secondary"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              const currentLinks = [...(props.nav_links || [])];
              currentLinks.push({ label: 'Menu Mới', href: '#' });
              onUpdateProps({ nav_links: currentLinks });
            }}
          >
            <Plus size={12} /> Thêm Menu
          </button>
        </div>

        {(!props.nav_links || props.nav_links.length === 0) ? (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
            Chưa có menu nào. Nhấn "+ Thêm Menu" để tạo liên kết!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {props.nav_links.map((link: any, idx: number) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '8px',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên Menu (label)"
                    style={{ flex: 1, fontSize: '12px', padding: '4px 8px' }}
                    value={link.label || ''}
                    onChange={(e) => {
                      const newLinks = [...(props.nav_links || [])];
                      newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                      onUpdateProps({ nav_links: newLinks });
                    }}
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Link (href)"
                    style={{ flex: 1, fontSize: '12px', padding: '4px 8px' }}
                    value={link.href || ''}
                    onChange={(e) => {
                      const newLinks = [...(props.nav_links || [])];
                      newLinks[idx] = { ...newLinks[idx], href: e.target.value };
                      onUpdateProps({ nav_links: newLinks });
                    }}
                  />
                  <button
                    className="btn icon-only"
                    title="Xóa menu này"
                    style={{ color: '#EF4444', padding: '4px' }}
                    onClick={() => {
                      const newLinks = (props.nav_links || []).filter((_: any, i: number) => i !== idx);
                      onUpdateProps({ nav_links: newLinks });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Submenu links (Menu con cấp 2) */}
                <div style={{ paddingLeft: '12px', borderLeft: '2px solid #CBD5E1', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {link.children && link.children.map((sub: any, subIdx: number) => (
                    <div key={subIdx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <CornerDownRight size={12} style={{ color: '#9CA3AF' }} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tên Menu con"
                        style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                        value={sub.label || ''}
                        onChange={(e) => {
                          const newLinks = [...(props.nav_links || [])];
                          const newSubs = [...(newLinks[idx].children || [])];
                          newSubs[subIdx] = { ...newSubs[subIdx], label: e.target.value };
                          newLinks[idx] = { ...newLinks[idx], children: newSubs };
                          onUpdateProps({ nav_links: newLinks });
                        }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Link con (href)"
                        style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                        value={sub.href || ''}
                        onChange={(e) => {
                          const newLinks = [...(props.nav_links || [])];
                          const newSubs = [...(newLinks[idx].children || [])];
                          newSubs[subIdx] = { ...newSubs[subIdx], href: e.target.value };
                          newLinks[idx] = { ...newLinks[idx], children: newSubs };
                          onUpdateProps({ nav_links: newLinks });
                        }}
                      />
                      <button
                        className="btn icon-only"
                        title="Xóa menu con"
                        style={{ color: '#EF4444', padding: '2px' }}
                        onClick={() => {
                          const newLinks = [...(props.nav_links || [])];
                          newLinks[idx].children = (newLinks[idx].children || []).filter((_: any, sI: number) => sI !== subIdx);
                          onUpdateProps({ nav_links: newLinks });
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '2px 6px', alignSelf: 'flex-start', marginTop: '2px', borderStyle: 'dashed' }}
                    onClick={() => {
                      const newLinks = [...(props.nav_links || [])];
                      const currentSubs = [...(newLinks[idx].children || [])];
                      currentSubs.push({ label: 'Menu Con Mới', href: '#' });
                      newLinks[idx] = { ...newLinks[idx], children: currentSubs };
                      onUpdateProps({ nav_links: newLinks });
                    }}
                  >
                    <Plus size={10} /> Thêm Menu con
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Header CTA Button */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>Nút Kêu Gọi Hành Động (CTA Header)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="cta-show"
            checked={props.cta_button?.show ?? true}
            onChange={(e) => {
              const currentCta = props.cta_button || { label: 'Đặt ngay', href: '#contact' };
              onUpdateProps({ cta_button: { ...currentCta, show: e.target.checked } });
            }}
          />
          <label htmlFor="cta-show" style={{ fontSize: '13px', cursor: 'pointer' }}>
            Hiển thị Nút CTA ở góc phải Header
          </label>
        </div>
        {(props.cta_button?.show ?? true) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>
              <label className="form-label">Nhãn Nút</label>
              <input
                type="text"
                className="form-control"
                value={props.cta_button?.label || ''}
                placeholder="VD: Đặt bàn ngay"
                onChange={(e) => {
                  const currentCta = props.cta_button || { show: true };
                  onUpdateProps({ cta_button: { ...currentCta, label: e.target.value } });
                }}
              />
            </div>
            <div>
              <label className="form-label">Link (Href)</label>
              <input
                type="text"
                className="form-control"
                value={props.cta_button?.href || ''}
                placeholder="VD: #booking"
                onChange={(e) => {
                  const currentCta = props.cta_button || { show: true };
                  onUpdateProps({ cta_button: { ...currentCta, href: e.target.value } });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
