import React from 'react';
import { ContainerBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: ContainerBlockProps;
  children?: React.ReactNode;
}

export const ContainerBlock: React.FC<Props> = ({ id, props, children }) => {
  const scopedClass = getBlockScopedClass(id);
  const Tag = (props.tag || 'div') as keyof JSX.IntrinsicElements;

  return (
    <Tag
      className={`tb-container ${scopedClass}`}
      style={{
        height: '100%',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Tag>
  );
};
