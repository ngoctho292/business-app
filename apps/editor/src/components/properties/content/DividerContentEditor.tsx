import React from 'react';
import { DividerBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: DividerBlockProps;
  onUpdateProps: (updates: Partial<DividerBlockProps>) => void;
}

export const DividerContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  return (
    <div>
      <label className="form-label">Độ dày đường phân cách (Thickness)</label>
      <input
        type="text"
        className="form-control"
        placeholder="VD: 1px, 2px"
        value={props.thickness || '1px'}
        onChange={(e) => onUpdateProps({ thickness: e.target.value })}
      />
    </div>
  );
};
