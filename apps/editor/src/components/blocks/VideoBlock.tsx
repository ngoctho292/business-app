import React from 'react';
import { VideoBlockProps, getBlockScopedClass } from '@t-business/shared-types';
import { Play } from 'lucide-react';

interface Props {
  id: string;
  props: VideoBlockProps;
}

export const VideoBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const poster =
    props.poster ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

  return (
    <div className={`tb-video-wrapper ${scopedClass}`}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 'inherit',
          overflow: 'hidden',
          backgroundColor: '#1F1E1B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={poster}
          alt="Video Poster"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
        />
        <div
          style={{
            position: 'absolute',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Play size={24} style={{ color: 'var(--color-primary)', marginLeft: '3px' }} />
        </div>
      </div>
    </div>
  );
};
