import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../services/apiClient';
import { SiteMembersModal } from '../components/SiteMembersModal';
import { CustomDomainModal } from '../components/CustomDomainModal';
import { PricingModal } from '../components/PricingModal';
import { Users, Globe, Crown, Trash2 } from 'lucide-react';


interface Site {
  id: string;
  name: string;
  domain: string;
  custom_domain?: string | null;
  domain_verified?: boolean;
  role: string;
}

interface Page {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  current_version_id: string | null;
}

interface SitesDashboardProps {
  onOpenEditor: (site: Site, page: Page) => void;
}

export const SitesDashboard: React.FC<SitesDashboardProps> = ({ onOpenEditor }) => {
  const { user, logout } = useAuthStore();

  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagesLoading, setPagesLoading] = useState(false);

  // Modals
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Modal tạo site mới
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteDomain, setNewSiteDomain] = useState('');
  const [creatingsite, setCreatingSite] = useState(false);


  // Modal tạo page mới
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageSlug, setNewPageSlug] = useState('');
  const [creatingPage, setCreatingPage] = useState(false);


  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<Site[]>('/me/sites');
      setSites(data || []);
    } catch (err: any) {
      console.warn('Không thể tải danh sách sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSite = async (site: Site) => {
    setSelectedSite(site);
    setPagesLoading(true);
    try {
      const data = await apiClient.get<Page[]>(`/me/sites/${site.id}/pages`);
      setPages(data || []);
    } catch (err: any) {
      console.warn('Không thể tải danh sách trang:', err);
    } finally {
      setPagesLoading(false);
    }
  };

  const handleCreateSite = async () => {
    if (!newSiteName.trim() || !newSiteDomain.trim()) return;
    setCreatingSite(true);
    try {
      await apiClient.post('/sites', { name: newSiteName.trim(), domain: newSiteDomain.trim() });
      setShowNewSiteModal(false);
      setNewSiteName('');
      setNewSiteDomain('');
      await loadSites();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo site');
    } finally {
      setCreatingSite(false);
    }
  };

  const handleCreatePage = async () => {
    if (!selectedSite || !newPageSlug.trim()) return;
    setCreatingPage(true);
    try {
      await apiClient.post(`/sites/${selectedSite.id}/pages`, { slug: newPageSlug.trim() });
      setShowNewPageModal(false);
      setNewPageSlug('');
      await handleSelectSite(selectedSite);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo trang');
    } finally {
      setCreatingPage(false);
    }
  };

  const handleOpenEditor = (page: Page) => {
    if (!selectedSite) return;
    onOpenEditor(selectedSite, page);
  };

  const handleDeleteSite = async (siteId: string, siteName: string, siteDomain: string) => {
    if (!window.confirm(`⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn xoá vĩnh viễn website "${siteName}" (${siteDomain}) không?\n\nTất cả các trang, khối nội dung và dữ liệu liên quan sẽ bị xoá vĩnh viễn và không thể khôi phục!`)) {
      return;
    }
    try {
      await apiClient.delete(`/sites/${siteId}`);
      if (selectedSite?.id === siteId) {
        setSelectedSite(null);
        setPages([]);
      }
      await loadSites();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá website');
    }
  };

  const handleDeletePage = async (pageId: string, pageSlug: string) => {
    if (!selectedSite) return;
    if (pageSlug === 'home') {
      alert('Không thể xoá trang chủ (Home)');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xoá trang "/${pageSlug}" không? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      await apiClient.delete(`/sites/${selectedSite.id}/pages/${pageId}`);
      await handleSelectSite(selectedSite);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá trang');
    }
  };

  return (
    <div style={s.container}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoIcon}>T</div>
          <span style={s.headerTitle}>T-Business CMS</span>
        </div>
        <div style={s.headerRight}>
          <button
            onClick={() => setShowPricingModal(true)}
            style={{
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
            }}
          >
            <Crown size={15} /> Gói Dịch Vụ
          </button>
          <div style={s.userBadge}>
            <div style={s.userAvatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <button id="logout-btn" onClick={logout} style={s.logoutBtn}>
            🚪 Đăng xuất
          </button>
        </div>

      </header>

      <div style={s.body}>
        {/* Sidebar: Sites */}
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <h2 style={s.sidebarTitle}>🌐 Websites của tôi</h2>
            <button id="new-site-btn" onClick={() => setShowNewSiteModal(true)} style={s.addBtn}>
              + Thêm
            </button>
          </div>

          {loading ? (
            <div style={s.emptyState}>Đang tải...</div>
          ) : sites.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌱</div>
              <div>Chưa có website nào</div>
              <button onClick={() => setShowNewSiteModal(true)} style={s.createFirstBtn}>
                Tạo website đầu tiên
              </button>
            </div>
          ) : (
            <div style={s.siteList}>
              {sites.map((site) => (
                <div
                  key={site.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    borderRadius: '10px',
                    ...(selectedSite?.id === site.id ? s.siteItemActive : {}),
                  }}
                >
                  <button
                    id={`site-${site.id}`}
                    onClick={() => handleSelectSite(site)}
                    style={{
                      ...s.siteItem,
                      border: 'none',
                      background: 'transparent',
                      flex: 1,
                    }}
                  >
                    <div style={s.siteItemIcon}>🌐</div>
                    <div style={s.siteItemInfo}>
                      <div style={s.siteItemName}>{site.name}</div>
                      <div style={s.siteItemDomain}>{site.domain}</div>
                    </div>
                    <div style={{
                      ...s.roleBadge,
                      background: site.role === 'owner' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                      color: site.role === 'owner' ? '#818cf8' : '#34d399',
                    }}>
                      {site.role}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`http://localhost:3000?site=${site.domain}`, '_blank');
                    }}
                    title={`Mở website ${site.domain} trong tab mới`}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.4)',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#34d399';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    ↗
                  </button>
                  {(site.role === 'owner' || site.role === 'platform_admin') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSite(site.id, site.name, site.domain);
                      }}
                      title={`Xoá website ${site.name}`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255,255,255,0.3)',
                        padding: '8px 8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main: Pages */}
        <div style={s.main}>
          {!selectedSite ? (
            <div style={s.welcomeState}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>👈</div>
              <h3 style={s.welcomeTitle}>Chọn website để bắt đầu</h3>
              <p style={s.welcomeDesc}>Chọn một website ở bên trái để xem và chỉnh sửa các trang</p>
            </div>
          ) : (
            <>
              <div style={s.mainHeader}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={s.mainTitle}>📄 Trang của {selectedSite.name}</h2>
                    <button
                      onClick={() => window.open(`http://localhost:3000?site=${selectedSite.domain}`, '_blank')}
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '6px',
                        color: '#34d399',
                        padding: '3px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Mở website live trong tab mới"
                    >
                      🌐 Xem Site Live ↗
                    </button>
                  </div>
                  <p style={s.mainSubtitle}>{selectedSite.domain}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    id="site-domain-btn"
                    onClick={() => setShowDomainModal(true)}
                    style={{
                      ...s.viewSiteBtn,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: selectedSite.custom_domain && selectedSite.domain_verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      borderColor: selectedSite.custom_domain && selectedSite.domain_verified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                      color: selectedSite.custom_domain && selectedSite.domain_verified ? '#34d399' : '#fcd34d',
                    }}
                    title="Cấu hình và xác thực tên miền riêng"
                  >
                    <Globe size={14} /> 🌐 Tên Miền Riêng
                    {selectedSite.custom_domain && (
                      <span style={{ fontSize: '10px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px' }}>
                        {selectedSite.domain_verified ? '✔' : 'Chờ DNS'}
                      </span>
                    )}
                  </button>

                  <button
                    id="site-members-btn"
                    onClick={() => setShowMembersModal(true)}
                    style={{
                      ...s.viewSiteBtn,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      borderColor: 'rgba(99, 102, 241, 0.3)',
                      color: '#a5b4fc',
                    }}
                    title="Quản lý thành viên và phân quyền website"
                  >
                    <Users size={14} /> 👥 Thành Viên
                  </button>
                  <button
                    id="open-site-live-btn"
                    onClick={() => window.open(`http://localhost:3000?site=${selectedSite.domain}`, '_blank')}
                    style={s.viewSiteBtn}
                    title="Mở website này trực tiếp trên trình duyệt"
                  >
                    🌐 Mở Website (Live)
                  </button>
                  <button
                    id="new-page-btn"
                    onClick={() => setShowNewPageModal(true)}
                    style={s.newPageBtn}
                  >
                    + Tạo trang mới
                  </button>
                  {(selectedSite.role === 'owner' || selectedSite.role === 'platform_admin') && (
                    <button
                      id="delete-site-btn"
                      onClick={() => handleDeleteSite(selectedSite.id, selectedSite.name, selectedSite.domain)}
                      style={{
                        ...s.viewSiteBtn,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                      }}
                      title="Xoá vĩnh viễn website này"
                    >
                      <Trash2 size={13} /> Xoá Site
                    </button>
                  )}
                </div>


              </div>

              {pagesLoading ? (
                <div style={s.emptyState}>Đang tải trang...</div>
              ) : pages.length === 0 ? (
                <div style={s.welcomeState}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
                  <h3 style={s.welcomeTitle}>Chưa có trang nào</h3>
                  <button onClick={() => setShowNewPageModal(true)} style={s.newPageBtn}>
                    + Tạo trang đầu tiên
                  </button>
                </div>
              ) : (
                <div style={s.pageGrid}>
                  {pages.map((page) => (
                    <div key={page.id} style={{ position: 'relative' }}>
                      <button
                        id={`page-${page.id}`}
                        onClick={() => handleOpenEditor(page)}
                        style={{ ...s.pageCard, width: '100%' }}
                      >
                        <div style={s.pageCardIcon}>
                          {page.slug === 'home' ? '🏠' : '📄'}
                        </div>
                        <div style={s.pageCardSlug}>/{page.slug}</div>
                        <div style={{
                          ...s.statusBadge,
                          background: page.status === 'published' ? 'rgba(16,185,129,0.15)' : 'rgba(251,191,36,0.15)',
                          color: page.status === 'published' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${page.status === 'published' ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
                        }}>
                          {page.status === 'published' ? '✅ Đã xuất bản' : '📝 Bản nháp'}
                        </div>
                        <div style={s.editHint}>Nhấp để chỉnh sửa →</div>
                      </button>
                      {page.slug !== 'home' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(page.id, page.slug);
                          }}
                          title={`Xoá trang /${page.slug}`}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.4)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.15s ease',
                            zIndex: 5,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ef4444';
                            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: Tạo Site Mới */}
      {showNewSiteModal && (
        <div style={s.modalOverlay} onClick={() => setShowNewSiteModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>🌐 Tạo Website Mới</h3>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Tên website</label>
              <input
                id="new-site-name"
                style={s.modalInput}
                placeholder="Nhà hàng ABC"
                value={newSiteName}
                onChange={(e) => setNewSiteName(e.target.value)}
                autoFocus
              />
            </div>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Domain (tên miền)</label>
              <input
                id="new-site-domain"
                style={s.modalInput}
                placeholder="nhahangabc.local"
                value={newSiteDomain}
                onChange={(e) => setNewSiteDomain(e.target.value)}
              />
            </div>
            <div style={s.modalActions}>
              <button onClick={() => setShowNewSiteModal(false)} style={s.cancelBtn}>Huỷ</button>
              <button
                id="confirm-new-site"
                onClick={handleCreateSite}
                disabled={creatingsite}
                style={s.confirmBtn}
              >
                {creatingsite ? 'Đang tạo...' : 'Tạo Website'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tạo Page Mới */}
      {showNewPageModal && (
        <div style={s.modalOverlay} onClick={() => setShowNewPageModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={s.modalTitle}>📄 Tạo Trang Mới</h3>
            <div style={s.modalField}>
              <label style={s.modalLabel}>Slug (đường dẫn trang)</label>
              <div style={s.slugWrap}>
                <span style={s.slugPrefix}>/</span>
                <input
                  id="new-page-slug"
                  style={{ ...s.modalInput, paddingLeft: '8px', borderLeft: 'none', borderRadius: '0 8px 8px 0' }}
                  placeholder="about, menu, contact..."
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                  autoFocus
                />
              </div>
              <span style={s.slugHint}>Chỉ dùng chữ thường, số và dấu gạch ngang</span>
            </div>
            <div style={s.modalActions}>
              <button onClick={() => setShowNewPageModal(false)} style={s.cancelBtn}>Huỷ</button>
              <button
                id="confirm-new-page"
                onClick={handleCreatePage}
                disabled={creatingPage || !newPageSlug.trim()}
                style={s.confirmBtn}
              >
                {creatingPage ? 'Đang tạo...' : 'Tạo Trang'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản Lý Thành Viên */}
      <SiteMembersModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        siteId={selectedSite?.id || ''}
        siteName={selectedSite?.name || ''}
      />

      {/* Modal Cài Đặt Tên Miền Riêng */}
      <CustomDomainModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        siteId={selectedSite?.id || ''}
        onSiteUpdated={() => loadSites()}
      />

      {/* Modal Bảng Giá & Gói Dịch Vụ SaaS */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
      />

      <style>{`

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};


const s: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    fontFamily: "'Inter', system-ui, sans-serif", color: 'white',
  },
  header: {
    height: '60px', background: 'rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white', fontSize: '16px', fontWeight: '800',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: 'white', fontSize: '16px', fontWeight: '700' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '600',
  },
  userName: { color: 'rgba(255,255,255,0.8)', fontSize: '14px' },
  logoutBtn: {
    padding: '6px 14px', background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px',
    color: '#f87171', fontSize: '13px', cursor: 'pointer',
  },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: {
    width: '280px', borderRight: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '20px 16px 12px', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  sidebarTitle: { color: 'white', fontSize: '14px', fontWeight: '600', margin: 0 },
  addBtn: {
    padding: '4px 12px', background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px',
    color: '#818cf8', fontSize: '12px', cursor: 'pointer', fontWeight: '500',
  },
  siteList: { padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' },
  siteItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px',
    background: 'transparent', border: '1px solid transparent',
    cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s',
    color: 'rgba(255,255,255,0.7)',
  },
  siteItemActive: {
    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
    color: 'white',
  },
  siteItemIcon: { fontSize: '18px', flexShrink: 0 },
  siteItemInfo: { flex: 1, minWidth: 0 },
  siteItemName: { fontWeight: '600', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  siteItemDomain: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '1px' },
  roleBadge: { fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 },
  emptyState: { padding: '32px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '13px' },
  createFirstBtn: {
    marginTop: '12px', padding: '8px 16px',
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px', color: '#818cf8', fontSize: '13px', cursor: 'pointer',
  },
  main: { flex: 1, overflowY: 'auto', padding: '24px' },
  mainHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  mainTitle: { color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 2px' },
  mainSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 },
  welcomeState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '60vh', textAlign: 'center',
  },
  welcomeTitle: { color: 'rgba(255,255,255,0.7)', fontSize: '20px', fontWeight: '600', margin: '0 0 8px' },
  welcomeDesc: { color: 'rgba(255,255,255,0.35)', fontSize: '14px', maxWidth: '320px' },
  viewSiteBtn: {
    padding: '10px 18px',
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '10px',
    color: '#34d399',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s',
  },
  newPageBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '10px', color: 'white',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
  },
  pageGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  pageCard: {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '14px', padding: '20px 16px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
    color: 'white',
  },
  pageCardIcon: { fontSize: '32px' },
  pageCardSlug: { color: 'white', fontSize: '15px', fontWeight: '600' },
  statusBadge: { padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '500' },
  editHint: { color: 'rgba(99,102,241,0.7)', fontSize: '12px', marginTop: '4px' },
  // Modals
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, animation: 'fadeIn 0.2s',
  },
  modal: {
    background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '28px 32px', width: '380px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  modalTitle: { color: 'white', fontSize: '18px', fontWeight: '700', margin: '0 0 20px' },
  modalField: { marginBottom: '16px' },
  modalLabel: { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginBottom: '6px' },
  modalInput: {
    width: '100%', padding: '10px 12px',
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  slugWrap: { display: 'flex', alignItems: 'center' },
  slugPrefix: {
    padding: '10px 4px 10px 12px', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRight: 'none',
    borderRadius: '8px 0 0 8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px',
  },
  slugHint: { color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '4px', display: 'block' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '8px 16px', background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)', fontSize: '14px', cursor: 'pointer',
  },
  confirmBtn: {
    padding: '8px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none', borderRadius: '8px', color: 'white',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
};
