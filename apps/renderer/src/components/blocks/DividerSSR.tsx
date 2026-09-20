import React from 'react';
import { DividerBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const DividerSSR: React.FC<{ id: string; props: DividerBlockProps }> = ({ id }) => {
  const scopedClass = getBlockScopedClass(id);
  return <hr className={`tb-divider ${scopedClass}`} />;
};
