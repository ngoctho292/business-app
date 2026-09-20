import React from 'react';
import { HeadingBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const HeadingSSR: React.FC<{ id: string; props: HeadingBlockProps }> = ({ id, props }) => {
  const level = props.level || 'h2';
  const scopedClass = getBlockScopedClass(id);
  const text = props.text;
  const Tag = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2') as keyof JSX.IntrinsicElements;

  return <Tag className={`tb-heading ${level} ${scopedClass}`}>{text}</Tag>;
};
