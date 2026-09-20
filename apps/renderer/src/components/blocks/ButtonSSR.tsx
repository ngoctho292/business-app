import React from 'react';
import { ButtonBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const ButtonSSR: React.FC<{ id: string; props: ButtonBlockProps }> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);

  return (
    <div className="tb-button-wrapper">
      <a
        href={props.href || '#'}
        target={props.target || '_self'}
        className={`tb-btn tb-button ${scopedClass}`}
        style={{ textDecoration: 'none' }}
      >
        {props.label || 'Khám Phá Thêm'}
      </a>
    </div>
  );
};
