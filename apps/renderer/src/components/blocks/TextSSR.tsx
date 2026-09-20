import React from 'react';
import { TextBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

export const TextSSR: React.FC<{ id: string; props: TextBlockProps }> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const content = props.richtext || '';
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtml) {
    return (
      <div
        className={`tb-text ${scopedClass}`}
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={`tb-text ${scopedClass}`} style={{ whiteSpace: 'pre-wrap' }}>
      {content}
    </div>
  );
};
