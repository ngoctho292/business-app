import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { X, Trophy, Play, Pause } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AbTestModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { blocks, setBlocks, slug } = useCanvasStore();

  const [enabled, setEnabled] = useState(true);
  const [splitRatio, setSplitRatio] = useState(50);
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const activePageId = slug || 'home';

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:4000/v1/ab-test/status/${activePageId}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setEnabled(data.enabled);
        if (data.variants?.A?.trafficWeight) {
          setSplitRatio(data.variants.A.trafficWeight);
        }
      }
    } catch (err) {
      console.error('Error fetching A/B test stats:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, activePageId]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/v1/ab-test/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: activePageId,
          enabled: !enabled,
          splitRatio,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setStats(updated);
        setEnabled(updated.enabled);
      }
    } catch (err) {
      console.error('Error toggling A/B test:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateTraffic = async (variant: 'A' | 'B', isConversion: boolean) => {
    try {
      await fetch('http://localhost:4000/v1/ab-test/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: 'home',
          variant,
          eventType: isConversion ? 'conversion' : 'impression',
        }),
      });
      await fetchStats();
    } catch (err) {
      console.error('Error simulating event:', err);
    }
  };

  const handleSwitchEditingVariant = (variant: 'A' | 'B') => {
    setActiveVariant(variant);
    if (variant === 'B') {
      // Tinh chỉnh biến thể B với nút CTA màu cam rực rỡ và tiêu đề thu hút
      const updated = blocks.map((b) => {
        if (b.type === 'button') {
          return {
            ...b,
            props: {
              ...(b.props as any),
              label: '🔥 ĐẶT BÀN NHẬN NGAY VOUCHER 20%',
              style: 'primary',
            },
          };
        }
        if (b.type === 'heading' && (b.props as any).level === 'h1') {
          return {
            ...b,
            props: {
              ...(b.props as any),
              text: 'Trải Nghiệm Ẩm Thực Đỉnh Cao — Đặt Chỗ Nhận Ngay Ưu Đãi 20%',
            },
          };
        }
        return b;
      });
      setBlocks(updated);
    } else {
      // Bản A chuẩn
      fetchStats();
    }
  };

  const vA = stats?.variants?.A || { impressions: 480, conversions: 36, conversionRate: 7.5 };
  const vB = stats?.variants?.B || { impressions: 512, conversions: 82, conversionRate: 16.02 };
  const winner = stats?.winningVariantId;

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
          maxWidth: '820px',
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
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#D97706',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
              }}
            >
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#78350F' }}>
                  Thử Nghiệm A/B Testing & Tối Ưu Chuyển Đổi
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: enabled ? '#16A34A' : '#9CA3AF',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {enabled ? 'ĐANG CHẠY' : 'TẠM DỪNG'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#92400E', margin: '2px 0 0 0' }}>
                Phân luồng 50/50 khách truy cập giữa Bản Gốc (A) và Biến Thể (B) để đo lường tỷ lệ chốt đơn (CVR).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#92400E',
              padding: '6px',
              borderRadius: '8px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Winner Banner */}
          {winner && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={24} style={{ color: '#059669' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#065F46' }}>
                    🏆 Phiên Bản B Đang Chiến Thắng! (Tỷ lệ CVR cao hơn gấp 2.1 lần)
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>
                    Biến thể B với nút CTA nổi bật giúp tăng thêm +46 đơn đặt bàn so với bản gốc.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  handleSwitchEditingVariant('B');
                  onClose();
                }}
                className="btn btn-primary"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#059669',
                  borderColor: '#047857',
                  padding: '6px 14px',
                }}
              >
                Áp Dụng Bản B Làm Mặc Định
              </button>
            </div>
          )}

          {/* Comparison Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Variant A Card */}
            <div
              style={{
                border: activeVariant === 'A' ? '2px solid #2563EB' : '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '18px',
                backgroundColor: activeVariant === 'A' ? '#F8FAFC' : '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Phiên Bản A (Gốc)</span>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Tiêu đề & CTA tiêu chuẩn</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: '6px' }}>
                  {splitRatio}% Traffic
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', backgroundColor: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Lượt xem</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{vA.impressions}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#F1F5F9', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Chuyển đổi (Đặt bàn)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{vA.conversions}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px', textAlign: 'center', padding: '8px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#92400E' }}>Tỷ lệ chuyển đổi (CVR)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309' }}>{vA.conversionRate}%</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleSwitchEditingVariant('A')}
                  className="btn"
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: activeVariant === 'A' ? '#2563EB' : '#FFFFFF',
                    color: activeVariant === 'A' ? '#FFFFFF' : '#1E293B',
                  }}
                >
                  {activeVariant === 'A' ? '✓ Đang xem Bản A' : 'Chỉnh sửa Bản A'}
                </button>
                <button
                  onClick={() => handleSimulateTraffic('A', true)}
                  className="btn"
                  style={{ fontSize: '11px', padding: '6px 8px' }}
                  title="Giả lập thêm 1 chuyển đổi đặt bàn"
                >
                  +1 Đơn
                </button>
              </div>
            </div>

            {/* Variant B Card */}
            <div
              style={{
                border: activeVariant === 'B' ? '2px solid #8B5CF6' : '1px solid #DDD6FE',
                borderRadius: '12px',
                padding: '18px',
                backgroundColor: activeVariant === 'B' ? '#FAF5FF' : '#FFFFFF',
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.1)',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#5B21B6' }}>Phiên Bản B (Biến Thể)</span>
                  <span style={{ fontSize: '11px', color: '#7C3AED', display: 'block' }}>CTA Nổi Bật + Voucher 20%</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, backgroundColor: '#EDE9FE', color: '#6D28D9', padding: '2px 8px', borderRadius: '6px' }}>
                  {100 - splitRatio}% Traffic
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div style={{ padding: '10px', backgroundColor: '#F5F3FF', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6D28D9' }}>Lượt xem</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4C1D95' }}>{vB.impressions}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#F5F3FF', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6D28D9' }}>Chuyển đổi (Đặt bàn)</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#4C1D95' }}>{vB.conversions}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px', textAlign: 'center', padding: '8px', backgroundColor: '#DCFCE7', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#166534' }}>Tỷ lệ chuyển đổi (CVR)</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D' }}>{vB.conversionRate}% 🚀</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleSwitchEditingVariant('B')}
                  className="btn"
                  style={{
                    flex: 1,
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: activeVariant === 'B' ? '#7C3AED' : '#FFFFFF',
                    color: activeVariant === 'B' ? '#FFFFFF' : '#5B21B6',
                    borderColor: '#DDD6FE',
                  }}
                >
                  {activeVariant === 'B' ? '✓ Đang xem Bản B' : 'Chỉnh sửa Bản B'}
                </button>
                <button
                  onClick={() => handleSimulateTraffic('B', true)}
                  className="btn"
                  style={{ fontSize: '11px', padding: '6px 8px', color: '#7C3AED', borderColor: '#DDD6FE' }}
                  title="Giả lập thêm 1 chuyển đổi đặt bàn"
                >
                  +1 Đơn
                </button>
              </div>
            </div>
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
          <button
            onClick={handleToggle}
            disabled={loading}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: enabled ? '#DC2626' : '#16A34A',
              borderColor: enabled ? '#FCA5A5' : '#BBF7D0',
            }}
          >
            {enabled ? <Pause size={15} /> : <Play size={15} />}
            <span>{enabled ? 'Tạm Dừng Thử Nghiệm' : 'Tiếp Tục Thử Nghiệm'}</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#D97706',
              borderColor: '#B45309',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
