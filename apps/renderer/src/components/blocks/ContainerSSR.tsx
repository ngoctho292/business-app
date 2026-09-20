import React from 'react';
import { ContainerBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const ContainerSSR: React.FC<{
  id: string;
  props: ContainerBlockProps;
  children?: React.ReactNode;
}> = ({ id, props, children }) => {
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
