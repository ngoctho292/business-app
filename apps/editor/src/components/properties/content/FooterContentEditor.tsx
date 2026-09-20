import React from 'react';
import { FooterBlockProps } from '@t-business/shared-types';
import { Image as ImageIcon, Layers, Plus, Trash2, Share2 } from 'lucide-react';

interface Props {
  blockId: string;
  props: FooterBlockProps;
  onUpdateProps: (updates: Partial<FooterBlockProps>) => void;
  onOpenMediaPicker: (propKey: string, label: string) => void;
}

export const FooterContentEditor: React.FC<Props> = ({
  props,
  onUpdateProps,
  onOpenMediaPicker,
}) => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label className="form-label" style={{ fontWeight: 700 }}>Thông Tin Thương Hiệu Footer</label>
        <div>
          <label className="form-label">Tên thương hiệu</label>
          <input
            type="text"
            className="form-control"
            value={props.site_title || ''}
            onChange={(e) => onUpdateProps({ site_title: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Mô tả ngắn Footer</label>
          <textarea
            rows={2}
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
              onClick={() => onOpenMediaPicker('logo_src', 'Chọn Logo Footer')}
            >
              <ImageIcon size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Bản quyền (Copyright)</label>
          <input
            type="text"
            className="form-control"
            value={props.copyright || ''}
            onChange={(e) => onUpdateProps({ copyright: e.target.value })}
          />
        </div>
      </div>

      {/* Quản lý Cột liên kết (Footer Columns) */}
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
            <Layers size={14} />
            Cột Liên Kết Footer ({props.columns?.length || 0})
          </label>
          <button
            className="btn secondary"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              const currentCols = [...(props.columns || [])];
              currentCols.push({
                title: 'Cột mới',
                links: [{ label: 'Liên kết 1', href: '#' }],
              });
              onUpdateProps({ columns: currentCols });
            }}
          >
            <Plus size={12} /> Thêm Cột
          </button>
        </div>

        {(!props.columns || props.columns.length === 0) ? (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
            Chưa có cột nào. Nhấn "+ Thêm Cột" để tạo cột liên kết mới!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {props.columns.map((col: any, colIdx: number) => (
              <div
                key={colIdx}
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '10px',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tiêu đề cột"
                    style={{ flex: 1, fontWeight: 600, fontSize: '12px' }}
                    value={col.title || ''}
                    onChange={(e) => {
                      const newCols = [...(props.columns || [])];
                      newCols[colIdx] = { ...newCols[colIdx], title: e.target.value };
                      onUpdateProps({ columns: newCols });
                    }}
                  />
                  <button
                    className="btn icon-only"
                    title="Xóa cột này"
                    style={{ color: '#EF4444', padding: '4px' }}
                    onClick={() => {
                      const newCols = (props.columns || []).filter((_: any, i: number) => i !== colIdx);
                      onUpdateProps({ columns: newCols });
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Dòng liên kết trong cột */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px', borderLeft: '2px solid #CBD5E1' }}>
                  {col.links && col.links.map((link: any, linkIdx: number) => (
                    <div key={linkIdx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhãn liên kết"
                        style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                        value={link.label || ''}
                        onChange={(e) => {
                          const newCols = [...(props.columns || [])];
                          const newLinks = [...(newCols[colIdx].links || [])];
                          newLinks[linkIdx] = { ...newLinks[linkIdx], label: e.target.value };
                          newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                          onUpdateProps({ columns: newCols });
                        }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Link (href)"
                        style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
                        value={link.href || ''}
                        onChange={(e) => {
                          const newCols = [...(props.columns || [])];
                          const newLinks = [...(newCols[colIdx].links || [])];
                          newLinks[linkIdx] = { ...newLinks[linkIdx], href: e.target.value };
                          newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
                          onUpdateProps({ columns: newCols });
                        }}
                      />
                      <button
                        className="btn icon-only"
                        title="Xóa dòng này"
                        style={{ color: '#EF4444', padding: '2px' }}
                        onClick={() => {
                          const newCols = [...(props.columns || [])];
                          newCols[colIdx].links = (newCols[colIdx].links || []).filter((_: any, lI: number) => lI !== linkIdx);
                          onUpdateProps({ columns: newCols });
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
                      const newCols = [...(props.columns || [])];
                      const currentLinks = [...(newCols[colIdx].links || [])];
                      currentLinks.push({ label: 'Dòng liên kết mới', href: '#' });
                      newCols[colIdx] = { ...newCols[colIdx], links: currentLinks };
                      onUpdateProps({ columns: newCols });
                    }}
                  >
                    <Plus size={10} /> Thêm dòng liên kết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quản lý Mạng Xã Hội (Social Links) */}
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
            <Share2 size={14} />
            Mạng Xã Hội & Liên Hệ ({props.social_links?.length || 0})
          </label>
          <button
            className="btn secondary"
            style={{ fontSize: '11px', padding: '3px 8px' }}
            onClick={() => {
              const currentSocials = [...(props.social_links || [])];
              currentSocials.push({ platform: 'facebook', url: 'https://facebook.com' });
              onUpdateProps({ social_links: currentSocials });
            }}
          >
            <Plus size={12} /> Thêm Mạng Xã Hội
          </button>
        </div>

        {(!props.social_links || props.social_links.length === 0) ? (
          <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '12px' }}>
            Chưa có liên kết mạng xã hội. Nhấn "+ Thêm Mạng Xã Hội"!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {props.social_links.map((soc: any, sIdx: number) => (
              <div key={sIdx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <select
                  className="form-control"
                  style={{ width: '110px', fontSize: '11px', padding: '4px' }}
                  value={soc.platform || 'facebook'}
                  onChange={(e) => {
                    const newSocials = [...(props.social_links || [])];
                    newSocials[sIdx] = { ...newSocials[sIdx], platform: e.target.value as any };
                    onUpdateProps({ social_links: newSocials });
                  }}
                >
                  <option value="facebook">Facebook</option>
                  <option value="zalo">Zalo</option>
                  <option value="youtube">YouTube</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="phone">Hotline/SĐT</option>
                  <option value="email">Email</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder="URL hoặc tel:..., mailto:..."
                  style={{ flex: 1, fontSize: '11px', padding: '4px 8px' }}
                  value={soc.url || ''}
                  onChange={(e) => {
                    const newSocials = [...(props.social_links || [])];
                    newSocials[sIdx] = { ...newSocials[sIdx], url: e.target.value };
                    onUpdateProps({ social_links: newSocials });
                  }}
                />
                <button
                  className="btn icon-only"
                  title="Xóa liên kết"
                  style={{ color: '#EF4444', padding: '4px' }}
                  onClick={() => {
                    const newSocials = (props.social_links || []).filter((_: any, i: number) => i !== sIdx);
                    onUpdateProps({ social_links: newSocials });
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
