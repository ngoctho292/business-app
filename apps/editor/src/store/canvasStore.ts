import { create } from 'zustand';
import {
  BlockNode,
  Breakpoint,
  BlockType,
  PageStatus,
  SiteThemeDTO,
  BlockStyles,
  BlockStyleProperties,
  normalizeBlock,
} from '@t-business/shared-types';
import { apiClient } from '../services/apiClient';

export const DEFAULT_THEME: SiteThemeDTO = {
  primaryColor: '#2F6F4F',
  accentColor: '#6B4EFF',
  backgroundColor: '#FFFFFF',
  textColor: '#1F1E1B',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  borderRadius: '8px',
};

export function applyThemeToDom(theme: SiteThemeDTO) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme.primaryColor) {
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--tb-primary', theme.primaryColor);
  }
  if (theme.accentColor) {
    root.style.setProperty('--color-accent', theme.accentColor);
    root.style.setProperty('--tb-secondary', theme.accentColor);
  }
  if (theme.backgroundColor) root.style.setProperty('--color-bg-base', theme.backgroundColor);
  if (theme.textColor) root.style.setProperty('--color-text-base', theme.textColor);
  if (theme.fontHeading) root.style.setProperty('--font-heading-family', `'${theme.fontHeading}', sans-serif`);
  if (theme.fontBody) root.style.setProperty('--font-body-family', `'${theme.fontBody}', sans-serif`);
  if (theme.borderRadius) root.style.setProperty('--global-radius', theme.borderRadius);
}

interface CanvasState {
  // Page info
  pageId: string;
  siteId: string;
  slug: string;
  domain: string;
  pageStatus: PageStatus;
  seoMeta: { title?: string; description?: string; og_image?: string };
  updateSeoMeta: (seo: Partial<{ title: string; description: string; og_image: string }>) => Promise<void>;

  // Global Theme
  theme: SiteThemeDTO;
  updateTheme: (newTheme: Partial<SiteThemeDTO>) => Promise<void>;

  // View mode
  activeView: 'canvas' | 'cms';
  setActiveView: (view: 'canvas' | 'cms') => void;

  // Viewport & selection
  breakpoint: Breakpoint;
  selectedBlockId: string | null;
  activeStyleState: 'base' | 'hover' | 'focus';
  setActiveStyleState: (st: 'base' | 'hover' | 'focus') => void;
  autosaveStatus: 'saved' | 'saving' | 'error';
  saveStatus: 'saved' | 'saving' | 'error';

  // Blocks
  blocks: BlockNode[];

  // Undo / Redo history
  history: BlockNode[][];
  historyIndex: number;

  // Pages in active site
  sitePages: Array<{ id: string; slug: string; status: string }>;
  fetchSitePages: (siteId?: string) => Promise<void>;
  createPageInSite: (slug: string) => Promise<void>;
  deletePageInSite: (pageId: string, pageSlug: string) => Promise<void>;

  // Actions
  setBreakpoint: (bp: Breakpoint) => void;
  selectBlock: (id: string | null) => void;
  addBlock: (
    type: BlockType,
    parentId?: string | null,
    insertAfterBlockId?: string | null
  ) => void;
  updateBlockProp: (id: string, propKey: string, value: any) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockStyles: (id: string, styles: Partial<BlockStyles>) => void;
  updateBlockStyleProp: (
    id: string,
    state: 'base' | 'hover' | 'focus',
    propKey: keyof BlockStyleProperties,
    value: any
  ) => void;
  updateBlockResponsiveStyleProp: (
    id: string,
    bp: 'tablet' | 'mobile',
    propKey: keyof BlockStyleProperties,
    value: any
  ) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  reorderBlocks: (sourceId: string, targetId: string) => void;
  setBlocks: (blocks: BlockNode[]) => void;
  undo: () => void;
  redo: () => void;
  publishCanvas: () => Promise<string>;
  submitForReview: () => Promise<void>;
  approveCurrentVersion: () => Promise<void>;
  rejectCurrentVersion: () => Promise<void>;
  setDomain: (domain: string) => void;
  loadInitialData: () => Promise<void>;
  loadFromSiteAndPage: (params: { siteId: string; domain: string; slug: string }) => Promise<void>;
  customBlocks: any[];
  loadCustomBlocks: (siteId: string) => Promise<void>;
  appendBlocks: (newBlocks: BlockNode[], insertAfterId?: string) => void;
  saveSectionAsCustomBlock: (sectionBlockId: string, name: string) => Promise<any>;
  deleteCustomBlock: (siteId: string, id: string) => Promise<void>;
}

// Initial clean mock blocks
const INITIAL_BLOCKS: BlockNode[] = [
  {
    id: 'block-1',
    page_version_id: 'ver-1',
    parent_id: null,
    type: 'heading',
    props: {
      text: 'Chào mừng quý khách đến với Nhà hàng ABC',
      level: 'h2',
    },
    styles: {
      base: {
        textAlign: 'center',
        color: '#1E1B4B',
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '12px',
      },
      responsive: {
        mobile: {
          fontSize: '24px',
        },
      },
    },
    order_index: 0,
  },
  {
    id: 'block-2',
    page_version_id: 'ver-1',
    parent_id: null,
    type: 'text',
    props: {
      richtext: 'Không gian ẩm thực Việt đẳng cấp với những món ăn đậm đà bản sắc dân tộc và phục vụ tận tâm.',
    },
    styles: {
      base: {
        textAlign: 'center',
        color: '#4B5563',
        fontSize: '16px',
        lineHeight: '1.6',
        maxWidth: '720px',
        margin: '0 auto 24px auto',
      },
    },
    order_index: 1,
  },
  {
    id: 'block-3',
    page_version_id: 'ver-1',
    parent_id: null,
    type: 'button',
    props: {
      label: 'Đặt bàn ngay hôm nay',
      href: '#booking',
    },
    styles: {
      base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        padding: '14px 32px',
        borderRadius: 'var(--global-radius)',
        fontSize: '15px',
        fontWeight: '600',
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.25s ease',
      },
      hover: {
        backgroundColor: 'var(--color-accent)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
      },
      responsive: {
        mobile: {
          width: '100%',
        },
      },
    },
    order_index: 2,
  },
];

let autosaveTimer: any = null;

export function normalizeBlockOrders(blocks: BlockNode[]): BlockNode[] {
  const parentGroups = new Map<string | null, BlockNode[]>();

  for (const b of blocks) {
    const pId = b.parent_id || null;
    if (!parentGroups.has(pId)) {
      parentGroups.set(pId, []);
    }
    parentGroups.get(pId)!.push({ ...b });
  }

  const result: BlockNode[] = [];

  for (const [_, siblings] of parentGroups.entries()) {
    siblings.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    siblings.forEach((b, idx) => {
      b.order_index = idx;
      result.push(b);
    });
  }

  return result;
}

let storeGet: (() => CanvasState) | null = null;
let storeSet: ((state: Partial<CanvasState>) => void) | null = null;

function triggerAutosave(
  _blockId?: string,
  _updatedPayload?: any,
  setFn?: (state: Partial<CanvasState>) => void
) {
  const set = setFn || storeSet;
  if (!set || !storeGet) return;

  set({ autosaveStatus: 'saving', saveStatus: 'saving' });
  if (autosaveTimer) clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(async () => {
    try {
      if (!storeGet) return;
      const { domain, slug, blocks, seoMeta } = storeGet();
      const normalizedBlocks = normalizeBlockOrders(blocks);

      const res = await fetch('http://localhost:4000/v1/public/sync-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          slug,
          status: 'draft',
          seo_meta: seoMeta || {},
          blocks: normalizedBlocks.map((b) => ({
            id: b.id,
            type: b.type,
            parent_id: b.parent_id || null,
            props: b.props,
            styles: b.styles || { base: {} },
            custom_classes: b.custom_classes || [],
            custom_css: b.custom_css || '',
            order_index: b.order_index ?? 0,
          })),
        }),
      });

      if (res.ok) {
        set({ autosaveStatus: 'saved', saveStatus: 'saved' });
      } else {
        set({ autosaveStatus: 'error', saveStatus: 'error' });
      }
    } catch {
      set({ autosaveStatus: 'error', saveStatus: 'error' });
    }
  }, 1200);
}

export const useCanvasStore = create<CanvasState>((set, get) => {
  storeGet = get;
  storeSet = set;
  return {
  pageId: 'page-1',
  siteId: 'site-1',
  slug: 'home',
  domain: 'nhahangabc.local',
  pageStatus: 'draft',
  seoMeta: {},
  activeView: 'canvas',
  setActiveView: (view) => set({ activeView: view }),
  breakpoint: 'desktop',
  selectedBlockId: null,
  activeStyleState: 'base',
  setActiveStyleState: (st) => set({ activeStyleState: st }),
  autosaveStatus: 'saved',
  saveStatus: 'saved',
  blocks: INITIAL_BLOCKS,
  history: [INITIAL_BLOCKS],
  historyIndex: 0,
  customBlocks: [],

  setBreakpoint: (bp) => set({ breakpoint: bp }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  addBlock: (type, parentId = null, insertAfterBlockId = null) => {
    const { blocks, history, historyIndex, selectedBlockId } = get();
    const newId = 'block-' + Date.now();

    let targetParentId = parentId;
    let targetInsertAfter = insertAfterBlockId;

    if (targetParentId === null && targetInsertAfter === null && selectedBlockId) {
      const selected = blocks.find((b) => b.id === selectedBlockId);
      if (selected) {
        if (selected.type === 'section' && type !== 'header' && type !== 'footer') {
          targetParentId = selected.id;
        } else {
          targetParentId = selected.parent_id || null;
          targetInsertAfter = selected.id;
        }
      }
    }

    const defaultProps: Record<string, any> = {};
    const defaultStyles: BlockStyles = { base: {}, hover: {}, responsive: {} };

    if (type === 'header') {
      defaultProps.site_title = 'Nhà hàng Ẩm thực ABC';
      defaultProps.tagline = 'Hương vị truyền thống';
      defaultProps.sticky = true;
      defaultProps.cta_button = { show: true, label: 'Đặt bàn ngay', href: '#booking' };
      defaultProps.nav_links = [
        { label: 'Trang chủ', href: '/' },
        { label: 'Thực đơn', href: '/menu' },
        { label: 'Giới thiệu', href: '/about' },
        { label: 'Liên hệ', href: '/contact' },
      ];
      defaultStyles.base = {
        backgroundColor: '#FFFFFF',
        color: '#1F1E1B',
        paddingTop: '16px',
        paddingBottom: '16px',
        paddingLeft: '24px',
        paddingRight: '24px',
      };
    }
    if (type === 'footer') {
      defaultProps.site_title = 'Nhà hàng Ẩm thực ABC';
      defaultProps.tagline = 'Không gian ẩm thực Việt đẳng cấp với những món ăn đậm đà bản sắc dân tộc.';
      defaultProps.copyright = `© ${new Date().getFullYear()} Nhà hàng Ẩm thực ABC. Tất cả quyền được bảo lưu.`;
      defaultProps.social_links = [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'zalo', url: 'https://zalo.me' },
        { platform: 'youtube', url: 'https://youtube.com' },
      ];
      defaultProps.columns = [
        {
          title: 'Thực đơn nổi bật',
          links: [
            { label: 'Món khai vị', href: '/menu#khai-vi' },
            { label: 'Đặc sản ba miền', href: '/menu#dac-san' },
          ],
        },
        {
          title: 'Liên hệ',
          links: [
            { label: 'Địa chỉ nhà hàng', href: '/contact' },
            { label: 'Hotline: 1900 8888', href: 'tel:19008888' },
          ],
        },
      ];
      defaultStyles.base = {
        backgroundColor: '#18181B',
        color: '#F4F4F5',
        paddingTop: '48px',
        paddingBottom: '48px',
        paddingLeft: '24px',
        paddingRight: '24px',
      };
    }
    if (type === 'heading') {
      defaultProps.text = 'Tiêu đề mới';
      defaultProps.level = 'h2';
      defaultStyles.base = {
        textAlign: 'center',
        color: '#1E1B4B',
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '16px',
      };
    }
    if (type === 'text') {
      defaultProps.richtext = 'Nội dung đoạn văn bản mới...';
      defaultStyles.base = {
        textAlign: 'left',
        color: '#4B5563',
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '16px',
      };
    }
    if (type === 'button') {
      defaultProps.label = 'Bấm vào đây';
      defaultProps.href = '#';
      defaultStyles.base = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        paddingTop: '12px',
        paddingBottom: '12px',
        paddingLeft: '28px',
        paddingRight: '28px',
        borderRadius: 'var(--global-radius)',
        fontWeight: '600',
        textDecoration: 'none',
      };
      defaultStyles.hover = {
        backgroundColor: 'var(--color-accent)',
      };
    }
    if (type === 'image') {
      defaultProps.src =
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80';
      defaultProps.alt = 'Hình ảnh mới';
      defaultStyles.base = {
        width: '100%',
        borderRadius: 'var(--global-radius)',
      };
    }
    if (type === 'section') {
      defaultProps.layout = 'stack';
      defaultStyles.base = {
        paddingTop: '48px',
        paddingBottom: '48px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#FFFFFF',
        width: '100%',
      };
    }
    if (type === 'form') {
      defaultProps.submit_label = 'Gửi thông tin';
      defaultProps.fields = [
        { key: 'name', label: 'Họ và tên', input_type: 'text', required: true },
        { key: 'phone', label: 'Số điện thoại', input_type: 'phone', required: true },
      ];
      defaultStyles.base = {
        paddingTop: '32px',
        paddingBottom: '32px',
        paddingLeft: '24px',
        paddingRight: '24px',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
      };
    }
    if (type === 'video') {
      defaultProps.src =
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      defaultProps.poster =
        'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1000&q=80';
      defaultStyles.base = {
        width: '100%',
        borderRadius: '12px',
      };
    }
    if (type === 'embed') {
      defaultProps.provider = 'youtube';
      defaultProps.embed_id = 'dQw4w9WgXcQ';
      defaultStyles.base = {
        width: '100%',
        borderRadius: '12px',
      };
    }
    if (type === 'icon') {
      defaultProps.icon = 'solar:star-bold';
      defaultProps.size = 36;
      defaultProps.color = 'var(--color-primary, #2F6F4F)';
      defaultProps.align = 'center';
      defaultProps.style_variant = 'bold';
      defaultProps.bg_shape = 'none';
      defaultProps.bg_color = 'rgba(47, 111, 79, 0.1)';
      defaultProps.padding = 12;
      defaultStyles.base = {
        paddingTop: '8px',
        paddingBottom: '8px',
      };
    }

    const siblings = blocks
      .filter((b) => (b.parent_id || null) === targetParentId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const newBlock: BlockNode = {
      id: newId,
      page_version_id: 'ver-1',
      parent_id: targetParentId,
      type: type as any,
      props: defaultProps as any,
      styles: defaultStyles,
      order_index: 0,
    };

    if (type === 'header') {
      siblings.unshift(newBlock);
    } else if (targetInsertAfter) {
      const afterIdx = siblings.findIndex((b) => b.id === targetInsertAfter);
      if (afterIdx !== -1) {
        siblings.splice(afterIdx + 1, 0, newBlock);
      } else {
        siblings.push(newBlock);
      }
    } else if (type === 'footer') {
      siblings.push(newBlock);
    } else {
      if (targetParentId === null) {
        const footerIdx = siblings.findIndex((b) => b.type === 'footer');
        if (footerIdx !== -1) {
          siblings.splice(footerIdx, 0, newBlock);
        } else {
          siblings.push(newBlock);
        }
      } else {
        siblings.push(newBlock);
      }
    }

    siblings.forEach((b, idx) => {
      b.order_index = idx;
    });

    const otherBlocks = blocks.filter((b) => (b.parent_id || null) !== targetParentId);
    const nextBlocks = normalizeBlockOrders([...otherBlocks, ...siblings]);

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      selectedBlockId: newId,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    triggerAutosave(newId, newBlock.props, set);
  },

  updateBlockProp: (id, propKey, value) => {
    const { blocks, history, historyIndex } = get();
    let updatedProps: any = null;

    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        const nextP = { ...(b.props as any), [propKey]: value };
        updatedProps = nextP;
        return { ...b, props: nextP };
      }
      return b;
    }) as BlockNode[];

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    if (updatedProps) {
      triggerAutosave(id, updatedProps, set);
    }
  },

  updateBlockProps: (id, props) => {
    const { blocks, history, historyIndex } = get();
    let updatedProps: any = null;

    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        const nextP = { ...(b.props as any), ...props };
        updatedProps = nextP;
        return { ...b, props: nextP };
      }
      return b;
    }) as BlockNode[];

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    if (updatedProps) {
      triggerAutosave(id, updatedProps, set);
    }
  },

  updateBlockStyles: (id, styles) => {
    const { blocks, history, historyIndex } = get();
    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        const nextStyles: BlockStyles = {
          ...b.styles,
          ...styles,
          base: { ...(b.styles?.base || {}), ...(styles.base || {}) },
          hover: { ...(b.styles?.hover || {}), ...(styles.hover || {}) },
          focus: { ...(b.styles?.focus || {}), ...(styles.focus || {}) },
          responsive: {
            tablet: { ...(b.styles?.responsive?.tablet || {}), ...(styles.responsive?.tablet || {}) },
            mobile: { ...(b.styles?.responsive?.mobile || {}), ...(styles.responsive?.mobile || {}) },
          },
        };
        return { ...b, styles: nextStyles };
      }
      return b;
    }) as BlockNode[];

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    triggerAutosave(id, styles, set);
  },

  updateBlockStyleProp: (id, state, propKey, value) => {
    const { blocks, history, historyIndex } = get();
    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        const currentStyles = b.styles || { base: {}, hover: {}, focus: {}, responsive: {} };
        const targetStateStyles = { ...(currentStyles[state] || {}), [propKey]: value };
        if (value === '' || value === undefined || value === null) {
          delete (targetStateStyles as any)[propKey];
        }

        const nextStyles: BlockStyles = {
          ...currentStyles,
          [state]: targetStateStyles,
        };
        return { ...b, styles: nextStyles };
      }
      return b;
    }) as BlockNode[];

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    triggerAutosave(id, { [propKey]: value }, set);
  },

  updateBlockResponsiveStyleProp: (id, bp, propKey, value) => {
    const { blocks, history, historyIndex } = get();
    const nextBlocks = blocks.map((b) => {
      if (b.id === id) {
        const currentStyles = b.styles || { base: {}, hover: {}, focus: {}, responsive: {} };
        const currentResponsive = currentStyles.responsive || {};
        const targetBpStyles = { ...(currentResponsive[bp] || {}), [propKey]: value };
        if (value === '' || value === undefined || value === null) {
          delete (targetBpStyles as any)[propKey];
        }

        const nextStyles: BlockStyles = {
          ...currentStyles,
          responsive: {
            ...currentResponsive,
            [bp]: targetBpStyles,
          },
        };
        return { ...b, styles: nextStyles };
      }
      return b;
    }) as BlockNode[];

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    triggerAutosave(id, { [propKey]: value }, set);
  },

  deleteBlock: (id) => {
    const { blocks, history, historyIndex, selectedBlockId } = get();
    const nextBlocks = normalizeBlockOrders(
      blocks.filter((b) => b.id !== id && b.parent_id !== id)
    );

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  duplicateBlock: (id) => {
    const { blocks, history, historyIndex } = get();
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const newId = 'block-' + Date.now();
    const duplicatedBlock: BlockNode = {
      ...block,
      id: newId,
      props: JSON.parse(JSON.stringify(block.props)),
      styles: JSON.parse(JSON.stringify(block.styles || { base: {} })),
      order_index: (block.order_index ?? 0) + 1,
    };

    const siblings = blocks
      .filter((b) => (b.parent_id || null) === (block.parent_id || null))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const originIdx = siblings.findIndex((b) => b.id === id);
    if (originIdx !== -1) {
      siblings.splice(originIdx + 1, 0, duplicatedBlock);
    } else {
      siblings.push(duplicatedBlock);
    }

    siblings.forEach((b, idx) => {
      b.order_index = idx;
    });

    const otherBlocks = blocks.filter((b) => (b.parent_id || null) !== (block.parent_id || null));
    const nextBlocks = normalizeBlockOrders([...otherBlocks, ...siblings]);

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      selectedBlockId: newId,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  moveBlock: (id, direction) => {
    const { blocks, history, historyIndex } = get();
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const siblings = blocks
      .filter((b) => (b.parent_id || null) === (block.parent_id || null))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const currentIndex = siblings.findIndex((b) => b.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const temp = siblings[currentIndex];
    siblings[currentIndex] = siblings[targetIndex];
    siblings[targetIndex] = temp;

    siblings.forEach((b, idx) => {
      b.order_index = idx;
    });

    const otherBlocks = blocks.filter((b) => (b.parent_id || null) !== (block.parent_id || null));
    const nextBlocks = normalizeBlockOrders([...otherBlocks, ...siblings]);

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  reorderBlocks: (sourceId, targetId) => {
    const { blocks, history, historyIndex } = get();
    const source = blocks.find((b) => b.id === sourceId);
    const target = blocks.find((b) => b.id === targetId);
    if (!source || !target || source.id === target.id) return;

    const targetParentId = target.parent_id || null;
    const updatedSource = { ...source, parent_id: targetParentId };

    const siblings = blocks
      .filter((b) => b.id !== source.id && (b.parent_id || null) === targetParentId)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const targetIndex = siblings.findIndex((b) => b.id === target.id);
    if (targetIndex === -1) {
      siblings.push(updatedSource);
    } else {
      siblings.splice(targetIndex, 0, updatedSource);
    }

    siblings.forEach((b, idx) => {
      b.order_index = idx;
    });

    const otherBlocks = blocks.filter((b) => b.id !== source.id && (b.parent_id || null) !== targetParentId);
    const nextBlocks = normalizeBlockOrders([...otherBlocks, ...siblings]);

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      selectedBlockId: source.id,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  setBlocks: (newBlocks) => {
    const { history, historyIndex } = get();
    const normalized = newBlocks.map(normalizeBlock);
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(normalized);

    set({
      blocks: normalized,
      selectedBlockId: null,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  appendBlocks: (newBlocks, insertAfterId) => {
    const { blocks, history, historyIndex, selectedBlockId } = get();
    const normalizedNew = newBlocks.map((b, idx) => ({
      ...normalizeBlock(b),
      id: b.id.startsWith('sec-') || b.id.startsWith('custom-') ? b.id : `block-${Date.now()}-${idx}`,
    }));

    const targetId = insertAfterId || selectedBlockId;
    let combined: BlockNode[];
    if (targetId) {
      const idx = blocks.findIndex((b) => b.id === targetId);
      if (idx !== -1) {
        combined = [
          ...blocks.slice(0, idx + 1),
          ...normalizedNew,
          ...blocks.slice(idx + 1),
        ];
      } else {
        combined = [...blocks, ...normalizedNew];
      }
    } else {
      combined = [...blocks, ...normalizedNew];
    }

    const nextBlocks = normalizeBlockOrders(combined);
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextBlocks);

    set({
      blocks: nextBlocks,
      selectedBlockId: normalizedNew[0]?.id || null,
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });
    triggerAutosave();
  },

  loadCustomBlocks: async (siteId: string) => {
    if (!siteId) return;
    try {
      const res = await fetch(`http://localhost:4000/v1/sites/${siteId}/custom-blocks`);
      if (res.ok) {
        const data = await res.json();
        set({ customBlocks: data || [] });
      }
    } catch (err) {
      console.warn('Lỗi khi tải custom blocks của site:', err);
    }
  },

  saveSectionAsCustomBlock: async (sectionBlockId: string, name: string) => {
    const { blocks, siteId } = get();
    if (!siteId) throw new Error('Chưa có thông tin siteId');
    const targetSection = blocks.find((b) => b.id === sectionBlockId);
    if (!targetSection) throw new Error('Không tìm thấy section');

    const childBlocks = blocks.filter((b) => b.parent_id === sectionBlockId);
    const sectionNodes = [targetSection, ...childBlocks];

    const res = await fetch(`http://localhost:4000/v1/sites/${siteId}/custom-blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim() || 'Section Mẫu Mới',
        category: 'custom',
        block_nodes: sectionNodes,
      }),
    });

    if (!res.ok) {
      throw new Error('Lỗi khi lưu custom block vào server');
    }

    const saved = await res.json();
    set((state) => ({ customBlocks: [saved, ...state.customBlocks] }));
    return saved;
  },

  deleteCustomBlock: async (siteId: string, id: string) => {
    const res = await fetch(`http://localhost:4000/v1/sites/${siteId}/custom-blocks/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      set((state) => ({
        customBlocks: state.customBlocks.filter((cb) => cb.id !== id),
      }));
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        blocks: history[prevIndex],
        historyIndex: prevIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        blocks: history[nextIndex],
        historyIndex: nextIndex,
      });
    }
  },

  sitePages: [],
  fetchSitePages: async (siteId) => {
    const targetSiteId = siteId || get().siteId;
    if (!targetSiteId) return;
    try {
      const pagesRes = await apiClient.get<any>(`/sites/${targetSiteId}/pages`);
      const items = Array.isArray(pagesRes) ? pagesRes : pagesRes?.data || [];
      set({ sitePages: items });
    } catch (err) {
      console.warn('Lỗi tải danh sách trang:', err);
    }
  },

  createPageInSite: async (slug: string) => {
    const { siteId, domain, fetchSitePages } = get();
    if (!siteId) return;
    try {
      const newPage = await apiClient.post<any>(`/sites/${siteId}/pages`, { slug });
      await fetchSitePages(siteId);
      await get().loadFromSiteAndPage({ siteId, domain, slug: newPage.slug });
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo trang mới');
    }
  },

  deletePageInSite: async (pageId: string, pageSlug: string) => {
    const { siteId, domain, slug, fetchSitePages } = get();
    if (!siteId) return;
    if (pageSlug === 'home') {
      alert('Không thể xoá trang chủ (Home)');
      return;
    }
    try {
      await apiClient.delete(`/sites/${siteId}/pages/${pageId}`);
      await fetchSitePages(siteId);
      if (slug === pageSlug) {
        await get().loadFromSiteAndPage({ siteId, domain, slug: 'home' });
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá trang');
    }
  },

  setDomain: (domain: string) => set({ domain }),

  submitForReview: async () => {
    const { domain, slug, blocks, seoMeta } = get();
    const normalized = normalizeBlockOrders(blocks);
    set({ autosaveStatus: 'saving', saveStatus: 'saving' });
    const res = await fetch('http://localhost:4000/v1/public/sync-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        slug,
        status: 'in_review',
        seo_meta: seoMeta || {},
        blocks: normalized.map((b) => ({
          id: b.id,
          type: b.type,
          parent_id: b.parent_id || null,
          props: b.props,
          styles: b.styles || { base: {} },
          custom_classes: b.custom_classes || [],
          custom_css: b.custom_css || '',
          order_index: b.order_index ?? 0,
        })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể gửi duyệt bản vẽ');
    }
    set({ pageStatus: 'in_review', autosaveStatus: 'saved', saveStatus: 'saved' });
  },

  approveCurrentVersion: async () => {
    const { domain, slug, blocks, seoMeta } = get();
    const normalized = normalizeBlockOrders(blocks);
    set({ autosaveStatus: 'saving', saveStatus: 'saving' });
    const res = await fetch('http://localhost:4000/v1/public/sync-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        slug,
        status: 'approved',
        seo_meta: seoMeta || {},
        blocks: normalized.map((b) => ({
          id: b.id,
          type: b.type,
          parent_id: b.parent_id || null,
          props: b.props,
          styles: b.styles || { base: {} },
          custom_classes: b.custom_classes || [],
          custom_css: b.custom_css || '',
          order_index: b.order_index ?? 0,
        })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể phê duyệt bản vẽ');
    }
    set({ pageStatus: 'approved', autosaveStatus: 'saved', saveStatus: 'saved' });
  },

  rejectCurrentVersion: async () => {
    const { domain, slug, blocks, seoMeta } = get();
    const normalized = normalizeBlockOrders(blocks);
    set({ autosaveStatus: 'saving', saveStatus: 'saving' });
    const res = await fetch('http://localhost:4000/v1/public/sync-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        slug,
        status: 'draft',
        seo_meta: seoMeta || {},
        blocks: normalized.map((b) => ({
          id: b.id,
          type: b.type,
          parent_id: b.parent_id || null,
          props: b.props,
          styles: b.styles || { base: {} },
          custom_classes: b.custom_classes || [],
          custom_css: b.custom_css || '',
          order_index: b.order_index ?? 0,
        })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Không thể yêu cầu sửa đổi');
    }
    set({ pageStatus: 'draft', autosaveStatus: 'saved', saveStatus: 'saved' });
  },

  updateSeoMeta: async (seo) => {
    const { seoMeta, domain, slug, blocks } = get();
    const mergedSeo = { ...seoMeta, ...seo };
    set({ seoMeta: mergedSeo, autosaveStatus: 'saving', saveStatus: 'saving' });

    const normalizedBlocks = normalizeBlockOrders(blocks);
    try {
      await fetch('http://localhost:4000/v1/public/sync-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          slug,
          status: 'draft',
          seo_meta: mergedSeo,
          blocks: normalizedBlocks.map((b) => ({
            id: b.id,
            type: b.type,
            parent_id: b.parent_id || null,
            props: b.props,
            styles: b.styles || { base: {} },
            custom_classes: b.custom_classes || [],
            custom_css: b.custom_css || '',
            order_index: b.order_index ?? 0,
          })),
        }),
      });
      set({ autosaveStatus: 'saved', saveStatus: 'saved' });
    } catch {
      set({ autosaveStatus: 'error', saveStatus: 'error' });
    }
  },

  publishCanvas: async () => {
    const { domain, slug, blocks, seoMeta } = get();
    const normalizedBlocks = normalizeBlockOrders(blocks);

    set({ autosaveStatus: 'saving', saveStatus: 'saving' });

    const res = await fetch('http://localhost:4000/v1/public/sync-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        slug,
        status: 'published',
        seo_meta: seoMeta || {},
        blocks: normalizedBlocks.map((b) => ({
          id: b.id,
          type: b.type,
          parent_id: b.parent_id || null,
          props: b.props,
          styles: b.styles || { base: {} },
          custom_classes: b.custom_classes || [],
          custom_css: b.custom_css || '',
          order_index: b.order_index ?? 0,
        })),
      }),
    });

    if (!res.ok) {
      set({ autosaveStatus: 'error', saveStatus: 'error' });
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Lỗi xuất bản: HTTP ${res.status}`);
    }

    const data = await res.json();
    set({
      pageStatus: 'published',
      blocks: normalizedBlocks,
      autosaveStatus: 'saved',
      saveStatus: 'saved',
    });
    return data.published_url || `http://localhost:3000/?site=${domain}${slug === 'home' ? '' : '/' + slug}`;
  },

  theme: DEFAULT_THEME,
  updateTheme: async (newTheme: Partial<SiteThemeDTO>) => {
    const { siteId, domain, theme } = get();
    const mergedTheme = { ...theme, ...newTheme };
    set({ theme: mergedTheme });
    applyThemeToDom(mergedTheme);

    try {
      if (siteId) {
        await apiClient.patch(`/sites/${siteId}/theme`, mergedTheme).catch(() => {});
      }
      if (domain) {
        await fetch(`http://localhost:4000/v1/public/theme/${domain}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedTheme),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Cannot persist theme to backend:', err);
    }
  },

  loadInitialData: async () => {
    const { domain, slug, siteId, fetchSitePages } = get();
    fetchSitePages(siteId);
    try {
      let res = await fetch(`http://localhost:4000/v1/public/editor-data/${domain}/${slug}`);
      if (!res.ok) {
        res = await fetch(`http://localhost:4000/v1/public/render/${domain}/${slug}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (data.site?.id) {
          set({ siteId: data.site.id });
          get().loadCustomBlocks(data.site.id);
        } else {
          get().loadCustomBlocks(siteId);
        }
        if (data.site?.theme) {
          set({ theme: data.site.theme });
          applyThemeToDom(data.site.theme);
        }
        if (data.page?.seo_meta) {
          set({ seoMeta: data.page.seo_meta });
        }
        if (data.blocks && data.blocks.length > 0) {
          const normalized = data.blocks.map(normalizeBlock);
          set({
            blocks: normalized,
            history: [normalized],
            historyIndex: 0,
            pageStatus: data.version?.status || data.page?.status || 'published',
          });
        }
      }
    } catch (err) {
      console.warn('Cannot fetch initial page editor data:', err);
    }
  },

  loadFromSiteAndPage: async ({ siteId, domain, slug }) => {
    set({ siteId, domain, slug, selectedBlockId: null, autosaveStatus: 'saved', saveStatus: 'saved' });
    get().loadCustomBlocks(siteId);
    try {
      let res = await fetch(`http://localhost:4000/v1/public/editor-data/${domain}/${slug}`);
      if (!res.ok) {
        res = await fetch(`http://localhost:4000/v1/public/render/${domain}/${slug}`);
      }
      if (res.ok) {
        const data = await res.json();
        if (data.site?.theme) {
          set({ theme: data.site.theme });
          applyThemeToDom(data.site.theme);
        }
        if (data.page?.seo_meta) {
          set({ seoMeta: data.page.seo_meta });
        }
        const initial = data.blocks && data.blocks.length > 0 ? data.blocks.map(normalizeBlock) : INITIAL_BLOCKS;
        set({
          pageId: data.page?.id || 'page-1',
          pageStatus: data.version?.status || data.page?.status || 'draft',
          blocks: initial,
          history: [initial],
          historyIndex: 0,
        });
      } else {
        set({ blocks: INITIAL_BLOCKS, history: [INITIAL_BLOCKS], historyIndex: 0, pageStatus: 'draft' });
      }
    } catch {
      set({ blocks: INITIAL_BLOCKS, history: [INITIAL_BLOCKS], historyIndex: 0, pageStatus: 'draft' });
    }
  },
};
});
