import React from 'react';
import { FooterBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const FooterSSR: React.FC<{
  id: string;
  props: FooterBlockProps;
}> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const {
    logo_src,
    logo_alt = 'Logo',
    site_title = 'T-Business CMS',
    tagline,
    copyright = `© ${new Date().getFullYear()} ${site_title}. All rights reserved.`,
    columns = [],
    social_links = [],
  } = props;

  const getSocialText = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return 'Facebook';
      case 'zalo':
        return 'Zalo';
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      case 'phone':
        return 'Hotline';
      case 'email':
        return 'Email';
      default:
        return platform;
    }
  };

  return (
    <footer
      id={`block-${id}`}
      className={`tb-footer ${scopedClass}`}
    >
      <div className="tb-footer-container">
        {/* Top Grid: Brand & Dynamic Columns */}
        <div className="tb-footer-grid">
          {/* Brand Info */}
          <div className="tb-footer-brand">
            <div className="tb-footer-brand-header">
              {logo_src ? (
                <img
                  src={logo_src}
                  alt={logo_alt}
                  className="tb-footer-logo"
                />
              ) : (
                <div className="tb-header-logo-icon">
                  {site_title ? site_title.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
              <span className="tb-footer-title">{site_title}</span>
            </div>

            {tagline && <p className="tb-footer-tagline">{tagline}</p>}

            {/* Social Links */}
            {social_links && social_links.length > 0 && (
              <div className="tb-footer-social">
                {social_links.map((soc, idx) => (
                  <a
                    key={idx}
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="tb-footer-social-link"
                  >
                    {getSocialText(soc.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {columns.map((col, cIdx) => (
            <div key={cIdx} className="tb-footer-col">
              <h4 className="tb-footer-col-title">{col.title}</h4>
              <ul className="tb-footer-col-list">
                {col.links?.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="tb-footer-link"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Copyright */}
        <div className="tb-footer-bottom">
          <div>{copyright}</div>
          <div>Cung cấp bởi nền tảng T-Business CMS</div>
        </div>
      </div>
    </footer>
  );
};
