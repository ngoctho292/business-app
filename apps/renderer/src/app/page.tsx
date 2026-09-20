'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PortalLandingPage() {
  const [inputDomain, setInputDomain] = useState('');

  const handleSearchSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDomain.trim()) return;
    const cleanDomain = inputDomain.trim().toLowerCase();
    window.location.href = `/?site=${cleanDomain}`;
  };

  const sampleSites = [
    {
      name: 'Nhà Hàng Ẩm Thực ABC',
      domain: 'nhahangabc.local',
      category: 'Ẩm thực & F&B',
      desc: 'Mẫu website nhà hàng sang trọng với thực đơn món ăn động từ CMS, đặt bàn trực tuyến và header sticky.',
      icon: '🍜',
      badge: 'F&B Demo',
    },
    {
      name: 'Blog & Portfolio Cá Nhân',
      domain: 'nguyenngoctho-blog',
      category: 'Blog & Doanh nghiệp',
      desc: 'Website giới thiệu dịch vụ, bài viết chuyên môn và liên kết mạng xã hội đa kênh.',
      icon: '💼',
      badge: 'Blog / Service',
    },
    {
      name: 'Thời Trang & Phong Cách Sống',
      domain: 'fashion-store.local',
      category: 'Bán lẻ & E-Commerce',
      desc: 'Bộ sưu tập sản phẩm phong cách hiện đại với danh mục hình ảnh và nút kêu gọi hành động CTA nổi bật.',
      icon: '🛍️',
      badge: 'E-Commerce',
    },
  ];

  return (
    <div style={styles.page}>
      {/* Platform Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div style={styles.brand}>
            <div style={styles.brandLogo}>T</div>
            <span style={styles.brandName}>T-Business CMS</span>
            <span style={styles.brandBadge}>Multi-Tenant Engine</span>
          </div>

          <div style={styles.headerNav}>
            <a href="#features" style={styles.navLink}>Tính năng</a>
            <a href="#demo-sites" style={styles.navLink}>Websites Mẫu</a>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              style={styles.editorButton}
            >
              🛠️ Mở Trình Quản Trị (Port 5173) ↗
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContainer}>
          <div style={styles.taglineBadge}>
            <span style={{ fontSize: '14px' }}>⚡</span> Nền tảng Headless CMS & Visual Drag-and-Drop
          </div>

          <h1 style={styles.heroTitle}>
            Xây dựng & Vận hành Website <br />
            <span style={styles.gradientText}>Đa Doanh Nghiệp (Multi-Tenant)</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Kết hợp sức mạnh kết xuất máy chủ siêu tốc của <strong>Next.js 14 SSR</strong>, trình kéo thả khối trực quan
            và hệ thống quản trị dữ liệu động linh hoạt dành cho mọi quy mô doanh nghiệp.
          </p>

          {/* Quick Domain Finder Form */}
          <form onSubmit={handleSearchSite} style={styles.searchCard}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            <input
              type="text"
              placeholder="Nhập tên miền site (VD: nhahangabc.local hoặc nguyenngoctho-blog)..."
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              style={styles.searchInput}
            />
            <button type="submit" style={styles.searchButton}>
              Mở Website Live →
            </button>
          </form>

          <div style={styles.quickLinksHint}>
            <span>Gợi ý mở nhanh:</span>
            {sampleSites.map((s) => (
              <a
                key={s.domain}
                href={`/?site=${s.domain}`}
                style={styles.quickChip}
              >
                {s.icon} {s.domain}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Sites Explorer */}
      <section id="demo-sites" style={styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🌐 Danh Sách Website Mẫu (Live Demo)</h2>
            <p style={styles.sectionSubtitle}>
              Mỗi website hoạt động độc lập dưới một tenant riêng biệt, tự động render theo thời gian thực từ dữ liệu máy chủ.
            </p>
          </div>

          <div style={styles.siteGrid}>
            {sampleSites.map((site) => (
              <a
                key={site.domain}
                href={`/?site=${site.domain}`}
                style={styles.siteCard}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{site.icon}</span>
                  <span style={styles.cardBadge}>{site.badge}</span>
                </div>
                <h3 style={styles.cardTitle}>{site.name}</h3>
                <div style={styles.cardDomain}>🔗 {site.domain}</div>
                <p style={styles.cardDesc}>{site.desc}</p>
                <div style={styles.cardAction}>
                  <span>Xem trang trực tiếp</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" style={{ ...styles.section, backgroundColor: '#F4F2EC' }}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>🚀 Kiến Trúc Công Nghệ Đột Phá</h2>
            <p style={styles.sectionSubtitle}>
              Thiết kế theo mô hình Micro-Frontend và Headless kiến trúc phân tầng chuẩn Enterprise.
            </p>
          </div>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🎨</div>
              <h3 style={styles.featureTitle}>Visual Drag & Drop Editor</h3>
              <p style={styles.featureDesc}>
                Kéo thả các khối Header, Section, Footer, Media, Form và Danh mục CMS mượt mà với 3 chế độ Responsive Desktop, Tablet và Mobile.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>⚡</div>
              <h3 style={styles.featureTitle}>Next.js 14 SSR & Edge ISR</h3>
              <p style={styles.featureDesc}>
                Kết xuất giao diện phía Server đạt điểm tối đa SEO & tốc độ tải trang dưới 0.5s. Tự động kích hoạt cơ chế On-demand ISR Revalidation khi xuất bản.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🏢</div>
              <h3 style={styles.featureTitle}>Multi-Tenant Routing</h3>
              <p style={styles.featureDesc}>
                Middleware thông minh tự động phân giải từng website khách hàng thông qua Custom Domain hoặc Host Header mà không cần deploy lại.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📦</div>
              <h3 style={styles.featureTitle}>Dynamic Headless CMS</h3>
              <p style={styles.featureDesc}>
                Tự do định nghĩa cấu trúc dữ liệu tùy ý (Content Types & Fields) và liên kết động trực tiếp vào các khối giao diện trên website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBox}>
          <h2 style={styles.ctaTitle}>Sẵn sàng thiết kế website tiếp theo?</h2>
          <p style={styles.ctaSubtitle}>
            Mở ngay trình quản trị để tạo website, cấu hình Header/Footer và xuất bản chỉ trong vài giây.
          </p>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            style={styles.ctaButton}
          >
            🚀 Bắt đầu Thiết Kế Ngay (Port 5173)
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1F1E1B' }}>T-Business Multi-tenant CMS</div>
            <div style={{ fontSize: '13px', color: '#6B6A63', marginTop: '4px' }}>
              Hệ thống quản trị & kết xuất website doanh nghiệp đa người dùng.
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#9E9D95' }}>
            © {new Date().getFullYear()} T-Business Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FAF9F5',
    color: '#1F1E1B',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #EAE8E0',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  headerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandLogo: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #2F6F4F, #1E4620)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
    boxShadow: '0 2px 8px rgba(47, 111, 79, 0.25)',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1F1E1B',
    letterSpacing: '-0.02em',
  },
  brandBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(47, 111, 79, 0.1)',
    color: '#2F6F4F',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    fontSize: '14px',
    color: '#6B6A63',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'color 0.15s',
  },
  editorButton: {
    padding: '8px 18px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #2F6F4F, #23533B)',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 600,
    boxShadow: '0 2px 10px rgba(47, 111, 79, 0.25)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  hero: {
    padding: '70px 24px 60px',
    textAlign: 'center',
    background: 'radial-gradient(ellipse at top, #F2EDE4 0%, #FAF9F5 70%)',
  },
  heroContainer: {
    maxWidth: '860px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  taglineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E2DC',
    fontSize: '13px',
    fontWeight: 600,
    color: '#2F6F4F',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    marginBottom: '24px',
  },
  heroTitle: {
    fontSize: '44px',
    fontWeight: 800,
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
    color: '#1F1E1B',
    margin: '0 0 16px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #2F6F4F 0%, #166534 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#6B6A63',
    maxWidth: '680px',
    margin: '0 0 36px',
  },
  searchCard: {
    width: '100%',
    maxWidth: '640px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCD8CD',
    borderRadius: '12px',
    padding: '6px 8px 6px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#1F1E1B',
    background: 'transparent',
  },
  searchButton: {
    padding: '12px 20px',
    borderRadius: '8px',
    backgroundColor: '#2F6F4F',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  },
  quickLinksHint: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#9E9D95',
  },
  quickChip: {
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E2DC',
    color: '#2F6F4F',
    textDecoration: 'none',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  section: {
    padding: '64px 24px',
  },
  sectionContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '640px',
    margin: '0 auto 48px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#1F1E1B',
    margin: '0 0 8px',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: '#6B6A63',
    lineHeight: '1.5',
    margin: 0,
  },
  siteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E6E4DC',
    padding: '28px 24px',
    display: 'flex',
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  cardIcon: {
    fontSize: '28px',
  },
  cardBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#F4F2EC',
    color: '#6B6A63',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1F1E1B',
    margin: '0 0 4px',
  },
  cardDomain: {
    fontSize: '12px',
    color: '#2F6F4F',
    fontWeight: 600,
    fontFamily: 'monospace',
    marginBottom: '12px',
  },
  cardDesc: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#6B6A63',
    margin: '0 0 20px',
    flex: 1,
  },
  cardAction: {
    borderTop: '1px solid #F0EFEA',
    paddingTop: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: 600,
    color: '#2F6F4F',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    padding: '24px',
    border: '1px solid #E6E4DC',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
  },
  featureIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1F1E1B',
    margin: '0 0 8px',
  },
  featureDesc: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#6B6A63',
    margin: 0,
  },
  ctaSection: {
    padding: '40px 24px 80px',
  },
  ctaBox: {
    maxWidth: '1000px',
    margin: '0 auto',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #2F6F4F, #193E2B)',
    color: '#FFFFFF',
    padding: '48px 32px',
    textAlign: 'center',
    boxShadow: '0 12px 40px rgba(47, 111, 79, 0.3)',
  },
  ctaTitle: {
    fontSize: '28px',
    fontWeight: 800,
    margin: '0 0 10px',
  },
  ctaSubtitle: {
    fontSize: '15px',
    opacity: 0.85,
    maxWidth: '540px',
    margin: '0 auto 28px',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    color: '#1F1E1B',
    fontSize: '15px',
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.15s',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #EAE8E0',
    padding: '28px 24px',
  },
  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
};
