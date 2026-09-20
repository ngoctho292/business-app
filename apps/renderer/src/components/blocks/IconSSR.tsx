import React from 'react';
import { IconBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';
import { Icon } from '@iconify/react';

interface Props {
  id: string;
  props: IconBlockProps;
}

export const IconSSR: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const rawIcon = props.icon || 'solar:star-bold';
  const iconName = rawIcon.startsWith('solar:') ? rawIcon : `solar:${rawIcon}`;
  const size = props.size || 36;
  const color = props.color || 'var(--color-primary, #2F6F4F)';
  const align = props.align || 'center';
  const bgShape = props.bg_shape || 'none';
  const bgColor = props.bg_color || 'rgba(47, 111, 79, 0.1)';
  const padding = props.padding !== undefined ? props.padding : (bgShape !== 'none' ? 12 : 0);

  const getBorderRadius = () => {
    switch (bgShape) {
      case 'circle':
        return '50%';
      case 'rounded':
        return '12px';
      case 'square':
        return '4px';
      default:
        return '0';
    }
  };

  const alignJustify = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }[align];

  const iconElement = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgShape !== 'none' ? bgColor : 'transparent',
        borderRadius: getBorderRadius(),
        padding: `${padding}px`,
        color: color,
        transition: 'all 0.2s ease',
      }}
    >
      <Icon icon={iconName} width={size} height={size} style={{ display: 'block', color: 'inherit' }} />
    </div>
  );

  return (
    <div
      className={`tb-icon-wrapper ${scopedClass}`}
      style={{
        display: 'flex',
        justifyContent: alignJustify,
        alignItems: 'center',
        width: '100%',
      }}
    >
      {props.href ? (
        <a
          href={props.href}
          style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex' }}
        >
          {iconElement}
        </a>
      ) : (
        iconElement
      )}
    </div>
  );
};
