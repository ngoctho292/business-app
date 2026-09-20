import React, { useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  Trash2,
  Copy,
  Layers,
  Palette,
  Sliders,
  MousePointer,
} from 'lucide-react';
import { cmsService } from '../services/cmsService';
import {
  ContentTypeDTO,
  BlockStyleProperties,
} from '@t-business/shared-types';
import { MediaLibraryModal } from './MediaLibraryModal';
import {
  HeaderContentEditor,
  FooterContentEditor,
  HeadingContentEditor,
  TextContentEditor,
  ButtonContentEditor,
  ImageContentEditor,
  SectionContentEditor,
  ContainerContentEditor,
  DividerContentEditor,
  CollectionListContentEditor,
  FormContentEditor,
  VideoContentEditor,
  EmbedContentEditor,
  IconContentEditor,
  SizingSection,
  SpacingSection,
  TypographySection,
  BackgroundSection,
  BordersSection,
  ResponsiveOverrideSection,
  CustomCssSection,
} from './properties';

export const PropertiesPanel: React.FC = () => {
  const {
    blocks,
    selectedBlockId,
    activeStyleState,
    setActiveStyleState,
    updateBlockProps,
    updateBlockStyleProp,
    updateBlockResponsiveStyleProp,
    deleteBlock,
    duplicateBlock,
    siteId,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'advanced'>('content');
  const [contentTypes, setContentTypes] = useState<ContentTypeDTO[]>([]);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    propKey: string;
    isStyle?: boolean;
    styleState?: 'base' | 'hover' | 'focus';
    label: string;
  } | null>(null);

  useEffect(() => {
    cmsService.getContentTypes(siteId).then(setContentTypes).catch(() => {});
  }, [siteId]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <aside
        style={{
          width: 'var(--props-panel-width)',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          height: 'calc(100vh - var(--topbar-height))',
          padding: '32px 20px',
          color: 'var(--color-text-secondary)',
          fontSize: '13px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(47, 111, 79, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}
        >
          <Sliders size={24} />
        </div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '15px' }}>
          Tùy Chỉnh Phần Tử
        </div>
        <p style={{ lineHeight: 1.5, margin: 0, maxWidth: '240px' }}>
          Chọn một block trên canvas để bắt đầu chỉnh sửa nội dung và kiểu dáng.
        </p>
      </aside>
    );
  }

  const { type, props } = selectedBlock;
  const styles = selectedBlock.styles || {};
  const currentStyles: BlockStyleProperties =
    (activeStyleState === 'hover' ? styles.hover : styles.base) || {};

  const handleStyleChange = (prop: keyof BlockStyleProperties, val: string | number) => {
    updateBlockStyleProp(selectedBlock.id, activeStyleState, prop, val);
  };

  const handleResponsiveStyleChange = (
    bp: 'tablet' | 'mobile',
    prop: keyof BlockStyleProperties,
    val: string
  ) => {
    updateBlockResponsiveStyleProp(selectedBlock.id, bp, prop, val);
  };

  const openMediaPicker = (propKey: string, label: string) => {
    setMediaPickerTarget({ propKey, label });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget && selectedBlock) {
      if (mediaPickerTarget.isStyle) {
        updateBlockStyleProp(
          selectedBlock.id,
          mediaPickerTarget.styleState || 'base',
          mediaPickerTarget.propKey as keyof BlockStyleProperties,
          url
        );
      } else {
        updateBlockProps(selectedBlock.id, { [mediaPickerTarget.propKey]: url });
      }
    }
    setMediaPickerTarget(null);
  };

  return (
    <>
      <aside
        style={{
          width: 'var(--props-panel-width)',
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          height: 'calc(100vh - var(--topbar-height))',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxSizing: 'border-box',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Top Header: Title & Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'capitalize' }}>
                {type}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'rgba(47, 111, 79, 0.1)',
                  color: 'var(--color-primary)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                #{selectedBlock.id.slice(-6)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="btn secondary icon-only"
              onClick={() => duplicateBlock(selectedBlock.id)}
              title="Nhân bản block"
            >
              <Copy size={14} />
            </button>
            <button
              className="btn icon-only"
              style={{ color: 'var(--color-danger)' }}
              onClick={() => deleteBlock(selectedBlock.id)}
              title="Xóa block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 3-Tab Selector */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: 'var(--color-bg)',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px',
          }}
        >
          <button
            onClick={() => setActiveTab('content')}
            style={{
              padding: '6px 4px',
              fontSize: '12px',
              fontWeight: activeTab === 'content' ? 600 : 500,
              color: activeTab === 'content' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'content' ? '#FFFFFF' : 'transparent',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: activeTab === 'content' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Layers size={13} />
            Nội Dung
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            style={{
              padding: '6px 4px',
              fontSize: '12px',
              fontWeight: activeTab === 'styles' ? 600 : 500,
              color: activeTab === 'styles' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'styles' ? '#FFFFFF' : 'transparent',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: activeTab === 'styles' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Palette size={13} />
            Kiểu Dáng
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            style={{
              padding: '6px 4px',
              fontSize: '12px',
              fontWeight: activeTab === 'advanced' ? 600 : 500,
              color: activeTab === 'advanced' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'advanced' ? '#FFFFFF' : 'transparent',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: activeTab === 'advanced' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Sliders size={13} />
            Nâng Cao
          </button>
        </div>

        {/* TAB 1: NỘI DUNG (CONTENT) */}
        {activeTab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {type === 'header' && (
              <HeaderContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
                onOpenMediaPicker={openMediaPicker}
              />
            )}
            {type === 'footer' && (
              <FooterContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
                onOpenMediaPicker={openMediaPicker}
              />
            )}
            {type === 'heading' && (
              <HeadingContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'text' && (
              <TextContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'button' && (
              <ButtonContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'image' && (
              <ImageContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
                onOpenMediaPicker={openMediaPicker}
              />
            )}
            {type === 'section' && (
              <SectionContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'container' && (
              <ContainerContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'divider' && (
              <DividerContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'collection_list' && (
              <CollectionListContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                contentTypes={contentTypes}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'form' && (
              <FormContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'video' && (
              <VideoContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'embed' && (
              <EmbedContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
            {type === 'icon' && (
              <IconContentEditor
                blockId={selectedBlock.id}
                props={props as any}
                onUpdateProps={(updates) => updateBlockProps(selectedBlock.id, updates)}
              />
            )}
          </div>
        )}

        {/* TAB 2: KIỂU DÁNG (STYLES) */}
        {activeTab === 'styles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* State Switcher (Base vs Hover) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                backgroundColor: activeStyleState === 'hover' ? '#EEF2FF' : '#F9FAFB',
                border: activeStyleState === 'hover' ? '1px solid #C7D2FE' : '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                <MousePointer size={14} color={activeStyleState === 'hover' ? '#4F46E5' : '#6B7280'} />
                Trạng thái:
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setActiveStyleState('base')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: activeStyleState === 'base' ? '#FFFFFF' : 'transparent',
                    color: activeStyleState === 'base' ? 'var(--color-text-primary)' : '#6B7280',
                    fontWeight: activeStyleState === 'base' ? 600 : 400,
                    boxShadow: activeStyleState === 'base' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  Mặc định
                </button>
                <button
                  onClick={() => setActiveStyleState('hover')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: activeStyleState === 'hover' ? '#4F46E5' : 'transparent',
                    color: activeStyleState === 'hover' ? '#FFFFFF' : '#6B7280',
                    fontWeight: activeStyleState === 'hover' ? 600 : 400,
                    boxShadow: activeStyleState === 'hover' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  :hover (Rê chuột)
                </button>
              </div>
            </div>

            {/* 0. Sizing & Dimensions */}
            <SizingSection
              currentStyles={currentStyles}
              blockType={type}
              onStyleChange={handleStyleChange}
            />

            {/* 1. Box Model Spacing */}
            <SpacingSection
              currentStyles={currentStyles}
              onStyleChange={handleStyleChange}
            />

            {/* 2. Typography */}
            <TypographySection
              currentStyles={currentStyles}
              onStyleChange={handleStyleChange}
            />

            {/* 3. Background */}
            <BackgroundSection
              currentStyles={currentStyles}
              onStyleChange={handleStyleChange}
            />

            {/* 4. Borders & Radius & Shadow */}
            <BordersSection
              currentStyles={currentStyles}
              onStyleChange={handleStyleChange}
            />
          </div>
        )}

        {/* TAB 3: NÂNG CAO & RESPONSIVE */}
        {activeTab === 'advanced' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ResponsiveOverrideSection
              styles={styles}
              onResponsiveStyleChange={handleResponsiveStyleChange}
            />
            <CustomCssSection
              customCss={selectedBlock.custom_css}
              onCustomCssChange={(val) => updateBlockProps(selectedBlock.id, { custom_css: val })}
            />
          </div>
        )}
      </aside>

      {/* Media Library Modal */}
      {mediaPickerTarget && (
        <MediaLibraryModal
          siteId={siteId}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={handleMediaSelect}
          imagesOnly={true}
        />
      )}

    </>
  );
};
