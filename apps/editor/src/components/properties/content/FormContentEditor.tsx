import React from 'react';
import { FormBlockProps } from '@t-business/shared-types';

interface Props {
  blockId: string;
  props: FormBlockProps;
  onUpdateProps: (updates: Partial<FormBlockProps>) => void;
}

export const FormContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  return (
    <>
      <div>
        <label className="form-label">Nhãn nút gửi (Submit Label)</label>
        <input
          type="text"
          className="form-control"
          value={props.submit_label || ''}
          onChange={(e) => onUpdateProps({ submit_label: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Thông báo thành công</label>
        <input
          type="text"
          className="form-control"
          value={props.success_message || ''}
          placeholder="Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm."
          onChange={(e) => onUpdateProps({ success_message: e.target.value })}
        />
      </div>
    </>
  );
};
