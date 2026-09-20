import React, { useState } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  slug: string;
}

type DeviceView = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceView, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  isOpen,
  onClose,
  domain,
  slug,
}) => {
  const [device, setDevice] = useState<DeviceView>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [loading, setLoading] = useState(true);

  if (!isOpen) return null;

  // URL target to Next.js renderer
  const cleanSlug = slug === 'home' ? '' : `/${slug}`;
  const previewUrl = `http://localhost:3000?site=${domain}${cleanSlug}`;

  const reloadIframe = () => {
    setLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : '20px',
        transition: 'all 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isFullscreen ? '100vw' : '95vw',
          maxWidth: isFullscreen ? '100vw' : '1400px',
          height: isFullscreen ? '100vh' : '92vh',
          backgroundColor: '#1E293B',
          borderRadius: isFullscreen ? '0' : '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: isFullscreen ? 'none' : '1px solid rgba(255,255,255,0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            height: '52px',
            backgroundColor: '#0F172A',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            color: '#F8FAFC',
            flexShrink: 0,
          }}
        >
          {/* Left: Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#38BDF8',
              }}
            >
              <span style={{ fontSize: '16px' }}>👁️</span> Xem Trước Thực Tế (SSR Live)
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#94A3B8',
                backgroundColor: 'rgba(255,255,255,0.06)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontFamily: 'monospace',
              }}
            >
              {domain}/{slug}
            </div>
          </div>

          {/* Center: Device Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '4px',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setDevice('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: device === 'desktop' ? '#0284C7' : 'transparent',
                color: device === 'desktop' ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Monitor size={13} /> Desktop (100%)
            </button>
            <button
              onClick={() => setDevice('tablet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: device === 'tablet' ? '#0284C7' : 'transparent',
                color: device === 'tablet' ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Tablet size={13} /> Tablet (768px)
            </button>
            <button
              onClick={() => setDevice('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: device === 'mobile' ? '#0284C7' : 'transparent',
                color: device === 'mobile' ? '#FFFFFF' : '#94A3B8',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Smartphone size={13} /> Mobile (390px)
            </button>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={reloadIframe}
              title="Tải lại iframe"
              style={{
                padding: '6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#E2E8F0',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>

            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Mở trong tab mới"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#E2E8F0',
                fontSize: '12px',
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={12} /> Mở tab mới
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              style={{
                padding: '6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: '#E2E8F0',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>

            <button
              onClick={onClose}
              title="Đóng preview"
              style={{
                padding: '6px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '6px',
                color: '#F87171',
                cursor: 'pointer',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Viewport Frame */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#090D16',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: device === 'desktop' ? '0' : '20px',
            overflow: 'auto',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: DEVICE_WIDTHS[device],
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: device === 'desktop' ? '0' : '12px',
              overflow: 'hidden',
              boxShadow: device === 'desktop' ? 'none' : '0 20px 50px rgba(0,0,0,0.6)',
              border: device === 'desktop' ? 'none' : '6px solid #334155',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
            }}
          >
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '10px',
                  zIndex: 10,
                }}
              >
                <RefreshCw size={24} color="#0284C7" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                  Đang tải SSR renderer từ {domain}...
                </span>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={previewUrl}
              title={`Live Preview ${domain}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#FFFFFF',
              }}
              onLoad={() => setLoading(false)}
            />
          </div>
        </div>

        {/* Footer info note */}
        <div
          style={{
            padding: '6px 16px',
            backgroundColor: '#0F172A',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>💡 Khung này tải trực tiếp từ Next.js SSR Renderer (`localhost:3000/?site={domain}`)</span>
          <span>Nhấn <b>Xuất bản</b> trên thanh công cụ để đồng bộ các thay đổi mới nhất</span>
        </div>
      </div>
    </div>
  );
};
