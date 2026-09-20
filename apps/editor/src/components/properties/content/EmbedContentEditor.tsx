import React from 'react';
import { EmbedBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: EmbedBlockProps;
  onUpdateProps: (updates: Partial<EmbedBlockProps>) => void;
}

export const EmbedContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  return (
    <>
      <div>
        <label className="form-label">Nguồn nhúng (Provider)</label>
        <select
          className="form-control"
          value={props.provider || 'youtube'}
          onChange={(e) => onUpdateProps({ provider: e.target.value as any })}
        >
          <option value="youtube">YouTube Video</option>
          <option value="google_maps">Bản đồ Google Maps</option>
          <option value="facebook_video">Facebook Video</option>
        </select>
      </div>
      <div>
        <label className="form-label">
          {props.provider === 'google_maps' ? 'Địa chỉ tìm kiếm Maps' : 'YouTube Video ID'}
        </label>
        <input
          type="text"
          className="form-control"
          value={props.embed_id || ''}
          placeholder={
            props.provider === 'google_maps'
              ? 'VD: 57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội'
              : 'VD: dQw4w9WgXcQ'
          }
          onChange={(e) => onUpdateProps({ embed_id: e.target.value })}
        />
      </div>
    </>
  );
};
