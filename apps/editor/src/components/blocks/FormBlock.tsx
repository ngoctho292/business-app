import React from 'react';
import { FormBlockProps, getBlockScopedClass } from '@t-business/shared-types';

interface Props {
  id: string;
  props: FormBlockProps;
}

export const FormBlock: React.FC<Props> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const fields = props.fields || [
    { key: 'name', label: 'Họ và tên', input_type: 'text', required: true },
    { key: 'email', label: 'Email', input_type: 'email', required: true },
    { key: 'phone', label: 'Số điện thoại', input_type: 'text', required: false },
    { key: 'message', label: 'Nội dung yêu cầu', input_type: 'textarea', required: false },
  ];
  const submitLabel = props.submit_label || 'Gửi Thông Tin';

  return (
    <div className={`tb-form-container ${scopedClass}`}>
      <form onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
          <div key={field.key} className="tb-form-group">
            <label className="tb-label">
              {field.label}{' '}
              {field.required && (
                <span style={{ color: 'var(--color-danger, #EF4444)' }}>*</span>
              )}
            </label>
            {field.input_type === 'textarea' ? (
              <textarea
                name={field.key}
                rows={4}
                disabled
                className="tb-textarea"
                placeholder={`Nhập ${field.label.toLowerCase()}...`}
                style={{ cursor: 'default' }}
              />
            ) : (
              <input
                type={field.input_type}
                name={field.key}
                disabled
                className="tb-input"
                placeholder={`Nhập ${field.label.toLowerCase()}...`}
                style={{ cursor: 'default' }}
              />
            )}
          </div>
        ))}

        <button
          type="button"
          className="tb-btn tb-btn-primary"
          style={{ width: '100%', marginTop: '8px', cursor: 'default', textDecoration: 'none' }}
          onClick={(e) => e.preventDefault()}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
};
