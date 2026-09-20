import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { useAuthStore } from '../store/authStore';
import {
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Globe,
  Undo2,
  Redo2,
  CheckCircle,
  Layout,
  Database,
  Wand2,
  Search,
  BarChart2,
  Trophy,
  ArrowLeft,
  Eye,
  ChevronDown,
  Palette,
  LogOut,
  Image as ImageIcon,
  Crown,
  ExternalLink,
  Send,
  Check,
  XCircle,
  AlertCircle,
  PenTool,
} from 'lucide-react';

import { Breakpoint } from '@t-business/shared-types';
import { TemplateModal } from './TemplateModal';
import { AiGenerateModal } from './AiGenerateModal';
import { AiSeoModal } from './AiSeoModal';
import { AnalyticsModal } from './AnalyticsModal';
import { AbTestModal } from './AbTestModal';
import { MediaLibraryModal } from './MediaLibraryModal';
import { LivePreviewModal } from './LivePreviewModal';
import { ThemeModal } from './ThemeModal';
import { PricingModal } from './PricingModal';
import { CustomDomainModal } from './CustomDomainModal';
import { AiCopywriteModal } from './properties';

interface TopbarProps {
  onBackToDashboard?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onBackToDashboard }) => {
  const {
    siteId,
    breakpoint,
    setBreakpoint,
    pageStatus,
    slug,
    domain,
    setDomain,
    undo,
    redo,
    historyIndex,
    history,
    activeView,
    setActiveView,
    publishCanvas,
    submitForReview,
    approveCurrentVersion,
    rejectCurrentVersion,
    loadInitialData,
    autosaveStatus,
  } = useCanvasStore();

  const { user, logout } = useAuthStore();

  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSeoModalOpen, setAiSeoModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [abTestModalOpen, setAbTestModalOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [livePreviewModalOpen, setLivePreviewModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [customDomainModalOpen, setCustomDomainModalOpen] = useState(false);
  const [copywriteModalOpen, setCopywriteModalOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePublish = async () => {
    setPublishing(true);
    setActionError(null);
    try {
      const url = await publishCanvas();
      setPublishedUrl(url);
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 10000);
    } catch (err: any) {
      console.error('Publish error:', err);
      setActionError(err.message || 'Xuất bản thất bại. Vui lòng kiểm tra lại kết nối backend.');
      setPublishedSuccess(false);
    } finally {
      setPublishing(false);
    }
  };

  const handleSubmitReview = async () => {
    setActionLoading('submit');
    setActionError(null);
    try {
      await submitForReview();
    } catch (err: any) {
      setActionError(err.message || 'Không thể gửi duyệt bản vẽ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async () => {
    setActionLoading('approve');
    setActionError(null);
    try {
      await approveCurrentVersion();
    } catch (err: any) {
      setActionError(err.message || 'Không thể phê duyệt bản vẽ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    setActionError(null);
    try {
      await rejectCurrentVersion();
    } catch (err: any) {
      setActionError(err.message || 'Không thể yêu cầu sửa đổi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        zIndex: 1000,
        gap: '10px',
        position: 'relative',
      }}
    >
      {/* ─── LEFT: Site Info, View Switcher & Undo/Redo ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexShrink: 1 }}>
        {onBackToDashboard && (
          <button
            id="back-to-dashboard"
            onClick={onBackToDashboard}
            title="Quay lại Dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 8px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: '7px',
              color: 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={12} /> Sites
          </button>
        )}

        {/* Site & Page Pill — Bấm để cấu hình tên miền riêng */}
        <div
          onClick={() => setCustomDomainModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: 'var(--color-bg)',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '190px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          title={`Bấm để quản lý & cấp tên miền riêng (${domain})`}
        >
          <span style={{ fontSize: '13px' }}>🌐</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{domain}</span>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>/{slug}</span>
        </div>

        {/* View Switcher Capsule */}
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'var(--color-bg)',
            padding: '2px',
            borderRadius: '7px',
            border: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveView('canvas')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '11px',
              fontWeight: activeView === 'canvas' ? 600 : 400,
              color: activeView === 'canvas' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: activeView === 'canvas' ? 'var(--color-surface)' : 'transparent',
              border: 'none',
              borderRadius: '5px',
              boxShadow: activeView === 'canvas' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
            title="Giao diện thiết kế trực quan kéo thả"
          >
            <Layout size={12} /> Thiết Kế
          </button>
          <button
            onClick={() => setActiveView('cms')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '11px',
              fontWeight: activeView === 'cms' ? 600 : 400,
              color: activeView === 'cms' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              backgroundColor: activeView === 'cms' ? 'var(--color-surface)' : 'transparent',
              border: 'none',
              borderRadius: '5px',
              boxShadow: activeView === 'cms' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
            }}
            title="Quản trị nội dung & bảng dữ liệu động"
          >
            <Database size={12} /> Dữ Liệu
          </button>
        </div>

        {/* Undo / Redo */}
        {activeView === 'canvas' && (
          <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
            <button
              className="btn"
              style={{ padding: '5px 7px' }}
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Hoàn tác (Undo - Ctrl+Z)"
            >
              <Undo2 size={13} />
            </button>
            <button
              className="btn"
              style={{ padding: '5px 7px' }}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Làm lại (Redo - Ctrl+Y)"
            >
              <Redo2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ─── CENTER: Device Breakpoint Switcher ─── */}
      {activeView === 'canvas' ? (
        <div
          style={{
            display: 'flex',
            gap: '2px',
            background: 'var(--color-bg)',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          {(['desktop', 'tablet', 'mobile'] as Breakpoint[]).map((bp) => {
            const isActive = breakpoint === bp;
            return (
              <button
                key={bp}
                onClick={() => setBreakpoint(bp)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: isActive ? 'var(--color-surface)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
                title={`Kích thước ${bp}`}
              >
                {bp === 'desktop' && <Monitor size={13} />}
                {bp === 'tablet' && <Tablet size={13} />}
                {bp === 'mobile' && <Smartphone size={13} />}
                <span>{bp}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '12px', color: '#6B6A63', fontWeight: 500 }}>
          Quản Trị Dữ Liệu CMS
        </div>
      )}

      {/* ─── RIGHT: Tools, Media, Preview, Publish & User ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {activeView === 'canvas' && (
          <>
            {/* Direct Tool 1: Media Library */}
            <button
              onClick={() => setMediaModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-accent)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Mở thư viện ảnh/video"
            >
              <ImageIcon size={13} /> Thư Viện
            </button>

            {/* Direct Tool 2: Live Preview */}
            <button
              onClick={() => setLivePreviewModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid #BAE6FD',
                background: '#F0F9FF',
                color: '#0284C7',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Xem trước SSR thực tế trên các khung thiết bị"
            >
              <Eye size={13} /> Xem Live
            </button>

            {/* Dropdown: AI & Specialized Tools */}
            <div ref={dropdownRef} style={{ position: 'relative', zIndex: 1010 }}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 9px',
                  borderRadius: '6px',
                  border: '1px solid #E9D5FF',
                  background: toolsDropdownOpen ? '#F3E8FF' : '#FAF5FF',
                  color: '#7E22CE',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Các công cụ AI, SEO, A/B Testing & Đo lường"
              >
                <Sparkles size={13} /> Tiện Ích & AI <ChevronDown size={11} />
              </button>

              {toolsDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid var(--color-border)',
                    padding: '6px',
                    zIndex: 1020,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <button
                    onClick={() => { setAiModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Wand2 size={14} color="#6B4EFF" />
                    <div>
                      <div style={{ fontWeight: 600 }}>AI Tạo Trang Web</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Gemini Flash tạo website tự động</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setCopywriteModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PenTool size={14} color="#7E22CE" />
                    <div>
                      <div style={{ fontWeight: 600 }}>AI Copywriter (Viết Bài)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Sáng tạo tiêu đề, slogan, nội dung chuẩn ngành</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setCustomDomainModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Globe size={14} color="#2563EB" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Cấp Tên Miền (Custom Domain)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Gán domain riêng & xác minh DNS</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setThemeModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Palette size={14} color="#D97706" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Theme & Bảng Màu Toàn Site</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Màu sắc, font chữ & bo góc</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setPricingModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Crown size={14} color="#F59E0B" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#D97706' }}>👑 Gói Dịch Vụ SaaS</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Bảng giá & Nâng cấp Pro/Enterprise</div>
                    </div>
                  </button>


                  <button
                    onClick={() => { setTemplateModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Sparkles size={14} color="#6B4EFF" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Mẫu Giao Diện Sẵn</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Template mẫu cho các ngành nghề</div>
                    </div>
                  </button>


                  <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                  <button
                    onClick={() => { setAiSeoModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Search size={14} color="#15803D" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Gợi Ý SEO (Meta & Title)</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>AI phân tích & tối ưu SEO</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setAbTestModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Trophy size={14} color="#B45309" />
                    <div>
                      <div style={{ fontWeight: 600 }}>A/B Testing</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Phân luồng & đo chuyển đổi</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setAnalyticsModalOpen(true); setToolsDropdownOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'none',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <BarChart2 size={14} color="#1D4ED8" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Đo Lường & Analytics</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>GA4, Facebook Pixel</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Autosave Indicator & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {autosaveStatus === 'saving' && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              ⏳ Đang lưu...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span style={{ fontSize: '11px', color: '#166534', fontWeight: 500 }} title="Bản nháp đã được lưu tự động lên máy chủ">
              ✓ Đã lưu nháp
            </span>
          )}
          {autosaveStatus === 'error' && (
            <span style={{ fontSize: '11px', color: '#B3261E', fontWeight: 500 }} title="Không thể tự động lưu nháp vào cơ sở dữ liệu">
              ⚠ Lỗi lưu
            </span>
          )}

          <span
            className={`badge ${publishedSuccess ? 'published' : pageStatus}`}
            style={{ fontSize: '10px', padding: '3px 7px', textTransform: 'uppercase' }}
          >
            {publishedSuccess ? 'PUBLISHED' : pageStatus === 'in_review' ? 'IN REVIEW' : pageStatus}
          </span>
        </div>

        {/* Primary Action Buttons based on Role & Status */}
        {activeView === 'canvas' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Phê duyệt & Yêu cầu sửa (khi đang IN_REVIEW cho Owner/Admin) */}
            {pageStatus === 'in_review' && (
              <>
                {(user?.role === 'owner' || user?.role === 'platform_admin' || !user?.role) && (
                  <>
                    <button
                      className="btn"
                      onClick={handleApprove}
                      disabled={!!actionLoading}
                      style={{ fontSize: '11px', padding: '5px 10px', color: '#166534', borderColor: '#86EFAC', fontWeight: 600 }}
                      title="Chủ site phê duyệt bản vẽ thiết kế"
                    >
                      <Check size={12} /> {actionLoading === 'approve' ? 'Đang duyệt...' : 'Duyệt bản vẽ'}
                    </button>
                    <button
                      className="btn"
                      onClick={handleReject}
                      disabled={!!actionLoading}
                      style={{ fontSize: '11px', padding: '5px 8px', color: '#B3261E' }}
                      title="Yêu cầu designer sửa lại thiết kế"
                    >
                      <XCircle size={12} /> {actionLoading === 'reject' ? 'Đang gửi...' : 'Sửa lại'}
                    </button>
                  </>
                )}
              </>
            )}

            {/* Nút Gửi duyệt cho Designer khi đang ở Draft */}
            {user?.role === 'designer' && pageStatus === 'draft' && (
              <button
                className="btn"
                onClick={handleSubmitReview}
                disabled={!!actionLoading}
                style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--color-ai)', borderColor: '#DDD6FE', fontWeight: 600 }}
                title="Gửi bản vẽ cho chủ website phê duyệt"
              >
                <Send size={12} /> {actionLoading === 'submit' ? 'Đang gửi...' : 'Gửi duyệt'}
              </button>
            )}

            {/* Nút Xem Trang Live khi trang đã xuất bản */}
            {(pageStatus === 'published' || publishedSuccess) && (
              <a
                href={publishedUrl || `http://localhost:3000/?site=${domain}${slug === 'home' ? '' : '/' + slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  borderColor: '#86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#166534',
                  fontWeight: 600,
                }}
                title="Mở website đã xuất bản trực tiếp trên Renderer"
              >
                <ExternalLink size={12} /> Xem Trang Live
              </a>
            )}

            {/* Nút Xuất bản / Cập nhật Live (1-Click cho Owner/Admin hoặc khi đã Approved) */}
            <button
              className="btn primary"
              onClick={handlePublish}
              disabled={publishing || !!actionLoading}
              style={{
                opacity: publishing ? 0.7 : 1,
                fontSize: '11px',
                padding: '6px 12px',
                flexShrink: 0,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title={pageStatus === 'published' ? 'Cập nhật thay đổi lên website live' : 'Xuất bản website lên hệ thống'}
            >
              {publishing ? (
                'Đang xuất bản...'
              ) : publishedSuccess ? (
                <>
                  <CheckCircle size={13} /> Đã xuất bản
                </>
              ) : (
                <>
                  <Globe size={13} /> {pageStatus === 'published' ? 'Cập nhật Live' : 'Xuất bản'}
                </>
              )}
            </button>
          </div>
        )}

        {/* User Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderLeft: '1px solid var(--color-border)',
            paddingLeft: '8px',
            marginLeft: '2px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#6B4EFF',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
            }}
            title={user?.name || 'User'}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            id="topbar-logout"
            onClick={handleLogout}
            title="Đăng xuất"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#B3261E')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <TemplateModal isOpen={templateModalOpen} onClose={() => setTemplateModalOpen(false)} />
      <AiGenerateModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <AiSeoModal isOpen={aiSeoModalOpen} onClose={() => setAiSeoModalOpen(false)} />
      <AnalyticsModal isOpen={analyticsModalOpen} onClose={() => setAnalyticsModalOpen(false)} />
      <AbTestModal isOpen={abTestModalOpen} onClose={() => setAbTestModalOpen(false)} />

      {mediaModalOpen && (
        <MediaLibraryModal
          siteId={siteId}
          onSelect={(_url) => setMediaModalOpen(false)}
          onClose={() => setMediaModalOpen(false)}
        />
      )}

      <LivePreviewModal
        isOpen={livePreviewModalOpen}
        onClose={() => setLivePreviewModalOpen(false)}
        domain={domain}
        slug={slug}
      />

      <ThemeModal
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />

      <CustomDomainModal
        isOpen={customDomainModalOpen}
        onClose={() => setCustomDomainModalOpen(false)}
        siteId={siteId}
        onSiteUpdated={(updated) => {
          if (updated.custom_domain) {
            setDomain(updated.custom_domain);
          }
        }}
      />

      <AiCopywriteModal
        isOpen={copywriteModalOpen}
        onClose={() => setCopywriteModalOpen(false)}
        fieldType="about_story"
        title="✍️ Trợ Lý Sáng Tạo Nội Dung AI (Copywriter)"
        onApply={(text) => {
          navigator.clipboard.writeText(text);
          alert('Đã sao chép nội dung vào bộ nhớ tạm: "' + text + '"');
        }}
      />

      {/* Action Error Notification Toast */}
      {actionError && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--topbar-height) + 10px)',
            right: '16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            color: '#991B1B',
            padding: '10px 14px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            fontSize: '12px',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '380px',
          }}
        >
          <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 700, padding: '2px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Publish Success Toast with Direct Live Website Link */}
      {publishedSuccess && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--topbar-height) + 10px)',
            right: '16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #34D399',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            fontSize: '12px',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>🎉 Website đã xuất bản thành công!</div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>Dữ liệu đã đồng bộ sang Next.js Renderer & kích hoạt On-demand ISR.</div>
          </div>
          <a
            href={publishedUrl || `http://localhost:3000/?site=${domain}${slug === 'home' ? '' : '/' + slug}`}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#059669',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
            }}
          >
            Xem Website Live <ExternalLink size={12} />
          </a>
          <button
            onClick={() => setPublishedSuccess(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontWeight: 700, padding: '2px' }}
          >
            ✕
          </button>
        </div>
      )}
    </header>
  );
};
