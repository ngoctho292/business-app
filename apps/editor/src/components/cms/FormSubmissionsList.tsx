import React, { useState, useEffect, useCallback } from 'react';
import { FormSubmissionDTO, PagedResponse } from '@t-business/shared-types';
import { apiClient } from '../../services/apiClient';
import { useCanvasStore } from '../../store/canvasStore';
import {
  Trash2,
  Mail,
  Phone,
  User,
  Search,
  RefreshCw,
  Eye,
  X,
  FileSpreadsheet,
} from 'lucide-react';


export const FormSubmissionsList: React.FC = () => {
  const { siteId, domain } = useCanvasStore();
  const [submissions, setSubmissions] = useState<FormSubmissionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<FormSubmissionDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const res = await apiClient.get<PagedResponse<FormSubmissionDTO>>(
        `/sites/${siteId}/forms/submissions?limit=100`
      );
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Lỗi khi tải form submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/sites/${siteId}/forms/submissions/${id}/read`, {});
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_read: true } : s))
      );
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, is_read: true });
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi gửi form này?')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/sites/${siteId}/forms/submissions/${id}`);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err) {
      alert('Không thể xóa bản ghi');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = () => {
    if (submissions.length === 0) {
      alert('Không có dữ liệu gửi form nào để xuất file');
      return;
    }

    // Collect all dynamic field keys across all submissions
    const allKeysSet = new Set<string>();
    submissions.forEach((s) => {
      if (s.payload && typeof s.payload === 'object') {
        Object.keys(s.payload).forEach((k) => allKeysSet.add(k));
      }
    });
    const customKeys = Array.from(allKeysSet);

    // Build CSV Headers
    const headers = ['Mã Đơn', 'Thời Gian Gửi', 'Tiêu Đề Form', 'Trang Gửi', ...customKeys];

    // Build CSV Rows
    const rows = submissions.map((s) => {
      const formattedDate = new Date(s.created_at).toLocaleString('vi-VN');
      const customValues = customKeys.map((k) => {
        const val = s.payload?.[k];
        if (val === undefined || val === null) return '';
        // Escape quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      return [
        `"${s.id}"`,
        `"${formattedDate}"`,
        `"${s.form_title || 'Form'}"`,
        `"${s.page_slug || 'home'}"`,
        ...customValues,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `form-submissions_${domain || 'site'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = submissions.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (s.form_title?.toLowerCase().includes(q)) return true;
    if (s.page_slug?.toLowerCase().includes(q)) return true;
    if (s.payload) {
      const payloadStr = JSON.stringify(s.payload).toLowerCase();
      if (payloadStr.includes(q)) return true;
    }
    return false;
  });

  const unreadCount = submissions.filter((s) => !s.is_read).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Controls Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #E4E2DC',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
                backgroundColor: '#F9FAFB',
              }}
            />
          </div>

          <button
            onClick={fetchSubmissions}
            className="btn"
            style={{ padding: '8px 12px', fontSize: '13px' }}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Làm mới
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            Tổng số: <b>{submissions.length}</b> đơn
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: '8px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '11px',
                }}
              >
                {unreadCount} đơn mới
              </span>
            )}
          </div>

          <button
            onClick={handleExportCsv}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#166534',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              padding: '8px 14px',
              borderRadius: '8px',
            }}
          >
            <FileSpreadsheet size={15} /> Xuất file CSV / Excel
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {loading && submissions.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          Đang tải danh sách khách hàng gửi thông tin...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          {search ? '🔍 Không tìm thấy đơn gửi nào phù hợp.' : '📭 Chưa có khách hàng nào gửi form trên website này.'}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563', fontWeight: 600 }}>
                <th style={{ padding: '12px 16px', width: '90px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', width: '150px' }}>Thời gian gửi</th>
                <th style={{ padding: '12px 16px', width: '160px' }}>Loại Form & Trang</th>
                <th style={{ padding: '12px 16px' }}>Nội dung khách gửi (Họ tên, Email, SĐT, Tin nhắn)</th>
                <th style={{ padding: '12px 16px', width: '110px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const isUnread = !sub.is_read;
                const p = sub.payload || {};
                const name = p.name || p.fullname || p.hoten || '—';
                const email = p.email || '—';
                const phone = p.phone || p.sdt || p.dienthoai || '';
                const message = p.message || p.noidung || p.note || p.ghichu || '';

                return (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: isUnread ? '#FFFBEB' : '#FFFFFF',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isUnread ? '#FEF3C7' : '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isUnread ? '#FFFBEB' : '#FFFFFF')}
                  >
                    {/* Status */}
                    <td style={{ padding: '12px 16px' }}>
                      {isUnread ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', backgroundColor: '#FDE68A', padding: '3px 8px', borderRadius: '6px' }}>
                          MỚI
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Đã xem</span>
                      )}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '12px' }}>
                      {new Date(sub.created_at).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Form & Page */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1F2937' }}>{sub.form_title || 'Form'}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Trang: /{sub.page_slug || 'home'}</div>
                    </td>

                    {/* Payload Summary */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                        {name !== '—' && (
                          <span style={{ fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} color="#6B7280" /> {name}
                          </span>
                        )}
                        {email !== '—' && (
                          <span style={{ color: '#0284C7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <Mail size={12} /> {email}
                          </span>
                        )}
                        {phone && (
                          <span style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <Phone size={12} /> {phone}
                          </span>
                        )}
                      </div>
                      {message && (
                        <div style={{ fontSize: '12px', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                          "{message}"
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => {
                            setSelectedItem(sub);
                            if (!sub.is_read) handleMarkAsRead(sub.id);
                          }}
                          className="btn"
                          style={{ padding: '5px 8px', fontSize: '11px' }}
                          title="Xem chi tiết"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          disabled={deletingId === sub.id}
                          className="btn"
                          style={{ padding: '5px 8px', fontSize: '11px', color: '#EF4444' }}
                          title="Xóa đơn này"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              width: '560px',
              maxWidth: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Chi tiết đơn gửi: {selectedItem.form_title}
                </h3>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  Trang: /{selectedItem.page_slug} • Gửi lúc:{' '}
                  {new Date(selectedItem.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }}>
              {selectedItem.payload &&
                Object.entries(selectedItem.payload).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #F3F4F6',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '14px', color: '#1F2937', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                      {String(val || '—')}
                    </div>
                  </div>
                ))}
            </div>

            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#F9FAFB',
                gap: '8px',
              }}
            >
              <button
                onClick={() => handleDelete(selectedItem.id)}
                className="btn"
                style={{ color: '#EF4444', fontSize: '13px' }}
              >
                <Trash2 size={14} /> Xóa đơn
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="btn btn-primary"
                style={{ fontSize: '13px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
