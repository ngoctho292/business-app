import React from 'react';
import { DividerBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: DividerBlockProps;
}

export const DividerBlock: React.FC<Props> = ({ id }) => {
  const scopedClass = getBlockScopedClass(id);
  return <hr className={`tb-divider ${scopedClass}`} />;
};
