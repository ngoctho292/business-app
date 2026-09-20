import React, { useState, useEffect } from 'react';
import { ContentTypeDTO, ContentItemDTO, ContentItemStatus } from '@t-business/shared-types';
import { cmsService } from '../../services/cmsService';
import { DynamicItemModal } from './DynamicItemModal';

interface Props {
  contentTypes: ContentTypeDTO[];
}

export const ContentItemList: React.FC<Props> = ({ contentTypes }) => {
  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    contentTypes.length > 0 ? contentTypes[0].id : ''
  );
  const [statusFilter, setStatusFilter] = useState<ContentItemStatus | 'all'>('all');
  const [items, setItems] = useState<ContentItemDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItemDTO | null>(null);

  const selectedType = contentTypes.find((ct) => ct.id === selectedTypeId) || contentTypes[0];

  useEffect(() => {
    if (contentTypes.length > 0 && !selectedTypeId) {
      setSelectedTypeId(contentTypes[0].id);
    }
  }, [contentTypes]);

  useEffect(() => {
    if (selectedTypeId) {
      loadItems();
    }
  }, [selectedTypeId, statusFilter]);

  const loadItems = async () => {
    if (!selectedTypeId) return;
    setLoading(true);
    try {
      const res = await cmsService.getContentItems(
        undefined,
        selectedTypeId,
        statusFilter === 'all' ? undefined : statusFilter
      );
      setItems(res.data || []);
    } catch (e) {
      console.error('Lỗi khi tải items:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: ContentItemDTO) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaveItem = async (fields: Record<string, unknown>, status: 'draft' | 'published') => {
    if (!selectedTypeId) return;
    if (editingItem) {
      await cmsService.updateContentItem(undefined, selectedTypeId, editingItem.id, fields, status);
    } else {
      await cmsService.createContentItem(undefined, selectedTypeId, fields, status);
    }
    await loadItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;
    try {
      await cmsService.deleteContentItem(undefined, selectedTypeId, itemId);
      await loadItems();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa');
    }
  };

  const fields = selectedType?.field_schema || [];

  if (contentTypes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E4E2DC' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>Chưa có Loại dữ liệu nào</h3>
        <p style={{ color: '#6B6A63', fontSize: '14px', maxWidth: '400px', margin: '0 auto 16px' }}>
          Vui lòng chuyển sang tab <strong>"Cấu Trúc Dữ Liệu"</strong> để tạo loại dữ liệu (Thực đơn, Tin tức, Sản phẩm...) trước khi nhập liệu.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Bộ lọc */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F1E1B' }}>Loại nội dung:</label>
          <select
            value={selectedTypeId}
            onChange={(e) => setSelectedTypeId(e.target.value)}
            style={selectStyle}
          >
            {contentTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={selectStyle}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>

        <button onClick={handleOpenCreate} style={btnPrimaryStyle}>
          + Thêm Bản Ghi Mới
        </button>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E4E2DC', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9F8F6', borderBottom: '1px solid #E4E2DC' }}>
                <th style={thStyle}>Trạng thái</th>
                {fields.slice(0, 4).map((f) => (
                  <th key={f.key} style={thStyle}>
                    {f.label}
                  </th>
                ))}
                <th style={thStyle}>Ngày tạo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={fields.length + 3} style={{ padding: '32px', textAlign: 'center', color: '#6B6A63' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 3} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                    <div style={{ fontWeight: 600, color: '#1F1E1B', marginBottom: '4px' }}>Chưa có bản ghi nào</div>
                    <div style={{ color: '#6B6A63', fontSize: '13px' }}>Bấm nút "+ Thêm Bản Ghi Mới" ở trên để nhập dữ liệu đầu tiên.</div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F0EFEA' }}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '999px',
                          backgroundColor: item.status === 'published' ? '#DCFCE7' : '#FEF3C7',
                          color: item.status === 'published' ? '#166534' : '#92400E',
                        }}
                      >
                        {item.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    {fields.slice(0, 4).map((f) => {
                      const val = (item.fields as Record<string, any>)?.[f.key];
                      return (
                        <td key={f.key} style={tdStyle}>
                          {f.type === 'image' && val ? (
                            <img src={val} alt="thumb" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : f.type === 'boolean' ? (
                            val ? '✅ Có' : '❌ Không'
                          ) : f.type === 'number' && val !== undefined ? (
                            <strong>{Number(val).toLocaleString('vi-VN')}</strong>
                          ) : (
                            String(val ?? '—').slice(0, 60)
                          )}
                        </td>
                      );
                    })}
                    <td style={{ ...tdStyle, color: '#6B6A63', fontSize: '13px' }}>
                      {new Date(item.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(item)} style={btnTableEdit}>
                        ✏️ Sửa
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} style={btnTableDelete}>
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nhập liệu */}
      {modalOpen && selectedType && (
        <DynamicItemModal
          contentType={selectedType}
          initialItem={editingItem}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #E4E2DC',
  backgroundColor: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
};

const btnPrimaryStyle: React.CSSProperties = {
  padding: '9px 18px',
  borderRadius: '6px',
  border: 'none',
  backgroundColor: '#2F6F4F',
  color: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
};

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#6B6A63',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: '#1F1E1B',
  verticalAlign: 'middle',
};

const btnTableEdit: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: '4px',
  border: '1px solid #E4E2DC',
  backgroundColor: '#FFFFFF',
  cursor: 'pointer',
  fontSize: '12px',
  marginRight: '6px',
};

const btnTableDelete: React.CSSProperties = {
  padding: '5px 10px',
  borderRadius: '4px',
  border: '1px solid #FCA5A5',
  backgroundColor: '#FFF5F5',
  color: '#B91C1C',
  cursor: 'pointer',
  fontSize: '12px',
};
