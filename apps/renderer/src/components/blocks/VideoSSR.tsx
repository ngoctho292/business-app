import React from 'react';
import { VideoBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const VideoSSR: React.FC<{ id: string; props: VideoBlockProps }> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  return (
    <div className={`tb-video-wrapper ${scopedClass}`}>
      <div className="tb-video-container">
        <video
          src={props.src}
          poster={props.poster}
          controls={props.controls !== false}
          autoPlay={props.autoplay}
          loop={props.loop}
          preload="metadata"
        />
      </div>
    </div>
  );
};
