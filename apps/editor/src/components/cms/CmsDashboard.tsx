import React, { useState, useEffect } from 'react';
import { ContentTypeDTO } from '@t-business/shared-types';
import { cmsService } from '../../services/cmsService';
import { ContentTypeBuilder } from './ContentTypeBuilder';
import { ContentItemList } from './ContentItemList';
import { FormSubmissionsList } from './FormSubmissionsList';
import { useCanvasStore } from '../../store/canvasStore';

export const CmsDashboard: React.FC = () => {
  const { siteId, domain } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<'items' | 'types' | 'forms'>('items');
  const [contentTypes, setContentTypes] = useState<ContentTypeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContentTypes = async () => {
    try {
      setLoading(true);
      const data = await cmsService.getContentTypes(siteId);
      setContentTypes(data || []);
    } catch (err) {
      console.error('Không thể tải Content Types:', err);
      setContentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContentTypes();
  }, [siteId]);

  return (
    <div style={{ flex: 1, backgroundColor: '#F9F8F6', overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Active Site Header Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E4E2DC',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🏢</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1F1E1B' }}>
                Quản trị nội dung CMS: <span style={{ color: '#2F6F4F' }}>{domain}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#6B6A63' }}>
                Dữ liệu và loại bài viết được lưu trữ và cô lập riêng cho website này.
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#EBF4F0',
              color: '#2F6F4F',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #C4DED4',
            }}
          >
            {contentTypes.length} Loại nội dung
          </span>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E4E2DC', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('items')}
            style={{
              ...tabBtnStyle,
              borderBottom: activeTab === 'items' ? '2px solid #2F6F4F' : '2px solid transparent',
              color: activeTab === 'items' ? '#2F6F4F' : '#6B6A63',
              fontWeight: activeTab === 'items' ? 700 : 500,
            }}
          >
            📦 Bản Ghi Dữ Liệu (Content Items)
          </button>
          <button
            onClick={() => setActiveTab('types')}
            style={{
              ...tabBtnStyle,
              borderBottom: activeTab === 'types' ? '2px solid #2F6F4F' : '2px solid transparent',
              color: activeTab === 'types' ? '#2F6F4F' : '#6B6A63',
              fontWeight: activeTab === 'types' ? 700 : 500,
            }}
          >
            🛠️ Cấu Trúc Dữ Liệu (Content Types) ({contentTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('forms')}
            style={{
              ...tabBtnStyle,
              borderBottom: activeTab === 'forms' ? '2px solid #2F6F4F' : '2px solid transparent',
              color: activeTab === 'forms' ? '#2F6F4F' : '#6B6A63',
              fontWeight: activeTab === 'forms' ? 700 : 500,
            }}
          >
            📋 Khách Hàng Gửi Form (Leads)
          </button>
        </div>

        {/* Tab Content */}
        {loading && activeTab !== 'forms' ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#6B6A63' }}>
            Đang tải dữ liệu CMS...
          </div>
        ) : activeTab === 'items' ? (
          <ContentItemList contentTypes={contentTypes} />
        ) : activeTab === 'types' ? (
          <ContentTypeBuilder
            contentTypes={contentTypes}
            onRefresh={loadContentTypes}
          />
        ) : (
          <FormSubmissionsList />
        )}
      </div>
    </div>
  );
};


const tabBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '12px 16px',
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: '-1px',
};
