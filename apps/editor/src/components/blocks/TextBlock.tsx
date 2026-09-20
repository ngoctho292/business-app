import React from 'react';
import { TextBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: TextBlockProps;
}

export const TextBlock: React.FC<Props> = ({ id, props }) => {
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
