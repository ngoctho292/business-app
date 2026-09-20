import React from 'react';
import { ButtonBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: ButtonBlockProps;
}

export const ButtonBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const label = props.label || 'Nút bấm CTA';

  return (
    <div className="tb-button-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
      <a
        href={props.href || '#'}
        className={`tb-btn tb-button ${scopedClass}`}
        style={{ textDecoration: 'none' }}
        onClick={(e) => e.preventDefault()}
      >
        {label}
      </a>
    </div>
  );
};
