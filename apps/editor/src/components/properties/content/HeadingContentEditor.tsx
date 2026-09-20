import React, { useState } from 'react';
import { HeadingBlockProps } from '@t-business/shared-types';
import { Sparkles } from 'lucide-react';
import { AiCopywriteModal } from './AiCopywriteModal';

interface Props {
  blockId: string;
  props: HeadingBlockProps;
  onUpdateProps: (updates: Partial<HeadingBlockProps>) => void;
}

export const HeadingContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label className="form-label" style={{ margin: 0 }}>Nội dung Tiêu đề</label>
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
            title="Sử dụng Gemini AI để sinh 3 gợi ý tiêu đề hấp dẫn"
          >
            <Sparkles size={12} /> AI Gợi Ý
          </button>
        </div>
        <textarea
          rows={2}
          className="form-control"
          value={props.text || ''}
          onChange={(e) => onUpdateProps({ text: e.target.value })}
        />
      </div>

      <AiCopywriteModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        fieldType="heading"
        currentValue={props.text || ''}
        onApply={(text) => onUpdateProps({ text })}
      />
      <div>
        <label className="form-label">Cấp độ (Level)</label>
        <select
          className="form-control"
          value={props.level || 'h2'}
          onChange={(e) => onUpdateProps({ level: e.target.value as any })}
        >
          <option value="h2">H2 — Tiêu đề phần (Section)</option>
          <option value="h3">H3 — Tiêu đề phụ (Subsection)</option>
          <option value="h4">H4 — Tiêu đề nhỏ (Card)</option>
          <option value="h5">H5 — Tiêu đề H5</option>
          <option value="h6">H6 — Tiêu đề H6</option>
        </select>
      </div>
    </>
  );
};
