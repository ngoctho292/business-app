import React from 'react';
import { EmbedBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: EmbedBlockProps;
}

export const EmbedBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const provider = props.provider || 'youtube';
  const embedId = props.embed_id || 'dQw4w9WgXcQ';

  return (
    <div className={`tb-embed-wrapper ${scopedClass}`}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          borderRadius: 'inherit',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        {provider === 'youtube' && (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${embedId}?enablejsapi=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 0 }}
          />
        )}
        {provider === 'google_maps' && (
          <iframe
            width="100%"
            height="100%"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(embedId)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            title="Google Maps"
            frameBorder="0"
            style={{ border: 0 }}
          />
        )}
      </div>
      {props.caption && <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>{props.caption}</p>}
    </div>
  );
};
