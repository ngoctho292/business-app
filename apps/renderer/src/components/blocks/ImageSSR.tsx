import React from 'react';
import { ImageBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const ImageSSR: React.FC<{
  id: string;
  props: ImageBlockProps;
  isHero?: boolean;
}> = ({ id, props, isHero = false }) => {
  const scopedClass = getBlockScopedClass(id);
  const src =
    props.src ||
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80';

  return (
    <figure className={`tb-image-wrapper ${scopedClass}`}>
      <img
        src={src}
        alt={props.alt || 'Website image'}
        loading={isHero ? 'eager' : 'lazy'}
        fetchPriority={isHero ? 'high' : 'auto'}
        decoding="async"
        className="tb-image"
      />
      {props.caption && <figcaption className="tb-image-caption">{props.caption}</figcaption>}
    </figure>
  );
};
