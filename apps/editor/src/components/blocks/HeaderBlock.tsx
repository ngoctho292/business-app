import React, { useState } from 'react';
import { HeaderBlockProps, Breakpoint, getBlockScopedClass } from '@t-business/shared-types';
import { ChevronDown } from 'lucide-react';

interface HeaderBlockComponentProps {
  id: string;
  props: HeaderBlockProps;
  breakpoint?: Breakpoint;
}

export const HeaderBlock: React.FC<HeaderBlockComponentProps> = ({ id, props, breakpoint = 'desktop' }) => {
  const scopedClass = getBlockScopedClass(id);
  const {
    logo_src,
    logo_alt = 'Logo',
    site_title = 'T-Business CMS',
    tagline,
    nav_links = [
      { label: 'Trang chủ', href: '/' },
      {
        label: 'Sản phẩm',
        href: '/products',
        children: [
          { label: 'Thực đơn chính', href: '/menu-chinh' },
          { label: 'Đồ uống & Tráng miệng', href: '/do-uong' },
          { label: 'Combo ưu đãi', href: '/combo' },
        ],
      },
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Liên hệ', href: '/contact' },
    ],
    sticky = false,
    cta_button = { show: true, label: 'Đặt bàn ngay', href: '#booking' },
  } = props;

  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const isMobile = breakpoint === 'mobile';

  return (
    <header
      id={`block-${id}`}
      className={`tb-header ${sticky ? 'tb-header-sticky' : ''} ${isMobile ? 'tb-header-mobile' : ''} ${scopedClass}`}
    >
      <div className="tb-header-container">
        {/* Brand: Logo & Title */}
        <a href="/" className="tb-header-brand" onClick={(e) => e.preventDefault()}>
          {logo_src ? (
            <img
              src={logo_src}
              alt={logo_alt}
              className="tb-header-logo"
            />
          ) : (
            <div className="tb-header-logo-icon">
              {site_title ? site_title.charAt(0).toUpperCase() : 'T'}
            </div>
          )}
          <div>
            <div className="tb-header-title">{site_title}</div>
            {tagline && <div className="tb-header-tagline">{tagline}</div>}
          </div>
        </a>

        {/* Navigation Links */}
        {nav_links && nav_links.length > 0 && (
          <nav className={`tb-header-nav ${isMobile ? 'tb-header-nav-mobile' : ''}`}>
            {nav_links.map((link, idx) => {
              const hasChildren = link.children && link.children.length > 0;
              const isOpen = activeDropdownIndex === idx;

              return (
                <div
                  key={idx}
                  className="tb-nav-item"
                  onMouseEnter={() => hasChildren && setActiveDropdownIndex(idx)}
                  onMouseLeave={() => hasChildren && setActiveDropdownIndex(null)}
                >
                  <a
                    href={link.href}
                    onClick={(e) => e.preventDefault()}
                    className="tb-nav-link"
                  >
                    <span>{link.label}</span>
                    {hasChildren && (
                      <ChevronDown
                        size={14}
                        className="tb-nav-caret"
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    )}
                  </a>

                  {/* Submenu Dropdown */}
                  {hasChildren && isOpen && (
                    <div className="tb-dropdown-menu tb-dropdown-menu--open">
                      {link.children?.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href={sub.href}
                          onClick={(e) => e.preventDefault()}
                          className="tb-dropdown-link"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        {/* CTA Button */}
        {cta_button?.show && (
          <div className={isMobile ? 'tb-header-cta-mobile' : 'tb-header-cta'}>
            <a
              href={cta_button.href || '#'}
              onClick={(e) => e.preventDefault()}
              className="tb-btn tb-btn-primary"
            >
              {cta_button.label || 'Liên hệ'}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
