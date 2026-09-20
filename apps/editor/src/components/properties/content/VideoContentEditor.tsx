import React from 'react';
import { VideoBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: VideoBlockProps;
  onUpdateProps: (updates: Partial<VideoBlockProps>) => void;
}

export const VideoContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  return (
    <>
      <div>
        <label className="form-label">Đường dẫn Video URL (MP4 / WebM)</label>
        <input
          type="text"
          className="form-control"
          value={props.src || ''}
          placeholder="https://.../video.mp4"
          onChange={(e) => onUpdateProps({ src: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Ảnh bìa Poster URL</label>
        <input
          type="text"
          className="form-control"
          value={props.poster || ''}
          placeholder="https://.../poster.jpg"
          onChange={(e) => onUpdateProps({ poster: e.target.value })}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.controls ?? true}
            onChange={(e) => onUpdateProps({ controls: e.target.checked })}
          />
          Hiển thị thanh điều khiển (Controls)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.autoplay || false}
            onChange={(e) => onUpdateProps({ autoplay: e.target.checked })}
          />
          Tự động phát (Autoplay muted)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={props.loop || false}
            onChange={(e) => onUpdateProps({ loop: e.target.checked })}
          />
          Lặp lại vô tận (Loop)
        </label>
      </div>
    </>
  );
};
