import React from 'react';
import { SectionBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: SectionBlockProps;
  children?: React.ReactNode;
}

export const SectionBlock: React.FC<Props> = ({ id, props, children }) => {
  const scopedClass = getBlockScopedClass(id);
  const layout = props.layout || 'stack';
  const Tag = (props.tag || 'section') as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`tb-section ${scopedClass}`}>
      <div className={`tb-section-container tb-section-${layout}`}>{children}</div>
    </Tag>
  );
};
