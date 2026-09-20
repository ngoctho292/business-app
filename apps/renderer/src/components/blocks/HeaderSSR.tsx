import React from 'react';
import { HeaderBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const HeaderSSR: React.FC<{
  id: string;
  props: HeaderBlockProps;
}> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const {
    logo_src,
    logo_alt = 'Logo',
    site_title = 'T-Business',
    tagline,
    nav_links = [],
    sticky = false,
    cta_button = { show: true, label: 'Liên hệ', href: '#contact' },
  } = props;

  return (
    <header
      id={`block-${id}`}
      className={`tb-header ${sticky ? 'tb-header-sticky' : ''} ${scopedClass}`}
    >
      <div className="tb-header-container">
        {/* Brand: Logo & Title */}
        <a href="/" className="tb-header-brand">
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

        {/* Navigation Menu with CSS Dropdowns */}
        {nav_links && nav_links.length > 0 && (
          <nav className="tb-header-nav">
            {nav_links.map((link, idx) => {
              const hasChildren = link.children && link.children.length > 0;
              return (
                <div key={idx} className="tb-nav-item">
                  <a href={link.href} className="tb-nav-link">
                    <span>{link.label}</span>
                    {hasChildren && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="tb-nav-caret"
                        aria-hidden="true"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    )}
                  </a>


                  {/* Dropdown Menu */}
                  {hasChildren && (
                    <div className="tb-dropdown-menu">
                      {link.children?.map((sub, sIdx) => (
                        <a
                          key={sIdx}
                          href={sub.href}
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
          <div className="tb-header-cta">
            <a href={cta_button.href || '#'} className="tb-btn tb-btn-primary">
              {cta_button.label || 'Liên hệ'}
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
