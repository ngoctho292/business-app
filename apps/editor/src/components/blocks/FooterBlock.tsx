import React from 'react';
import { FooterBlockProps, Breakpoint, getBlockScopedClass } from '@t-business/shared-types';

interface FooterBlockComponentProps {
  id: string;
  props: FooterBlockProps;
  breakpoint?: Breakpoint;
}

export const FooterBlock: React.FC<FooterBlockComponentProps> = ({ id, props, breakpoint = 'desktop' }) => {
  const scopedClass = getBlockScopedClass(id);
  const {
    logo_src,
    logo_alt = 'Logo',
    site_title = 'Nhà hàng Ẩm thực ABC',
    tagline = 'Không gian ẩm thực Việt đẳng cấp với những món ăn đậm đà bản sắc dân tộc và dịch vụ chu đáo.',
    copyright = `© ${new Date().getFullYear()} Nhà hàng Ẩm thực ABC. Tất cả quyền được bảo lưu.`,
    columns = [
      {
        title: 'Khám phá Menu',
        links: [
          { label: 'Món khai vị đặc sắc', href: '/menu#khai-vi' },
          { label: 'Món chính truyền thống', href: '/menu#mon-chinh' },
          { label: 'Đặc sản ba miền', href: '/menu#dac-san' },
          { label: 'Thực đơn tráng miệng', href: '/menu#trang-mieng' },
        ],
      },
      {
        title: 'Về chúng tôi',
        links: [
          { label: 'Câu chuyện thương hiệu', href: '/about' },
          { label: 'Không gian & Kiến trúc', href: '/space' },
          { label: 'Bếp trưởng & Đội ngũ', href: '/chefs' },
          { label: 'Tuyển dụng nhân sự', href: '/careers' },
        ],
      },
      {
        title: 'Hỗ trợ khách hàng',
        links: [
          { label: 'Chính sách đặt bàn', href: '/terms' },
          { label: 'Hướng dẫn thanh toán', href: '/payment-guide' },
          { label: 'Đặt tiệc & Hội nghị', href: '/events' },
          { label: 'Liên hệ & Góp ý', href: '/contact' },
        ],
      },
    ],
    social_links = [
      { platform: 'facebook', url: 'https://facebook.com' },
      { platform: 'zalo', url: 'https://zalo.me' },
      { platform: 'youtube', url: 'https://youtube.com' },
      { platform: 'phone', url: 'tel:19008888' },
    ],
  } = props;

  const isMobile = breakpoint === 'mobile';

  return (
    <footer
      id={`block-${id}`}
      className={`tb-footer ${isMobile ? 'tb-footer-mobile' : ''} ${scopedClass}`}
    >
      {/* Top Grid: Brand & Dynamic Link Columns */}
      <div className={`tb-footer-grid ${isMobile ? 'tb-footer-grid-mobile' : ''}`}>
        {/* Brand Information */}
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
                  onClick={(e) => e.preventDefault()}
                  className="tb-footer-social-link"
                >
                  {soc.platform}
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
                    onClick={(e) => e.preventDefault()}
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
    </footer>
  );
};
