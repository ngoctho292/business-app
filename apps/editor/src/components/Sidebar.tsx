import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import {
  Heading,
  Type,
  Image as ImageIcon,
  Square,
  Columns,
  Minus,
  ListFilter,
  FormInput,
  Video,
  Code2,
  PanelTop,
  PanelBottom,
  Star,
  Sparkles,
  Trash2,
  Layers,
  Zap,
} from 'lucide-react';
import { BlockType, BlockNode } from '@t-business/shared-types';
import { AiSectionGeneratorModal } from './AiSectionGeneratorModal';

export const Sidebar: React.FC = () => {
  const {
    addBlock,
    slug,
    siteId,
    domain,
    sitePages,
    loadFromSiteAndPage,
    createPageInSite,
    deletePageInSite,
    customBlocks,
    appendBlocks,
    deleteCustomBlock,
  } = useCanvasStore();

  const [blockLibraryTab, setBlockLibraryTab] = React.useState<'default' | 'custom'>('default');
  const [aiSectionModalOpen, setAiSectionModalOpen] = React.useState(false);
  const [isAddingPage, setIsAddingPage] = React.useState(false);
  const [newPageSlug, setNewPageSlug] = React.useState('');
  const [addingLoading, setAddingLoading] = React.useState(false);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageSlug.trim()) return;
    const cleanSlug = newPageSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setAddingLoading(true);
    try {
      await createPageInSite(cleanSlug);
      setNewPageSlug('');
      setIsAddingPage(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo trang mới');
    } finally {
      setAddingLoading(false);
    }
  };

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        height: 'calc(100vh - var(--topbar-height))',
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        userSelect: 'none',
      }}
    >
      {/* Dynamic Pages Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h3
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
              margin: 0,
            }}
          >
            Trang trong website ({sitePages.length})
          </h3>
          <button
            onClick={() => setIsAddingPage(!isAddingPage)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              color: 'var(--color-accent)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            title="Thêm trang mới vào website này"
          >
            {isAddingPage ? 'Đóng' : '+ Thêm'}
          </button>
        </div>

        {/* Quick Add Page Form */}
        {isAddingPage && (
          <form onSubmit={handleCreatePage} style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '6px 8px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', borderLeft: '1px solid var(--color-border)', borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>/</span>
              <input
                type="text"
                value={newPageSlug}
                onChange={(e) => setNewPageSlug(e.target.value)}
                placeholder="slug (vd: menu, about)"
                autoFocus
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '0 6px 6px 0',
                  border: '1px solid var(--color-border)',
                  fontSize: '12px',
                  outline: 'none',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={addingLoading || !newPageSlug.trim()}
              style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {addingLoading ? 'Đang tạo...' : 'Tạo Trang'}
            </button>
          </form>
        )}

        {/* Dynamic Pages List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {sitePages.map((page) => {
            const isActive = slug === page.slug;
            return (
              <div
                key={page.id || page.slug}
                onClick={() => {
                  if (!isActive) {
                    loadFromSiteAndPage({ siteId, domain, slug: page.slug });
                  }
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  backgroundColor: isActive ? '#F4EEDD' : 'transparent',
                  color: isActive ? '#B7791F' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.15s ease',
                  border: isActive ? '1px solid #E2D9C5' : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{page.slug === 'home' ? '🏠 Trang chủ (Home)' : `📄 /${page.slug}`}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isActive ? (
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, backgroundColor: '#B7791F', color: 'white', padding: '1px 5px', borderRadius: '3px' }}>
                      Active
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                      {page.status === 'published' ? 'Live' : 'Nháp'}
                    </span>
                  )}
                  {page.slug !== 'home' && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`Bạn có chắc chắn muốn xoá trang "/${page.slug}" không? Thao tác này không thể hoàn tác.`)) {
                          await deletePageInSite(page.id, page.slug);
                        }
                      }}
                      title={`Xoá trang /${page.slug}`}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.5,
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.color = 'var(--color-danger, #EF4444)';
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.5';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Palette - Categorized into Header, Body, Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Thư viện Block
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 600 }}>
            Kéo hoặc Click
          </span>
        </div>

        {/* 2 Tabs: Khối Mặc Định & Khối Của Site */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-bg)',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setBlockLibraryTab('default')}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: '11px',
              fontWeight: blockLibraryTab === 'default' ? 700 : 500,
              backgroundColor: blockLibraryTab === 'default' ? 'var(--color-surface)' : 'transparent',
              color: blockLibraryTab === 'default' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: blockLibraryTab === 'default' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🧩 Mặc Định
          </button>
          <button
            type="button"
            onClick={() => setBlockLibraryTab('custom')}
            style={{
              flex: 1,
              padding: '6px 4px',
              fontSize: '11px',
              fontWeight: blockLibraryTab === 'custom' ? 700 : 500,
              backgroundColor: blockLibraryTab === 'custom' ? '#FAF5FF' : 'transparent',
              color: blockLibraryTab === 'custom' ? '#7E22CE' : 'var(--color-text-secondary)',
              border: blockLibraryTab === 'custom' ? '1px solid #E9D5FF' : 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: blockLibraryTab === 'custom' ? '0 1px 3px rgba(126,34,206,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>⭐ Của Site</span>
            {customBlocks.length > 0 && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  backgroundColor: '#7E22CE',
                  color: 'white',
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}
              >
                {customBlocks.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: KHỐI MẶC ĐỊNH */}
        {blockLibraryTab === 'default' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* 1. HEADER SECTION */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PanelTop size={13} /> 1. ĐẦU TRANG (HEADER)
          </div>
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'header');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => addBlock('header')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #D1E7DD',
              backgroundColor: '#F7FCF9',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'grab',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = '#EBF4F0';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D1E7DD';
              e.currentTarget.style.backgroundColor = '#F7FCF9';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ color: 'var(--color-accent)', display: 'flex' }}>
              <PanelTop size={18} />
            </div>
            <div>
              <div>Header (Đầu trang)</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                Logo, Tiêu đề, Menu Submenu, CTA
              </div>
            </div>
          </div>
        </div>

        {/* 2. BODY & CONTENT SECTION */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Columns size={13} /> 2. THÂN TRANG & NỘI DUNG (BODY)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { type: 'section' as BlockType, label: 'Khối Section', icon: <Columns size={15} /> },
              { type: 'container' as BlockType, label: 'Thẻ bọc (Card)', icon: <Layers size={15} /> },
              { type: 'heading' as BlockType, label: 'Tiêu đề', icon: <Heading size={15} /> },
              { type: 'text' as BlockType, label: 'Đoạn văn bản', icon: <Type size={15} /> },
              { type: 'image' as BlockType, label: 'Hình ảnh', icon: <ImageIcon size={15} /> },
              { type: 'button' as BlockType, label: 'Nút bấm CTA', icon: <Square size={15} /> },
              { type: 'divider' as BlockType, label: 'Đường phân cách', icon: <Minus size={15} /> },
              { type: 'icon' as BlockType, label: 'Biểu tượng (Icon)', icon: <Star size={15} /> },
              { type: 'collection_list' as BlockType, label: 'Danh sách CMS', icon: <ListFilter size={15} /> },
              { type: 'form' as BlockType, label: 'Biểu mẫu liên hệ', icon: <FormInput size={15} /> },
              { type: 'video' as BlockType, label: 'Video Clip', icon: <Video size={15} /> },
              { type: 'embed' as BlockType, label: 'Nhúng ngoài', icon: <Code2 size={15} /> },
            ].map((item) => (
              <div
                key={item.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', item.type);
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => addBlock(item.type)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '10px 6px',
                  borderRadius: '6px',
                  border: '1px dashed var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  cursor: 'grab',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ color: 'var(--color-accent)' }}>{item.icon}</div>
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. MẪU SECTION THIẾT KẾ SẴN (SMART PRESETS) */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={13} color="#D97706" /> 3. MẪU BỐ CỤC SẴN (SMART PRESETS)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Preset 1: Split Hero */}
            <div
              onClick={() => {
                const ts = Date.now();
                const secId = `sec-hero-${ts}`;
                const colTextId = `col-txt-${ts}`;
                const blocks: BlockNode[] = [
                  {
                    id: secId,
                    page_version_id: 'ver-preset',
                    parent_id: null,
                    type: 'section',
                    props: { layout: 'split-left', tag: 'section' },
                    styles: { base: { padding: '48px 24px', backgroundColor: '#F8FAFC' } },
                    order_index: 0,
                  },
                  {
                    id: colTextId,
                    page_version_id: 'ver-preset',
                    parent_id: secId,
                    type: 'container',
                    props: { tag: 'div' },
                    styles: { base: { display: 'flex', flexDirection: 'column', gap: '16px' } },
                    order_index: 0,
                  },
                  {
                    id: `h1-${ts}`,
                    page_version_id: 'ver-preset',
                    parent_id: colTextId,
                    type: 'heading',
                    props: { text: 'Giải Pháp Đột Phá Cho Doanh Nghiệp', level: 'h1' },
                    styles: { base: { color: '#0F172A', fontSize: '32px', fontWeight: '800', lineHeight: '1.2' } },
                    order_index: 0,
                  },
                  {
                    id: `p-${ts}`,
                    page_version_id: 'ver-preset',
                    parent_id: colTextId,
                    type: 'text',
                    props: { richtext: 'Tối ưu hóa quy trình vận hành và bứt phá doanh số với nền tảng công nghệ toàn diện.' },
                    styles: { base: { color: '#475569', fontSize: '15px', lineHeight: '1.6' } },
                    order_index: 1,
                  },
                  {
                    id: `btn-${ts}`,
                    page_version_id: 'ver-preset',
                    parent_id: colTextId,
                    type: 'button',
                    props: { label: 'Bắt Đầu Ngay', href: '#' },
                    styles: { base: { backgroundColor: 'var(--color-primary, #2F6F4F)', color: '#FFFFFF', padding: '10px 24px', borderRadius: '8px', alignSelf: 'flex-start' } },
                    order_index: 2,
                  },
                  {
                    id: `img-${ts}`,
                    page_version_id: 'ver-preset',
                    parent_id: secId,
                    type: 'image',
                    props: { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80', alt: 'Minh họa' },
                    styles: { base: { borderRadius: '12px', width: '100%', objectFit: 'cover', height: '280px' } },
                    order_index: 1,
                  },
                ];
                appendBlocks(blocks);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>🌟 Split Hero (Ảnh + Chữ 2 Cột)</span>
              <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>+ Chèn</span>
            </div>

            {/* Preset 2: 3 Tính Năng / Lợi Thế */}
            <div
              onClick={() => {
                const ts = Date.now();
                const secId = `sec-feat-${ts}`;
                const cardStyles = { base: { padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'center' } };
                const blocks: BlockNode[] = [
                  {
                    id: secId,
                    page_version_id: 'ver-preset',
                    parent_id: null,
                    type: 'section',
                    props: { layout: 'grid-3', tag: 'section' },
                    styles: { base: { padding: '40px 20px' } },
                    order_index: 0,
                  },
                  // Card 1
                  { id: `c1-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: cardStyles, order_index: 0 },
                  { id: `ico1-${ts}`, page_version_id: 'ver-preset', parent_id: `c1-${ts}`, type: 'icon', props: { icon: 'solar:shield-check-bold', size: 36, color: 'var(--color-primary)' }, styles: { base: { alignSelf: 'center', marginBottom: '8px' } }, order_index: 0 },
                  { id: `h1-${ts}`, page_version_id: 'ver-preset', parent_id: `c1-${ts}`, type: 'heading', props: { text: 'Bảo Mật Tối Đa', level: 'h3' }, styles: { base: { fontSize: '16px', fontWeight: '700', marginBottom: '6px' } }, order_index: 1 },
                  { id: `t1-${ts}`, page_version_id: 'ver-preset', parent_id: `c1-${ts}`, type: 'text', props: { richtext: 'Hệ thống mã hóa chuẩn ngân hàng, an toàn tuyệt đối.' }, styles: { base: { fontSize: '12px', color: '#64748B' } }, order_index: 2 },
                  // Card 2
                  { id: `c2-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: cardStyles, order_index: 1 },
                  { id: `ico2-${ts}`, page_version_id: 'ver-preset', parent_id: `c2-${ts}`, type: 'icon', props: { icon: 'solar:bolt-bold', size: 36, color: 'var(--color-primary)' }, styles: { base: { alignSelf: 'center', marginBottom: '8px' } }, order_index: 0 },
                  { id: `h2-${ts}`, page_version_id: 'ver-preset', parent_id: `c2-${ts}`, type: 'heading', props: { text: 'Tốc Độ Vượt Trội', level: 'h3' }, styles: { base: { fontSize: '16px', fontWeight: '700', marginBottom: '6px' } }, order_index: 1 },
                  { id: `t2-${ts}`, page_version_id: 'ver-preset', parent_id: `c2-${ts}`, type: 'text', props: { richtext: 'Tối ưu tải trang dưới 0.5 giây với Next.js SSR.' }, styles: { base: { fontSize: '12px', color: '#64748B' } }, order_index: 2 },
                  // Card 3
                  { id: `c3-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: cardStyles, order_index: 2 },
                  { id: `ico3-${ts}`, page_version_id: 'ver-preset', parent_id: `c3-${ts}`, type: 'icon', props: { icon: 'solar:headphones-round-sound-bold', size: 36, color: 'var(--color-primary)' }, styles: { base: { alignSelf: 'center', marginBottom: '8px' } }, order_index: 0 },
                  { id: `h3-${ts}`, page_version_id: 'ver-preset', parent_id: `c3-${ts}`, type: 'heading', props: { text: 'Hỗ Trợ 24/7', level: 'h3' }, styles: { base: { fontSize: '16px', fontWeight: '700', marginBottom: '6px' } }, order_index: 1 },
                  { id: `t3-${ts}`, page_version_id: 'ver-preset', parent_id: `c3-${ts}`, type: 'text', props: { richtext: 'Đội ngũ chuyên gia luôn sẵn sàng đồng hành cùng bạn.' }, styles: { base: { fontSize: '12px', color: '#64748B' } }, order_index: 2 },
                ];
                appendBlocks(blocks);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>💎 3 Lợi Thế / Tính Năng (3 Cột)</span>
              <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>+ Chèn</span>
            </div>

            {/* Preset 3: Bảng Giá 3 Gói */}
            <div
              onClick={() => {
                const ts = Date.now();
                const secId = `sec-price-${ts}`;
                const cardBase = { padding: '24px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' };
                const blocks: BlockNode[] = [
                  {
                    id: secId,
                    page_version_id: 'ver-preset',
                    parent_id: null,
                    type: 'section',
                    props: { layout: 'grid-3', tag: 'section' },
                    styles: { base: { padding: '40px 20px' } },
                    order_index: 0,
                  },
                  // Gói 1
                  { id: `pc1-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: { base: cardBase }, order_index: 0 },
                  { id: `ph1-${ts}`, page_version_id: 'ver-preset', parent_id: `pc1-${ts}`, type: 'heading', props: { text: 'Gói Cơ Bản', level: 'h3' }, styles: { base: { fontSize: '17px', fontWeight: '700' } }, order_index: 0 },
                  { id: `pr1-${ts}`, page_version_id: 'ver-preset', parent_id: `pc1-${ts}`, type: 'heading', props: { text: '199.000đ', level: 'h2' }, styles: { base: { fontSize: '24px', color: 'var(--color-primary)', fontWeight: '800' } }, order_index: 1 },
                  { id: `pt1-${ts}`, page_version_id: 'ver-preset', parent_id: `pc1-${ts}`, type: 'text', props: { richtext: 'Dành cho cá nhân khởi nghiệp, đầy đủ tính năng cốt lõi.' }, styles: { base: { fontSize: '12px', color: '#64748B', minHeight: '36px' } }, order_index: 2 },
                  { id: `pb1-${ts}`, page_version_id: 'ver-preset', parent_id: `pc1-${ts}`, type: 'button', props: { label: 'Đăng Ký Ngay', href: '#' }, styles: { base: { padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' } }, order_index: 3 },
                  // Gói 2 (Nổi bật)
                  { id: `pc2-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: { base: { ...cardBase, border: '2px solid var(--color-primary)', boxShadow: '0 8px 20px rgba(47,111,79,0.12)' } }, order_index: 1 },
                  { id: `ph2-${ts}`, page_version_id: 'ver-preset', parent_id: `pc2-${ts}`, type: 'heading', props: { text: 'Gói Chuyên Nghiệp ⭐', level: 'h3' }, styles: { base: { fontSize: '17px', fontWeight: '700', color: 'var(--color-primary)' } }, order_index: 0 },
                  { id: `pr2-${ts}`, page_version_id: 'ver-preset', parent_id: `pc2-${ts}`, type: 'heading', props: { text: '499.000đ', level: 'h2' }, styles: { base: { fontSize: '26px', color: 'var(--color-primary)', fontWeight: '800' } }, order_index: 1 },
                  { id: `pt2-${ts}`, page_version_id: 'ver-preset', parent_id: `pc2-${ts}`, type: 'text', props: { richtext: 'Lựa chọn phổ biến nhất, hỗ trợ không giới hạn lưu lượng.' }, styles: { base: { fontSize: '12px', color: '#64748B', minHeight: '36px' } }, order_index: 2 },
                  { id: `pb2-${ts}`, page_version_id: 'ver-preset', parent_id: `pc2-${ts}`, type: 'button', props: { label: 'Dùng Thử Miễn Phí', href: '#' }, styles: { base: { padding: '9px 18px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: '#FFFFFF', fontWeight: '600' } }, order_index: 3 },
                  // Gói 3
                  { id: `pc3-${ts}`, page_version_id: 'ver-preset', parent_id: secId, type: 'container', props: {}, styles: { base: cardBase }, order_index: 2 },
                  { id: `ph3-${ts}`, page_version_id: 'ver-preset', parent_id: `pc3-${ts}`, type: 'heading', props: { text: 'Gói Doanh Nghiệp', level: 'h3' }, styles: { base: { fontSize: '17px', fontWeight: '700' } }, order_index: 0 },
                  { id: `pr3-${ts}`, page_version_id: 'ver-preset', parent_id: `pc3-${ts}`, type: 'heading', props: { text: '999.000đ', level: 'h2' }, styles: { base: { fontSize: '24px', color: 'var(--color-primary)', fontWeight: '800' } }, order_index: 1 },
                  { id: `pt3-${ts}`, page_version_id: 'ver-preset', parent_id: `pc3-${ts}`, type: 'text', props: { richtext: 'Hạ tầng máy chủ riêng, cam kết SLA 99.9% và hỗ trợ 1-1.' }, styles: { base: { fontSize: '12px', color: '#64748B', minHeight: '36px' } }, order_index: 2 },
                  { id: `pb3-${ts}`, page_version_id: 'ver-preset', parent_id: `pc3-${ts}`, type: 'button', props: { label: 'Liên Hệ Tư Vấn', href: '#' }, styles: { base: { padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', backgroundColor: 'transparent' } }, order_index: 3 },
                ];
                appendBlocks(blocks);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>🏷️ Bảng Giá 3 Gói (3 Thẻ Card)</span>
              <span style={{ fontSize: '10px', color: 'var(--color-accent)' }}>+ Chèn</span>
            </div>
          </div>
        </div>

        {/* 4. FOOTER SECTION */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#4B5563', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PanelBottom size={13} /> 4. CHÂN TRANG (FOOTER)
          </div>
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', 'footer');
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => addBlock('footer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'grab',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.backgroundColor = '#F9FAFB';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ color: '#4B5563', display: 'flex' }}>
              <PanelBottom size={18} />
            </div>
            <div>
              <div>Footer (Chân trang)</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 400 }}>
                Cột liên kết, Mạng xã hội, Bản quyền
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

        {/* TAB 2: KHỐI TỰ THIẾT KẾ / CỦA SITE NÀY */}
        {blockLibraryTab === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Nút Gọi AI Sinh Section Mới */}
            <button
              type="button"
              onClick={() => setAiSectionModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px dashed #A855F7',
                backgroundColor: '#FAF5FF',
                color: '#7E22CE',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3E8FF')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FAF5FF')}
            >
              <Sparkles size={15} color="#7E22CE" />
              <span>✨ + AI Sinh Section Mới</span>
            </button>

            {/* Danh sách block của site */}
            {customBlocks.length === 0 ? (
              <div
                style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: '8px',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📦</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  Chưa có block riêng cho site này
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Bạn có thể dùng AI sinh block từ ảnh chụp hoặc lưu các Section trên Canvas vào đây!
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customBlocks.map((cb) => (
                  <div
                    key={cb.id}
                    onClick={() => appendBlocks(cb.block_nodes)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E9D5FF',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7E22CE';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E9D5FF';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: '#4C1D95' }}>
                        {cb.name}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Bạn có chắc muốn xóa block "${cb.name}" khỏi thư viện của site?`)) {
                            deleteCustomBlock(siteId, cb.id);
                          }
                        }}
                        title="Xóa block này"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#9CA3AF',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#7E22CE' }}>
                      <span style={{ textTransform: 'capitalize' }}>🏷️ {cb.category || 'section'}</span>
                      <span style={{ opacity: 0.8 }}>{cb.block_nodes?.length || 0} blocks con • Click để chèn</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <AiSectionGeneratorModal
        isOpen={aiSectionModalOpen}
        onClose={() => setAiSectionModalOpen(false)}
      />
    </aside>
  );
};
