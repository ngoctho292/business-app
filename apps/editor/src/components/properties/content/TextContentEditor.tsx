import React, { useState } from 'react';
import { TextBlockProps } from '@t-business/shared-types';
import { Sparkles } from 'lucide-react';
import { AiCopywriteModal } from './AiCopywriteModal';

interface Props {
  blockId: string;
  props: TextBlockProps;
  onUpdateProps: (updates: Partial<TextBlockProps>) => void;
}

export const TextContentEditor: React.FC<Props> = ({ props, onUpdateProps }) => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label className="form-label" style={{ margin: 0 }}>Nội dung đoạn văn bản</label>
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
          title="Sử dụng Gemini AI để viết đoạn văn tiếp thị chuẩn ngành"
        >
          <Sparkles size={12} /> AI Viết Đoạn Văn
        </button>
      </div>
      <textarea
        rows={6}
        className="form-control"
        value={props.richtext || ''}
        onChange={(e) => onUpdateProps({ richtext: e.target.value })}
        placeholder="Nhập nội dung văn bản..."
      />

      <AiCopywriteModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        fieldType="text"
        currentValue={props.richtext || ''}
        onApply={(richtext) => onUpdateProps({ richtext })}
      />
    </div>
  );
};
