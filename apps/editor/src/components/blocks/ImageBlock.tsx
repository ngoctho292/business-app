import React from 'react';
import { ImageBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: ImageBlockProps;
}

export const ImageBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const src =
    props.src ||
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';

  return (
    <figure className={`tb-image-wrapper ${scopedClass}`}>
      <img
        src={src}
        alt={props.alt || 'Hình ảnh'}
        className="tb-image"
      />
      {props.caption && (
        <figcaption className="tb-image-caption">
          {props.caption}
        </figcaption>
      )}
    </figure>
  );
};
