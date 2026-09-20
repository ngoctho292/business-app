import React, { useState, useEffect, useCallback } from 'react';
import { SiteUserDTO, SiteRole } from '@t-business/shared-types';
import { apiClient } from '../services/apiClient';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Mail,
  Crown,
  Edit3,
  Eye,
  Sparkles,
} from 'lucide-react';


interface SiteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
}

const ROLE_DESCRIPTIONS: Record<SiteRole, { label: string; desc: string; color: string; icon: any }> = {
  owner: {
    label: 'Chủ sở hữu (Owner)',
    desc: 'Toàn quyền quản trị website, quản lý thành viên & xóa site',
    color: '#6366F1',
    icon: Crown,
  },
  designer: {
    label: 'Nhà thiết kế (Designer)',
    desc: 'Chỉnh sửa layout giao diện, thêm block, áp dụng theme',
    color: '#EC4899',
    icon: Sparkles,
  },
  editor: {
    label: 'Biên tập viên (Editor)',
    desc: 'Chỉnh sửa nội dung văn bản, bài viết CMS, xem đơn form',
    color: '#10B981',
    icon: Edit3,
  },
  viewer: {
    label: 'Người xem (Viewer)',
    desc: 'Chỉ có quyền xem trước trang nháp và phân tích',
    color: '#6B7280',
    icon: Eye,
  },
};

export const SiteMembersModal: React.FC<SiteMembersModalProps> = ({
  isOpen,
  onClose,
  siteId,
  siteName,
}) => {
  const [members, setMembers] = useState<SiteUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SiteRole>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!siteId) return;
    setLoading(true);
    try {
      const data = await apiClient.get<SiteUserDTO[]>(`/sites/${siteId}/members`);
      setMembers(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setInviteError(null);
      setInviteSuccess(null);
    }
  }, [isOpen, fetchMembers]);

  if (!isOpen) return null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await apiClient.post(`/sites/${siteId}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteSuccess(`Đã thêm thành viên ${inviteEmail} thành công!`);
      setInviteEmail('');
      await fetchMembers();
    } catch (err: any) {
      setInviteError(err.message || 'Không thể thêm thành viên. Vui lòng kiểm tra lại email.');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: SiteRole) => {
    try {
      await apiClient.patch(`/sites/${siteId}/members/${userId}`, {
        role: newRole,
      });
      setMembers((prev) =>
        prev.map((m) => (m.user_id === userId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật quyền hạn');
    }
  };

  const handleRemoveMember = async (userId: string, memberEmail?: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa thành viên ${memberEmail || ''} khỏi website này?`)) {
      return;
    }

    try {
      await apiClient.delete(`/sites/${siteId}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa thành viên');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
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
          width: '680px',
          maxWidth: '100%',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface, #FFFFFF)',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-border, #E5E7EB)',
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
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                👥 Quản Lý Thành Viên — {siteName}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Phân quyền cộng tác và quản trị website cùng đội ngũ
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Invite Form */}
          <form
            onSubmit={handleInvite}
            style={{
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={15} color="#6366F1" /> Mời thành viên mới vào website
            </div>

            {inviteError && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px' }}>
                ⚠️ {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#ECFDF5', color: '#065F46', fontSize: '12px' }}>
                ✔ {inviteSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Mail
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
                />
                <input
                  type="email"
                  placeholder="Nhập email đồng nghiệp (vd: user@example.com)..."
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as SiteRole)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontWeight: 500,
                }}
              >
                <option value="designer">🎨 Nhà thiết kế (Designer)</option>
                <option value="editor">📝 Biên tập viên (Editor)</option>
                <option value="viewer">👁️ Người xem (Viewer)</option>
              </select>

              <button
                type="submit"
                disabled={inviting}
                className="btn btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#4F46E5',
                  borderColor: '#4F46E5',
                }}
              >
                {inviting ? 'Đang gửi...' : 'Mời vào Site'}
              </button>
            </div>
          </form>

          {/* Members List */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginBottom: '10px' }}>
              Danh sách thành viên hiện tại ({members.length})
            </div>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                Đang tải danh sách thành viên...
              </div>
            ) : members.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#6B7280' }}>
                Chưa có thành viên nào khác.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((member) => {
                  const roleConfig = ROLE_DESCRIPTIONS[member.role] || ROLE_DESCRIPTIONS.viewer;
                  const isOwner = member.role === 'owner';
                  const userName = member.user?.name || 'Thành viên';
                  const userEmail = member.user?.email || member.user_id;

                  return (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: roleConfig.color + '15',
                            color: roleConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                          }}
                        >
                          {userName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {userName}
                            {isOwner && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  backgroundColor: '#EEF2FF',
                                  color: '#4F46E5',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 700,
                                }}
                              >
                                OWNER
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {userEmail}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isOwner ? (
                          <span style={{ fontSize: '12px', color: '#6366F1', fontWeight: 600, padding: '4px 10px' }}>
                            Chủ sở hữu
                          </span>
                        ) : (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleUpdateRole(member.user_id, e.target.value as SiteRole)
                              }
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid #D1D5DB',
                                fontSize: '12px',
                                backgroundColor: '#F9FAFB',
                                color: '#374151',
                              }}
                            >
                              <option value="designer">🎨 Designer</option>
                              <option value="editor">📝 Editor</option>
                              <option value="viewer">👁️ Viewer</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(member.user_id, member.user?.email)}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #FEE2E2',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              title="Xóa khỏi site"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: '#F9FAFB',
          }}
        >
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
