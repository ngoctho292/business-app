import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { BlockNode, Breakpoint, BlockType, compilePageStyles } from '@t-business/shared-types';
import {

  HeaderBlock,
  FooterBlock,
  HeadingBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  SectionBlock,
  DividerBlock,
  CollectionListBlock,
  FormBlock,
  VideoBlock,
  EmbedBlock,
  IconBlock,
  ContainerBlock,
} from './blocks';
import { ArrowUp, ArrowDown, Copy, Trash2, Plus, GripVertical, Sparkles, BookmarkPlus } from 'lucide-react';
import { AiSectionGeneratorModal } from './AiSectionGeneratorModal';

export const Canvas: React.FC = () => {
  const { blocks, breakpoint, selectedBlockId, selectBlock, addBlock } = useCanvasStore();
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [aiSectionModalOpen, setAiSectionModalOpen] = useState(false);

  const getCanvasWidth = (bp: Breakpoint) => {
    switch (bp) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCanvas) setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const blockType = e.dataTransfer.getData('text/plain') as BlockType;
    const reorderId = e.dataTransfer.getData('reorderBlockId');

    if (blockType && !reorderId) {
      addBlock(blockType);
    }
  };

  // Lấy các block gốc (parent_id = null)
  const rootBlocks = blocks
    .filter((b) => !b.parent_id)
    .sort((a, b) => a.order_index - b.order_index);

  const dynamicCanvasCss = compilePageStyles(blocks);

  return (
    <div
      style={{
        flex: 1,
        height: 'calc(100vh - var(--topbar-height))',
        overflowY: 'auto',
        backgroundColor: 'var(--color-bg)',
        padding: '32px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
      onClick={() => selectBlock(null)}
    >
      {/* Live Dynamic Scoped CSS */}
      <style id="tb-canvas-dynamic-css">{dynamicCanvasCss}</style>

      <div
        className="tb-canvas-container"
        data-breakpoint={breakpoint}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
        style={{
          width: getCanvasWidth(breakpoint),
          maxWidth: '1080px',
          minHeight: '650px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: breakpoint === 'desktop' ? '8px' : '16px',
          boxShadow: isDragOverCanvas
            ? '0 0 0 3px var(--color-accent), 0 8px 30px rgba(47,111,79,0.15)'
            : '0 4px 20px rgba(0,0,0,0.06)',
          border: isDragOverCanvas ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
          padding: breakpoint === 'mobile' ? '12px 6px' : '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >


        {isDragOverCanvas && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(47, 111, 79, 0.04)',
              border: '2px dashed var(--color-accent)',
              borderRadius: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-accent)',
            }}
          >
            📥 Thả vào đây để thêm block mới vào Canvas
          </div>
        )}

        {rootBlocks.length === 0 ? (
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
            }}
          >
            Chưa có block nào trên canvas. Kéo hoặc click vào một block từ thư viện bên trái để bắt đầu!
          </div>
        ) : (
          rootBlocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              allBlocks={blocks}
              breakpoint={breakpoint}
              isSelected={selectedBlockId === block.id}
              onSelect={() => selectBlock(block.id)}
            />
          ))
        )}

        {/* Bottom Add Bar */}
        <div
          style={{
            borderTop: '1px dashed var(--color-border)',
            paddingTop: '16px',
            marginTop: '8px',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <button
            className="btn"
            style={{ fontSize: '12px', borderStyle: 'dashed' }}
            onClick={() => addBlock('section')}
          >
            <Plus size={14} /> Thêm Section mới
          </button>
          <button
            className="btn"
            style={{
              fontSize: '12px',
              border: '1px solid #D8B4FE',
              backgroundColor: '#FAF5FF',
              color: '#7E22CE',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={() => setAiSectionModalOpen(true)}
          >
            <Sparkles size={14} color="#7E22CE" /> ✨ AI Sinh Section từ Ảnh / Chữ
          </button>
        </div>
      </div>

      <AiSectionGeneratorModal
        isOpen={aiSectionModalOpen}
        onClose={() => setAiSectionModalOpen(false)}
      />
    </div>
  );
};

interface BlockItemProps {
  block: BlockNode;
  allBlocks: BlockNode[];
  breakpoint: Breakpoint;
  isSelected: boolean;
  onSelect: () => void;
}

const BlockItem: React.FC<BlockItemProps> = ({
  block,
  allBlocks,
  breakpoint,
  isSelected,
  onSelect,
}) => {
  const { moveBlock, duplicateBlock, deleteBlock, addBlock, selectBlock, selectedBlockId, reorderBlocks, saveSectionAsCustomBlock } =
    useCanvasStore();
  const [isDragOverSection, setIsDragOverSection] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom' | 'inside' | null>(null);

  // Lấy các block con nếu là section
  const childrenBlocks = allBlocks
    .filter((b) => b.parent_id === block.id)
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

  const handleBlockDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('reorderBlockId', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBlockDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;

    if ((block.type === 'section' || block.type === 'container') && offsetY > 35 && offsetY < height - 35) {
      setDragOverPosition('inside');
    } else if (offsetY < height / 2) {
      setDragOverPosition('top');
    } else {
      setDragOverPosition('bottom');
    }
  };

  const handleBlockDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPosition(null);
  };

  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = dragOverPosition;
    setDragOverPosition(null);

    const reorderId = e.dataTransfer.getData('reorderBlockId');
    const newBlockType = e.dataTransfer.getData('text/plain') as BlockType;

    if (reorderId && reorderId !== block.id) {
      // Reorder existing block
      reorderBlocks(reorderId, block.id);
    } else if (newBlockType) {
      // Insert new block from library at the exact location
      if ((block.type === 'section' || block.type === 'container') && pos === 'inside') {
        addBlock(newBlockType, block.id);
      } else if (pos === 'top') {
        const siblings = allBlocks
          .filter((b) => (b.parent_id || null) === (block.parent_id || null))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
        const idx = siblings.findIndex((b) => b.id === block.id);
        const prevId = idx > 0 ? siblings[idx - 1].id : null;
        addBlock(newBlockType, block.parent_id || null, prevId);
      } else {
        // Chèn ngay dưới block này
        addBlock(newBlockType, block.parent_id || null, block.id);
      }
    }
  };

  const renderContent = () => {
    switch (block.type) {
      case 'header':
        return <HeaderBlock id={block.id} props={block.props as any} breakpoint={breakpoint} />;
      case 'footer':
        return <FooterBlock id={block.id} props={block.props as any} breakpoint={breakpoint} />;
      case 'heading':
        return <HeadingBlock id={block.id} props={block.props as any} />;
      case 'text':
        return <TextBlock id={block.id} props={block.props as any} />;
      case 'image':
        return <ImageBlock id={block.id} props={block.props as any} />;
      case 'button':
        return <ButtonBlock id={block.id} props={block.props as any} />;
      case 'divider':
        return <DividerBlock id={block.id} props={block.props as any} />;
      case 'collection_list':
        return (
          <CollectionListBlock props={block.props as any} breakpoint={breakpoint} />
        );
      case 'form':
        return <FormBlock id={block.id} props={block.props as any} />;
      case 'video':
        return <VideoBlock id={block.id} props={block.props as any} />;
      case 'embed':
        return <EmbedBlock id={block.id} props={block.props as any} />;
      case 'icon':
        return <IconBlock id={block.id} props={block.props as any} />;
      case 'section':
        return (
          <SectionBlock id={block.id} props={block.props as any}>
            {childrenBlocks.length === 0 ? (

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(false);
                  const blockType = e.dataTransfer.getData('text/plain') as BlockType;
                  if (blockType) addBlock(blockType, block.id);
                }}
                style={{
                  padding: '24px',
                  border: isDragOverSection
                    ? '2px dashed var(--color-accent)'
                    : '1px dashed var(--color-border)',
                  backgroundColor: isDragOverSection ? 'rgba(47,111,79,0.05)' : 'transparent',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isDragOverSection
                  ? '📥 Thả block vào trong Section này'
                  : 'Khu vực Section trống. Kéo block vào đây hoặc bấm nút dưới:'}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                  <button
                    className="btn"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('heading', block.id);
                    }}
                  >
                    + Tiêu đề
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('text', block.id);
                    }}
                  >
                    + Đoạn văn
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('button', block.id);
                    }}
                  >
                    + Nút CTA
                  </button>
                </div>
              </div>
            ) : (
              childrenBlocks.map((child) => (
                <BlockItem
                  key={child.id}
                  block={child}
                  allBlocks={allBlocks}
                  breakpoint={breakpoint}
                  isSelected={selectedBlockId === child.id}
                  onSelect={() => selectBlock(child.id)}
                />
              ))
            )}
          </SectionBlock>
        );
      case 'container':
        return (
          <ContainerBlock id={block.id} props={block.props as any}>
            {childrenBlocks.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragOverSection(false);
                  const blockType = e.dataTransfer.getData('text/plain') as BlockType;
                  if (blockType) addBlock(blockType, block.id);
                }}
                style={{
                  padding: '16px',
                  border: isDragOverSection
                    ? '2px dashed var(--color-accent)'
                    : '1px dashed #D1D5DB',
                  backgroundColor: isDragOverSection ? 'rgba(47,111,79,0.05)' : 'rgba(243,244,246,0.5)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)',
                  fontSize: '11px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isDragOverSection
                  ? '📥 Thả block vào trong Thẻ (Card)'
                  : 'Thẻ trống. Kéo block vào đây hoặc bấm +'}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '3px 6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('icon', block.id);
                    }}
                  >
                    + Icon
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '3px 6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('heading', block.id);
                    }}
                  >
                    + Tiêu đề
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '3px 6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('text', block.id);
                    }}
                  >
                    + Đoạn văn
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: '10px', padding: '3px 6px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addBlock('button', block.id);
                    }}
                  >
                    + Nút
                  </button>
                </div>
              </div>
            ) : (
              childrenBlocks.map((child) => (
                <BlockItem
                  key={child.id}
                  block={child}
                  allBlocks={allBlocks}
                  breakpoint={breakpoint}
                  isSelected={selectedBlockId === child.id}
                  onSelect={() => selectBlock(child.id)}
                />
              ))
            )}
          </ContainerBlock>
        );
      default:
        return <div>Block Content</div>;
    }
  };

  const isContainer = block.type === 'container';
  const isInsideContainer =
    !!block.parent_id && allBlocks.find((b) => b.id === block.parent_id)?.type === 'container';

  return (
    <div
      draggable
      onDragStart={handleBlockDragStart}
      onDragOver={handleBlockDragOver}
      onDragLeave={handleBlockDragLeave}
      onDrop={handleBlockDrop}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'relative',
        borderRadius: isContainer ? '16px' : '6px',
        borderTop: dragOverPosition === 'top'
          ? '3px solid var(--color-accent)'
          : isSelected
          ? '2px solid var(--color-accent)'
          : dragOverPosition === 'inside'
          ? '2px dashed var(--color-accent)'
          : '1px solid transparent',
        borderBottom: dragOverPosition === 'bottom'
          ? '3px solid var(--color-accent)'
          : isSelected
          ? '2px solid var(--color-accent)'
          : dragOverPosition === 'inside'
          ? '2px dashed var(--color-accent)'
          : '1px solid transparent',
        borderLeft: isSelected
          ? '2px solid var(--color-accent)'
          : dragOverPosition === 'inside'
          ? '2px dashed var(--color-accent)'
          : '1px solid transparent',
        borderRight: isSelected
          ? '2px solid var(--color-accent)'
          : dragOverPosition === 'inside'
          ? '2px dashed var(--color-accent)'
          : '1px solid transparent',
        backgroundColor: isSelected
          ? 'rgba(47, 111, 79, 0.02)'
          : dragOverPosition
          ? 'rgba(47, 111, 79, 0.05)'
          : 'transparent',
        transition: 'all 0.15s ease',
        padding: isContainer
          ? '0px'
          : isInsideContainer
          ? '0px'
          : (breakpoint === 'mobile'
              ? (block.type === 'section' ? '2px' : '4px')
              : (block.type === 'section' ? '4px' : '8px')),
        height: isContainer ? '100%' : undefined,
        display: isContainer ? 'flex' : undefined,
        flexDirection: isContainer ? 'column' : undefined,
        flex: isContainer ? '1 1 auto' : undefined,
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
      }}
    >
      {/* Drop Indicator Label */}
      {dragOverPosition && (
        <div
          style={{
            position: 'absolute',
            ...(dragOverPosition === 'top' ? { top: '-10px' } : dragOverPosition === 'bottom' ? { bottom: '-10px' } : { top: '50%', transform: 'translateY(-50%)' }),
            left: '50%',
            transform: dragOverPosition === 'inside' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
            backgroundColor: 'var(--color-accent)',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '10px',
            zIndex: 30,
            pointerEvents: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          {dragOverPosition === 'top'
            ? '⬆ Thả để chèn lên trên'
            : dragOverPosition === 'bottom'
            ? '⬇ Thả để chèn xuống dưới'
            : '📥 Thả vào trong Section'}
        </div>
      )}

      {/* Floating Toolbar on Selected Block */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '-32px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            padding: '2px 4px',
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              padding: '0 6px',
              borderRight: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <GripVertical size={11} /> {block.type}
          </span>
          <button
            className="btn"
            style={{ padding: '3px 5px', border: 'none' }}
            onClick={() => moveBlock(block.id, 'up')}
            title="Di chuyển lên (Move Up)"
          >
            <ArrowUp size={13} />
          </button>
          <button
            className="btn"
            style={{ padding: '3px 5px', border: 'none' }}
            onClick={() => moveBlock(block.id, 'down')}
            title="Di chuyển xuống (Move Down)"
          >
            <ArrowDown size={13} />
          </button>
          <button
            className="btn"
            style={{ padding: '3px 5px', border: 'none' }}
            onClick={() => duplicateBlock(block.id)}
            title="Nhân bản (Duplicate)"
          >
            <Copy size={13} />
          </button>
          {block.type === 'section' && (
            <button
              className="btn"
              style={{ padding: '3px 5px', border: 'none', color: '#7E22CE' }}
              onClick={async () => {
                const name = prompt('Nhập tên để lưu Section này vào Thư viện Block của Site:', 'Section ' + new Date().toLocaleTimeString('vi-VN'));
                if (name && name.trim()) {
                  try {
                    await saveSectionAsCustomBlock(block.id, name);
                    alert(`✅ Đã lưu "${name}" vào Thư Viện Block của site!`);
                  } catch (err: any) {
                    alert('Lỗi: ' + (err.message || 'Không thể lưu section'));
                  }
                }
              }}
              title="Lưu vào Thư Viện Block của Site (Save to Site Block Library)"
            >
              <BookmarkPlus size={13} />
            </button>
          )}
          <button
            className="btn"
            style={{ padding: '3px 5px', border: 'none', color: 'var(--color-danger)' }}
            onClick={() => deleteBlock(block.id)}
            title="Xóa block (Delete)"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {renderContent()}
    </div>
  );
};
