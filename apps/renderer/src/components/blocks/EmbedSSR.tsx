import React from 'react';
import { EmbedBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const EmbedSSR: React.FC<{ id: string; props: EmbedBlockProps }> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const provider = props.provider || 'youtube';
  const embedId = props.embed_id || 'dQw4w9WgXcQ';

  return (
    <div className={`tb-embed-wrapper ${scopedClass}`}>
      <div className="tb-embed-container">
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
            loading="lazy"
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
            loading="lazy"
          />
        )}
      </div>
      {props.caption && <p className="tb-embed-caption">{props.caption}</p>}
    </div>
  );
};
