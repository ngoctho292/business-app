import React from 'react';
import { CollectionListBlockProps, ContentTypeDTO } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: CollectionListBlockProps;
  contentTypes: ContentTypeDTO[];
  onUpdateProps: (updates: Partial<CollectionListBlockProps>) => void;
}

export const CollectionListContentEditor: React.FC<Props> = ({
  props,
  contentTypes,
  onUpdateProps,
}) => {
  return (
    <>
      <div>
        <label className="form-label">Nguồn dữ liệu CMS (Content Type)</label>
        <select
          className="form-control"
          value={props.content_type_id || ''}
          onChange={(e) => onUpdateProps({ content_type_id: e.target.value })}
        >
          <option value="">-- Chọn Content Type --</option>
          {contentTypes.map((ct) => (
            <option key={ct.id} value={ct.id}>
              {ct.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label">Bố cục hiển thị (Layout)</label>
        <select
          className="form-control"
          value={props.layout || 'grid'}
          onChange={(e) => onUpdateProps({ layout: e.target.value as any })}
        >
          <option value="grid">Dạng lưới (Grid)</option>
          <option value="list">Dạng danh sách (List)</option>
          <option value="carousel">Thanh cuộn ngang (Carousel)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        <div>
          <label className="form-label">Số lượng hiển thị</label>
          <input
            type="number"
            min={1}
            max={50}
            className="form-control"
            value={props.limit || 6}
            onChange={(e) => onUpdateProps({ limit: parseInt(e.target.value, 10) || 6 })}
          />
        </div>
        <div>
          <label className="form-label">Sắp xếp theo</label>
          <select
            className="form-control"
            value={props.sort_by || 'created_at'}
            onChange={(e) => onUpdateProps({ sort_by: e.target.value as any })}
          >
            <option value="created_at">Mới nhất</option>
            <option value="updated_at">Cập nhật gần nhất</option>
            <option value="title">Tên A-Z</option>
          </select>
        </div>
      </div>
    </>
  );
};
