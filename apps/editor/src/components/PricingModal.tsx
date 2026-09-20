import React, { useState, useEffect } from 'react';
import { PlanDTO, SubscriptionDTO, OrderDTO } from '@t-business/shared-types';
import { apiClient } from '../services/apiClient';
import {
  Crown,
  Check,
  X,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';


interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [currentSub, setCurrentSub] = useState<SubscriptionDTO | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);

  // Payment order state
  const [selectedPlan, setSelectedPlan] = useState<PlanDTO | null>(null);
  const [activeOrder, setActiveOrder] = useState<{ order: OrderDTO; qr_url: string; bank_info: any } | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlansAndSub();
      setActiveOrder(null);
      setActivatedSuccess(false);
    }
  }, [isOpen]);

  const loadPlansAndSub = async () => {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        apiClient.get<PlanDTO[]>('/payments/plans'),
        apiClient.get<SubscriptionDTO>('/payments/my-subscription').catch(() => null),
      ]);
      setPlans(plansData || []);
      setCurrentSub(subData || null);
    } catch (err) {
      console.error('Lỗi khi tải bảng giá:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSelectPlanToUpgrade = async (plan: PlanDTO) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setCreatingOrder(true);
    try {
      const data = await apiClient.post<{ order: OrderDTO; qr_url: string; bank_info: any }>(
        '/payments/create-order',
        {
          planId: plan.id,
          billingCycle,
          paymentMethod: 'vietqr',
        }
      );
      setActiveOrder(data);
    } catch (err: any) {
      alert(err.message || 'Không thể tạo đơn hàng thanh toán');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!activeOrder) return;
    setActivating(true);
    try {
      const res = await apiClient.post<{ success: boolean; message: string; subscription: SubscriptionDTO }>(
        `/payments/simulate-success/${activeOrder.order.order_code}`,
        {}
      );
      if (res.success) {
        setCurrentSub(res.subscription);
        setActivatedSuccess(true);
        setTimeout(() => {
          setActivatedSuccess(false);
          setActiveOrder(null);
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi kích hoạt đơn hàng');
    } finally {
      setActivating(false);
    }
  };

  const currentPlanId = currentSub?.plan || 'free';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: activeOrder ? '520px' : '960px',
          maxWidth: '100%',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          transition: 'all 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FCD34D',
              }}
            >
              <Crown size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>
                {activeOrder ? 'Thanh Toán Nâng Cấp Gói Cước' : 'Bảng Giá & Gói Dịch Vụ SaaS'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)' }}>
                {activeOrder
                  ? `Mã đơn: ${activeOrder.order.order_code} • Kích hoạt tài khoản tức thì`
                  : 'Mở khóa không giới hạn tên miền riêng, AI thông minh và tính năng doanh nghiệp'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#FFFFFF',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280' }}>
              Đang tải danh mục gói cước...
            </div>
          ) : activeOrder ? (
            /* PAYMENT QR VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              {activatedSuccess ? (
                <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                    Nâng Cấp Thành Công!
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4B5563', maxWidth: '360px' }}>
                    Tài khoản của bạn đã được nâng cấp lên gói <b>{selectedPlan?.name}</b>. Chúc bạn xây dựng website thành công!
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '13px', color: '#4B5563' }}>
                    Quét mã QR dưới đây bằng ứng dụng <b>Ngân Hàng (App Mobile Banking)</b> hoặc <b>MoMo</b> để thanh toán:
                  </div>

                  {/* QR Image Box */}
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '2px dashed #6366F1',
                      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.15)',
                    }}
                  >
                    <img
                      src={activeOrder.qr_url}
                      alt="VietQR Payment"
                      style={{ width: '240px', height: '240px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                  </div>

                  {/* Transfer Details Card */}
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '14px 18px',
                      textAlign: 'left',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Ngân hàng:</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeOrder.bank_info.bank_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Số tài khoản:</span>
                      <span style={{ fontWeight: 700, color: '#4F46E5', fontFamily: 'monospace', fontSize: '13px' }}>
                        {activeOrder.bank_info.account_number}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Chủ tài khoản:</span>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{activeOrder.bank_info.account_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Số tiền:</span>
                      <span style={{ fontWeight: 800, color: '#DC2626', fontSize: '14px' }}>
                        {activeOrder.bank_info.amount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Nội dung chuyển khoản:</span>
                      <span style={{ fontWeight: 700, color: '#059669', fontFamily: 'monospace', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                        {activeOrder.bank_info.transfer_content}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ width: '100%', display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveOrder(null)}
                      className="btn"
                      style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                    >
                      ← Đổi gói khác
                    </button>
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={activating}
                      className="btn btn-primary"
                      style={{
                        flex: 2,
                        padding: '10px',
                        fontSize: '13px',
                        backgroundColor: '#16A34A',
                        borderColor: '#16A34A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      {activating ? (
                        'Đang kích hoạt...'
                      ) : (
                        <>
                          <Check size={16} /> Tôi Đã Chuyển Khoản (Kích Hoạt Ngay)
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* PRICING PLANS VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Billing Cycle Switcher */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: billingCycle === 'monthly' ? 700 : 500, color: billingCycle === 'monthly' ? '#1E1B4B' : '#64748B' }}>
                  Thanh toán Hàng Tháng
                </span>
                <button
                  type="button"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  style={{
                    width: '48px',
                    height: '26px',
                    borderRadius: '13px',
                    backgroundColor: billingCycle === 'yearly' ? '#4F46E5' : '#CBD5E1',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '2px',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      transform: billingCycle === 'yearly' ? 'translateX(22px)' : 'translateX(0)',
                      transition: 'transform 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: billingCycle === 'yearly' ? 700 : 500, color: billingCycle === 'yearly' ? '#1E1B4B' : '#64748B' }}>
                    Thanh toán Hàng Năm
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    Tiết kiệm 20%
                  </span>
                </div>
              </div>

              {/* 3-Column Plans Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {plans.map((p) => {
                  const isCurrent = currentPlanId === p.id;
                  const isPro = p.id === 'pro';
                  const price = billingCycle === 'yearly' ? p.priceYearly : p.priceMonthly;

                  return (
                    <div
                      key={p.id}
                      style={{
                        borderRadius: '16px',
                        border: isPro ? '2px solid #6366F1' : '1px solid #E2E8F0',
                        backgroundColor: isPro ? '#FAF5FF' : '#FFFFFF',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        boxShadow: isPro ? '0 10px 30px -5px rgba(99, 102, 241, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      {/* Badge */}
                      {p.badge && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            backgroundColor: isPro ? '#6366F1' : '#0F172A',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {p.badge}
                        </div>
                      )}

                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', minHeight: '36px', lineHeight: 1.4 }}>
                          {p.description}
                        </div>

                        {/* Price */}
                        <div style={{ margin: '16px 0', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>
                            {price === 0 ? '0 đ' : `${price.toLocaleString('vi-VN')} đ`}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            /{billingCycle === 'yearly' ? 'năm' : 'tháng'}
                          </span>
                        </div>

                        {/* Features List */}
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {p.features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#334155' }}>
                              <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: isPro ? '#EEF2FF' : '#F1F5F9', color: isPro ? '#4F46E5' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                                <Check size={11} strokeWidth={3} />
                              </div>
                              <span style={{ lineHeight: 1.3 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upgrade / Current Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectPlanToUpgrade(p)}
                        disabled={isCurrent || p.id === 'free' || creatingOrder}
                        style={{
                          marginTop: '20px',
                          width: '100%',
                          padding: '10px',
                          borderRadius: '10px',
                          border: isCurrent ? '1px solid #CBD5E1' : 'none',
                          backgroundColor: isCurrent ? '#F8FAFC' : isPro ? '#4F46E5' : '#0F172A',
                          color: isCurrent ? '#94A3B8' : '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: isCurrent || p.id === 'free' ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isCurrent ? (
                          'Gói hiện tại của bạn'
                        ) : p.id === 'free' ? (
                          'Gói miễn phí'
                        ) : creatingOrder && selectedPlan?.id === p.id ? (
                          'Đang khởi tạo...'
                        ) : (
                          <>
                            Nâng cấp ngay <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
