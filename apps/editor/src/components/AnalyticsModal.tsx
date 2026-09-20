import React, { useState, useEffect } from 'react';
import { X, Check, BarChart2, ShieldCheck, Activity, Code } from 'lucide-react';
import { useCanvasStore } from '../store/canvasStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { siteId, domain } = useCanvasStore();
  const [ga4Id, setGa4Id] = useState('G-XXXXXXXXXX');
  const [fbPixelId, setFbPixelId] = useState('987654321012345');
  const [gtmId, setGtmId] = useState('GTM-TBN999');
  const [customHeaderScript, setCustomHeaderScript] = useState('');
  const [enableEcommerce, setEnableEcommerce] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const effectiveSiteId = siteId || 'site-1';

  useEffect(() => {
    if (isOpen) {
      fetch(`http://localhost:4000/v1/ab-test/analytics/${effectiveSiteId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setGa4Id(data.ga4Id || '');
            setFbPixelId(data.fbPixelId || '');
            setGtmId(data.gtmId || '');
            setCustomHeaderScript(data.customHeaderScript || '');
            if (data.enableEcommerceTracking !== undefined) {
              setEnableEcommerce(data.enableEcommerceTracking);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, effectiveSiteId]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`http://localhost:4000/v1/ab-test/analytics/${effectiveSiteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ga4Id,
          fbPixelId,
          gtmId,
          customHeaderScript,
          enableEcommerceTracking: enableEcommerce,
        }),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving analytics:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
              }}
            >
              <BarChart2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1E3A8A' }}>
                Đo Lường & Theo Dõi Chuyển Đổi ({domain})
              </h2>
              <p style={{ fontSize: '12px', color: '#1D4ED8', margin: '2px 0 0 0' }}>
                Tự động gắn mã Google Analytics 4, Facebook Pixel & Google Tag Manager cho website {domain}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1D4ED8',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* GA4 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
              <Activity size={15} style={{ color: '#F59E0B' }} /> Google Analytics 4 (Measurement ID)
            </label>
            <input
              type="text"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              style={inputStyle}
            />
            <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', display: 'block' }}>
              Theo dõi lượt truy cập, nguồn traffic và sự kiện tương tác của người dùng.
            </span>
          </div>

          {/* Facebook Pixel */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
              <ShieldCheck size={15} style={{ color: '#2563EB' }} /> Facebook Pixel ID (Meta Ads)
            </label>
            <input
              type="text"
              value={fbPixelId}
              onChange={(e) => setFbPixelId(e.target.value)}
              placeholder="123456789012345"
              style={inputStyle}
            />
            <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px', display: 'block' }}>
              Tối ưu hóa chiến dịch quảng cáo Facebook Ads, đo lường tỷ lệ chốt đơn và chuyển đổi.
            </span>
          </div>

          {/* GTM */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
              <Code size={15} style={{ color: '#059669' }} /> Google Tag Manager (GTM Container ID)
            </label>
            <input
              type="text"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              style={inputStyle}
            />
          </div>

          {/* E-commerce Auto Tracking Toggle */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
                Tự động bắt sự kiện chuyển đổi (Enhanced Conversion Tracking)
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                Tự động bắn sự kiện <code>Purchase</code> khi thanh toán MoMo thành công và <code>Lead</code> khi gửi form đặt bàn.
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
              <input
                type="checkbox"
                checked={enableEcommerce}
                onChange={(e) => setEnableEcommerce(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: enableEcommerce ? '#2563EB' : '#CBD5E1',
                  borderRadius: '24px',
                  transition: '0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: enableEcommerce ? '23px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: '0.2s',
                  }}
                />
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFAF8',
          }}
        >
          <button onClick={onClose} className="btn" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Đóng
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#2563EB',
              borderColor: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {saved ? <Check size={16} /> : <Check size={16} />}
            <span>{saved ? 'Đã lưu cấu hình!' : 'Lưu Cài Đặt Tracking'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
};
