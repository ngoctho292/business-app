import React from 'react';
import { SectionBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const SectionSSR: React.FC<{
  id: string;
  props: SectionBlockProps;
  children?: React.ReactNode;
}> = ({ id, props, children }) => {
  const scopedClass = getBlockScopedClass(id);
  const layout = props.layout || 'stack';

  return (
    <section className={`tb-section ${scopedClass}`}>
      <div className={`tb-section-container tb-section-${layout}`}>
        {children}
      </div>
    </section>
  );
};
