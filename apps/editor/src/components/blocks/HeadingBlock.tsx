import React from 'react';
import { HeadingBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: HeadingBlockProps;
}

export const HeadingBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const text = props.text || 'Tiêu đề';
  const level = props.level || 'h2';

  const Tag = level as keyof JSX.IntrinsicElements;
  return <Tag className={`tb-heading ${level} ${scopedClass}`}>{text}</Tag>;
};
