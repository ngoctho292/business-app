import React, { useState, useEffect, useCallback } from 'react';
import { SiteDTO } from '@t-business/shared-types';
import { apiClient } from '../services/apiClient';
import {
  Globe,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';


interface CustomDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  onSiteUpdated?: (updatedSite: SiteDTO) => void;
}

export const CustomDomainModal: React.FC<CustomDomainModalProps> = ({
  isOpen,
  onClose,
  siteId,
  onSiteUpdated,
}) => {
  const [site, setSite] = useState<SiteDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [domainInput, setDomainInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchSiteInfo = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const data = await apiClient.get<SiteDTO>(`/sites/${siteId}`);
      setSite(data);
      if (data.custom_domain) {
        setDomainInput(data.custom_domain);
      }
    } catch (err) {
      console.error('Lỗi tải thông tin site:', err);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (isOpen) {
      fetchSiteInfo();
      setStatusMessage(null);
    }
  }, [isOpen, fetchSiteInfo]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    setSaving(true);
    setStatusMessage(null);
    try {
      const updated = await apiClient.post<SiteDTO>(`/sites/${siteId}/custom-domain`, {
        custom_domain: domainInput.trim().toLowerCase(),
      });
      setSite(updated);
      onSiteUpdated?.(updated);
      setStatusMessage({
        type: 'info',
        text: 'Đã lưu tên miền. Vui lòng cấu hình các bản ghi DNS bên dưới rồi bấm Xác minh.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Không thể lưu tên miền. Vui lòng kiểm tra lại định dạng.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDns = async (force = false) => {
    setVerifying(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.post<{ verified: boolean; message: string; site: SiteDTO }>(
        `/sites/${siteId}/custom-domain/verify`,
        { force }
      );
      setSite(res.site);
      onSiteUpdated?.(res.site);

      if (res.verified) {
        setStatusMessage({
          type: 'success',
          text: res.message,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi khi kiểm tra bản ghi DNS',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!window.confirm('Bạn có chắc muốn gỡ bỏ tên miền riêng khỏi website này?')) return;

    setSaving(true);
    try {
      const updated = await apiClient.delete<SiteDTO>(`/sites/${siteId}/custom-domain`);
      setSite(updated);
      setDomainInput('');
      onSiteUpdated?.(updated);
      setStatusMessage({
        type: 'info',
        text: 'Đã gỡ bỏ tên miền riêng thành công.',
      });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gỡ tên miền');
    } finally {
      setSaving(false);
    }
  };

  const hasCustomDomain = !!site?.custom_domain;
  const isVerified = site?.domain_verified;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '720px',
          maxWidth: '100%',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                🌐 Cài Đặt Tên Miền Riêng (Custom Domain)
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Kết nối tên miền thương hiệu của bạn (vd: congtyabc.vn) vào website
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
              Đang tải thông tin tên miền...
            </div>
          ) : (
            <>
              {/* Domain Input Form */}
              <form onSubmit={handleSaveDomain} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Tên miền tùy chỉnh của bạn:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Globe
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                    />
                    <input
                      type="text"
                      placeholder="vd: nhahangabc.vn hoặc order.nhahangabc.com"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value.toLowerCase().trim())}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving || !domainInput.trim() || domainInput === site?.custom_domain}
                    className="btn btn-primary"
                    style={{ padding: '9px 18px', fontSize: '13px' }}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu Tên Miền'}
                  </button>
                </div>
              </form>

              {/* Status Banner */}
              {hasCustomDomain && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${isVerified ? '#A7F3D0' : '#FDE68A'}`,
                    backgroundColor: isVerified ? '#ECFDF5' : '#FFFBEB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isVerified ? (
                      <CheckCircle2 size={18} color="#059669" />
                    ) : (
                      <Clock size={18} color="#D97706" />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: isVerified ? '#065F46' : '#92400E' }}>
                        {isVerified ? 'Tên miền đã được xác thực thành công' : 'Đang chờ cấu hình bản ghi DNS'}
                      </div>
                      <div style={{ fontSize: '12px', color: isVerified ? '#047857' : '#B45309' }}>
                        {isVerified
                          ? `Website đang hoạt động tại http://${site?.custom_domain}`
                          : 'Vui lòng thêm các bản ghi DNS bên dưới tại nhà cung cấp tên miền của bạn.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleVerifyDns(false)}
                      disabled={verifying}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#FFFFFF',
                        borderColor: isVerified ? '#10B981' : '#D97706',
                        color: isVerified ? '#059669' : '#D97706',
                      }}
                    >
                      <RefreshCw size={12} style={{ animation: verifying ? 'spin 1s linear infinite' : 'none' }} />
                      Kiểm tra DNS
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveDomain}
                      className="btn"
                      style={{ padding: '6px 10px', fontSize: '12px', color: '#DC2626' }}
                      title="Gỡ tên miền"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Status Message Alert */}
              {statusMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    backgroundColor:
                      statusMessage.type === 'success'
                        ? '#ECFDF5'
                        : statusMessage.type === 'error'
                        ? '#FEF2F2'
                        : '#EFF6FF',
                    color:
                      statusMessage.type === 'success'
                        ? '#065F46'
                        : statusMessage.type === 'error'
                        ? '#991B1B'
                        : '#1E40AF',
                    border: `1px solid ${
                      statusMessage.type === 'success'
                        ? '#A7F3D0'
                        : statusMessage.type === 'error'
                        ? '#FECACA'
                        : '#BFDBFE'
                    }`,
                  }}
                >
                  {statusMessage.text}
                </div>
              )}

              {/* DNS Records Guide */}
              {hasCustomDomain && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} color="#10B981" /> Hướng dẫn cấu hình DNS tại nhà cung cấp tên miền:
                  </div>

                  <div style={{ border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                          <th style={{ padding: '8px 12px', width: '80px' }}>Loại (Type)</th>
                          <th style={{ padding: '8px 12px', width: '160px' }}>Tên (Host / Name)</th>
                          <th style={{ padding: '8px 12px' }}>Giá trị đích (Value / Target)</th>
                          <th style={{ padding: '8px 12px', width: '60px', textAlign: 'center' }}>Copy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Record 1: CNAME / A */}
                        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#4F46E5' }}>CNAME</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>@ (hoặc {site?.custom_domain})</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#111827' }}>
                            domains.tbusiness.vn
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleCopy('domains.tbusiness.vn', 'cname')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                            >
                              {copiedKey === 'cname' ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            </button>
                          </td>
                        </tr>

                        {/* Record 2: TXT Challenge */}
                        <tr>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#059669' }}>TXT</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>_tbusiness-challenge</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#111827' }}>
                            {site?.verification_token || 'tb-verify-xxx'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleCopy(site?.verification_token || '', 'txt')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
                            >
                              {copiedKey === 'txt' ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.4 }}>
                    💡 <b>Lưu ý</b>: Sau khi cập nhật tại trang quản lý tên miền (như Matbao, PA Vietnam, Cloudflare), có thể mất từ <b>2 đến 15 phút</b> để hệ thống DNS toàn cầu cập nhật.
                  </div>

                  {/* Dev / Quick Test Action */}
                  <div style={{ padding: '10px 12px', backgroundColor: '#F3F4F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#4B5563' }}>
                      🧪 <b>Môi trường Thử nghiệm</b>: Bấm nút bên để kích hoạt xác thực ngay mà không cần chờ DNS Internet
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVerifyDns(true)}
                      disabled={verifying}
                      className="btn"
                      style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none' }}
                    >
                      Kích hoạt nhanh (Demo)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
          }}
        >
          {isVerified && site?.custom_domain ? (
            <a
              href={`http://${site.custom_domain}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '12px',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Truy cập website: http://{site.custom_domain} <ExternalLink size={12} />
            </a>
          ) : (
            <div />
          )}

          <button
            type="button"
            className="btn"
            style={{ fontSize: '13px' }}
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
