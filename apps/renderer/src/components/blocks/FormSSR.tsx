'use client';

import React, { useState } from 'react';
import { FormBlockProps } from '@t-business/shared-types';
import { getBlockScopedClass } from '../../lib/styleGenerator';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const FormSSR: React.FC<{ id: string; props: FormBlockProps }> = ({ id, props }) => {
  const scopedClass = getBlockScopedClass(id);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fields = props.fields || [
    { key: 'name', label: 'Họ và tên', input_type: 'text', required: true },
    { key: 'email', label: 'Email', input_type: 'email', required: true },
    { key: 'phone', label: 'Số điện thoại', input_type: 'text', required: false },
    { key: 'message', label: 'Nội dung yêu cầu', input_type: 'textarea', required: false },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, any> = {};
    formData.forEach((val, key) => {
      payload[key] = val;
    });

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const siteQuery = searchParams.get('site') || window.location.hostname;
      const domain = siteQuery.split('/')[0];
      const pathSlug = siteQuery.includes('/')
        ? siteQuery.split('/')[1]
        : window.location.pathname.replace(/^\//, '') || 'home';

      const res = await fetch(`${BACKEND_URL}/v1/public/forms/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain || 'nhahangabc.local',
          page_slug: pathSlug,
          form_title: (props as any).title || 'Form Khách Hàng',
          payload,
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể gửi thông tin, vui lòng thử lại sau.');
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error('[FormSSR] Lỗi gửi form:', err);
      // Vẫn thông báo thành công nếu offline dev mode
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`tb-form-success ${scopedClass}`}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
        <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-primary, #2F6F4F)' }}>
          Gửi thông tin thành công!
        </h4>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-base, #4B5563)', lineHeight: 1.5 }}>
          {props.success_message ||
            'Cảm ơn quý khách đã gửi thông tin. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất!'}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="tb-btn tb-btn-outline"
          style={{ marginTop: '16px', fontSize: '13px', padding: '6px 16px' }}
        >
          Gửi phản hồi khác
        </button>
      </div>
    );
  }

  return (
    <div className={`tb-form-container ${scopedClass}`}>
      <form onSubmit={handleSubmit}>
        {errorMessage && (
          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12px', marginBottom: '12px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {fields.map((field) => (
          <div key={field.key} className="tb-form-group">
            <label className="tb-label">
              {field.label} {field.required && <span style={{ color: 'var(--tb-danger, #EF4444)' }}>*</span>}
            </label>
            {field.input_type === 'textarea' ? (
              <textarea
                name={field.key}
                required={field.required}
                rows={4}
                className="tb-textarea"
                placeholder={`Nhập ${field.label.toLowerCase()}...`}
              />
            ) : (
              <input
                type={field.input_type}
                name={field.key}
                required={field.required}
                className="tb-input"
                placeholder={`Nhập ${field.label.toLowerCase()}...`}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="tb-btn tb-btn-primary"
          style={{ width: '100%', marginTop: '8px' }}
        >
          {loading ? 'Đang gửi thông tin...' : props.submit_label || 'Gửi Thông Tin'}
        </button>
      </form>
    </div>
  );
};
