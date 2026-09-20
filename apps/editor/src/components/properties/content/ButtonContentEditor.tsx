import React, { useState } from 'react';
import { ButtonBlockProps } from '@t-business/shared-types';
import { Sparkles } from 'lucide-react';
import { AiCopywriteModal } from './AiCopywriteModal';

interface Props {
  blockId: string;
  props: ButtonBlockProps;
  onUpdateProps: (updates: Partial<ButtonBlockProps>) => void;
}

export const ButtonContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label className="form-label" style={{ margin: 0 }}>Nhãn nút (Button Text)</label>
          <button
            onClick={() => setIsAiOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #E9D5FF',
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Sử dụng Gemini AI để gợi ý lời kêu gọi hành động (CTA) thu hút click"
          >
            <Sparkles size={12} /> AI Gợi Ý
          </button>
        </div>
        <input
          type="text"
          className="form-control"
          value={props.label || ''}
          onChange={(e) => onUpdateProps({ label: e.target.value })}
        />
      </div>

      <AiCopywriteModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        fieldType="button"
        currentValue={props.label || ''}
        onApply={(label) => onUpdateProps({ label })}
      />
      <div>
        <label className="form-label">Đường dẫn liên kết (Href)</label>
        <input
          type="text"
          className="form-control"
          placeholder="https://... hoặc #contact"
          value={props.href || ''}
          onChange={(e) => onUpdateProps({ href: e.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Mở tab mới (Target)</label>
        <select
          className="form-control"
          value={props.target || '_self'}
          onChange={(e) => onUpdateProps({ target: e.target.value as any })}
        >
          <option value="_self">Mở trong tab hiện tại (_self)</option>
          <option value="_blank">Mở trong tab mới (_blank)</option>
        </select>
      </div>
    </>
  );
};
