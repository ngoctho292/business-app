import { BlockNode, BlockStyles, BlockStyleProperties } from './blocks.types';

/**
 * Sinh Class name scoped ổn định và duy nhất cho Block
 */
export function getBlockScopedClass(blockId: string): string {
  if (!blockId) return 'tb-b-unknown';
  return `tb-b-${blockId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16)}`;
}

/**
 * Chuyển đổi thuộc tính camelCase sang kebab-case CSS
 */
const CAMEL_TO_KEBAB_MAP: Record<string, string> = {
  backgroundColor: 'background-color',
  backgroundImage: 'background-image',
  backgroundSize: 'background-size',
  backgroundPosition: 'background-position',
  backgroundRepeat: 'background-repeat',
  flexDirection: 'flex-direction',
  alignItems: 'align-items',
  justifyContent: 'justify-content',
  flexWrap: 'flex-wrap',
  gridTemplateColumns: 'grid-template-columns',
  zIndex: 'z-index',
  minWidth: 'min-width',
  maxWidth: 'max-width',
  minHeight: 'min-height',
  maxHeight: 'max-height',
  boxSizing: 'box-sizing',
  marginTop: 'margin-top',
  marginBottom: 'margin-bottom',
  marginLeft: 'margin-left',
  marginRight: 'margin-right',
  paddingTop: 'padding-top',
  paddingBottom: 'padding-bottom',
  paddingLeft: 'padding-left',
  paddingRight: 'padding-right',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  textAlign: 'text-align',
  textDecoration: 'text-decoration',
  textTransform: 'text-transform',
  borderWidth: 'border-width',
  borderStyle: 'border-style',
  borderColor: 'border-color',
  borderRadius: 'border-radius',
  borderTopLeftRadius: 'border-top-left-radius',
  borderTopRightRadius: 'border-top-right-radius',
  borderBottomLeftRadius: 'border-bottom-left-radius',
  borderBottomRightRadius: 'border-bottom-right-radius',
  boxShadow: 'box-shadow',
  aspectRatio: 'aspect-ratio',
  objectFit: 'object-fit',
};


export function camelToKebab(prop: string): string {
  if (CAMEL_TO_KEBAB_MAP[prop]) return CAMEL_TO_KEBAB_MAP[prop];
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Chuyển đổi Object Style thành chuỗi CSS declarations chuẩn
 */
export function styleObjectToCss(styleObj?: Partial<BlockStyleProperties>): string {
  if (!styleObj || typeof styleObj !== 'object') return '';

  const declarations: string[] = [];

  for (const [key, rawValue] of Object.entries(styleObj)) {
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;

    const cssProp = camelToKebab(key);
    let cssValue = String(rawValue).trim();

    // Xử lý background image URL
    if (key === 'backgroundImage' && (cssValue.startsWith('http') || !cssValue.startsWith('url'))) {
      cssValue = `url('${cssValue}')`;
    }

    declarations.push(`${cssProp}: ${cssValue};`);
  }

  return declarations.join(' ');
}

/**
 * Biên dịch styles của 1 Block thành các khối CSS rules
 */
export function compileBlockStyles(block: BlockNode): {
  baseRule: string;
  hoverRule: string;
  focusRule: string;
  activeRule: string;
  tabletRule: string;
  mobileRule: string;
  customCss: string;
} {
  const cls = getBlockScopedClass(block.id);
  const styles: BlockStyles = block.styles || {};

  const baseCss = styleObjectToCss(styles.base);
  const hoverCss = styleObjectToCss(styles.hover);
  const focusCss = styleObjectToCss(styles.focus);
  const activeCss = styleObjectToCss(styles.active);
  const tabletCss = styleObjectToCss(styles.responsive?.tablet);
  const mobileCss = styleObjectToCss(styles.responsive?.mobile);

  return {
    baseRule: baseCss ? `.${cls} { ${baseCss} }` : '',
    hoverRule: hoverCss ? `.${cls}:hover { ${hoverCss} }` : '',
    focusRule: focusCss ? `.${cls}:focus, .${cls}:focus-within { ${focusCss} }` : '',
    activeRule: activeCss ? `.${cls}:active { ${activeCss} }` : '',
    tabletRule: tabletCss ? `.${cls} { ${tabletCss} }` : '',
    mobileRule: mobileCss ? `.${cls} { ${mobileCss} }` : '',
    customCss: block.custom_css ? block.custom_css.replace(/SELECTOR/g, `.${cls}`) : '',
  };
}

/**
 * Biên dịch toàn bộ cây Blocks của Page thành chuỗi CSS hoàn chỉnh + Responsive Media Queries
 */
export function compilePageStyles(
  blocks: BlockNode[],
  options?: {
    theme?: Record<string, any>;
    customSiteCss?: string;
  }
): string {
  if (!blocks || !Array.isArray(blocks)) return '';

  const desktopRules: string[] = [];
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];
  const customRules: string[] = [];

  for (const block of blocks) {
    const compiled = compileBlockStyles(block);

    if (compiled.baseRule) desktopRules.push(compiled.baseRule);
    if (compiled.hoverRule) desktopRules.push(compiled.hoverRule);
    if (compiled.focusRule) desktopRules.push(compiled.focusRule);
    if (compiled.activeRule) desktopRules.push(compiled.activeRule);

    if (compiled.tabletRule) tabletRules.push(compiled.tabletRule);
    if (compiled.mobileRule) mobileRules.push(compiled.mobileRule);
    if (compiled.customCss) customRules.push(compiled.customCss);
  }

  const output: string[] = [];

  // Core Responsive Media Safety Rules
  output.push(`/* --- Core Media Responsive Safety --- */
.tb-image-wrapper {
  max-width: 100% !important;
  box-sizing: border-box;
  overflow: hidden;
}
.tb-image-wrapper .tb-image,
.tb-image {
  max-width: 100% !important;
  height: auto;
  display: block;
  box-sizing: border-box;
}`);

  // 1. Desktop / Base Styles
  if (desktopRules.length > 0) {
    output.push('\n/* --- Base / Desktop Rules --- */');
    output.push(desktopRules.join('\n'));
  }

  // 2. Tablet Overrides (@media max-width: 1024px & Canvas Emulation)
  if (tabletRules.length > 0) {
    output.push('\n/* --- Tablet Overrides (<= 1024px) --- */');
    output.push(`@media screen and (max-width: 1024px) {\n  ${tabletRules.join('\n  ')}\n}`);
    const tabletCanvasRules = tabletRules.map(
      (r) => `[data-breakpoint="tablet"] ${r}\n[data-breakpoint="mobile"] ${r}`
    );
    output.push(tabletCanvasRules.join('\n'));
  }

  // 3. Mobile Overrides (@media max-width: 768px & Canvas Emulation)
  if (mobileRules.length > 0) {
    output.push('\n/* --- Mobile Overrides (<= 768px) --- */');
    output.push(`@media screen and (max-width: 768px) {\n  ${mobileRules.join('\n  ')}\n}`);
    const mobileCanvasRules = mobileRules.map((r) => `[data-breakpoint="mobile"] ${r}`);
    output.push(mobileCanvasRules.join('\n'));
  }

  // 4. Custom Block CSS
  if (customRules.length > 0) {
    output.push('\n/* --- Custom Scoped CSS --- */');
    output.push(customRules.join('\n'));
  }

  // 5. Site Level Custom CSS
  if (options?.customSiteCss) {
    output.push('\n/* --- Site Level Custom CSS --- */');
    output.push(options.customSiteCss);
  }


  return output.join('\n');
}

/**
 * Adapter tự động chuẩn hóa Block sang kiến trúc Style mới
 */
export function normalizeBlock(rawBlock: any): BlockNode {
  if (!rawBlock) {
    return {
      id: `b-${Date.now()}`,
      page_version_id: '',
      parent_id: null,
      type: 'section',
      props: {},
      styles: { base: {} },
      order_index: 0,
    };
  }

  // Nếu block đã có styles chuẩn
  if (rawBlock.styles && typeof rawBlock.styles === 'object') {
    return rawBlock as BlockNode;
  }

  // Chuyển đổi từ định dạng props cũ sang styles mới
  const oldProps = (rawBlock.props || {}) as Record<string, any>;
  const {
    background,
    backgroundColor,
    padding,
    align,
    textAlign,
    text_color,
    color,
    width,
    rounded,
    _responsive,
    ...cleanProps
  } = oldProps;

  const baseStyles: Partial<BlockStyleProperties> = {};
  if (background || backgroundColor) {
    const bg = background || backgroundColor;
    if (String(bg).startsWith('http') || String(bg).startsWith('url')) {
      baseStyles.backgroundImage = bg;
      baseStyles.backgroundSize = 'cover';
      baseStyles.backgroundPosition = 'center';
    } else {
      baseStyles.backgroundColor = bg;
    }
  }

  if (padding) baseStyles.padding = padding;
  if (align || textAlign) baseStyles.textAlign = (align || textAlign) as any;
  if (text_color || color) baseStyles.color = text_color || color;
  if (width) baseStyles.width = width;
  if (rounded) baseStyles.borderRadius = 'var(--global-radius)';

  const responsiveTablet: Partial<BlockStyleProperties> = {};
  if (_responsive?.tablet) {
    const t = _responsive.tablet;
    if (t.padding) responsiveTablet.padding = t.padding;
    if (t.align) responsiveTablet.textAlign = t.align;
    if (t.width) responsiveTablet.width = t.width;
    if (t.background) responsiveTablet.backgroundColor = t.background;
  }

  const responsiveMobile: Partial<BlockStyleProperties> = {};
  if (_responsive?.mobile) {
    const m = _responsive.mobile;
    if (m.padding) responsiveMobile.padding = m.padding;
    if (m.align) responsiveMobile.textAlign = m.align;
    if (m.width) responsiveMobile.width = m.width;
    if (m.background) responsiveMobile.backgroundColor = m.background;
  }

  return {
    ...rawBlock,
    props: cleanProps,
    styles: {
      base: baseStyles,
      hover: {},
      focus: {},
      active: {},
      responsive: {
        tablet: responsiveTablet,
        mobile: responsiveMobile,
      },
    },
  };
}
