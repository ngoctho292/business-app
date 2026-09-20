/**
 * Block Schema & Styling Types — Professional Page Builder CSS Architecture
 */

// ============================================================================
// 1. Breakpoints & Responsive
// ============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// ============================================================================
// 2. Block Style Properties (CSS Style Schema)
// ============================================================================

export type DisplayValue = 'block' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';
export type FlexDirectionValue = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type AlignItemsValue = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
export type JustifyContentValue = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
export type TextAlignValue = 'left' | 'center' | 'right' | 'justify';
export type PositionValue = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
export type OverflowValue = 'visible' | 'hidden' | 'scroll' | 'auto';

export interface BlockStyleProperties {
  // Layout & Positioning
  display?: DisplayValue | string;
  flexDirection?: FlexDirectionValue | string;
  alignItems?: AlignItemsValue | string;
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch' | string;
  justifyContent?: JustifyContentValue | string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse' | string;
  gap?: string;
  gridTemplateColumns?: string;
  position?: PositionValue | string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  zIndex?: number | string;
  overflow?: OverflowValue | string;

  // Sizing & Box Model
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down' | string;
  boxSizing?: 'border-box' | 'content-box' | string;


  // Spacing (Margin & Padding)
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string;
  textAlign?: TextAlignValue | string;
  color?: string;
  textDecoration?: string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | string;

  // Backgrounds
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto' | string;
  backgroundPosition?: string;
  backgroundRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y' | string;

  // Borders & Radius
  border?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | string;
  borderColor?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;

  // Effects & Transitions
  boxShadow?: string;
  opacity?: number | string;
  cursor?: string;
  transform?: string;
  transition?: string;
}

export interface BlockStyles {
  base?: BlockStyleProperties;
  hover?: Partial<BlockStyleProperties>;
  focus?: Partial<BlockStyleProperties>;
  active?: Partial<BlockStyleProperties>;
  responsive?: {
    tablet?: Partial<BlockStyleProperties>;
    mobile?: Partial<BlockStyleProperties>;
  };
}

// ============================================================================
// 3. Block Content Props Definitions (Content Data Only)
// ============================================================================

export interface HeadingBlockProps {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface TextBlockProps {
  richtext: string;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
}

export interface ButtonBlockProps {
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface ContainerBlockProps {
  tag?: 'div' | 'article' | 'aside';
}

export interface SectionBlockProps {
  layout?: 'stack' | 'grid-2' | 'grid-3' | 'grid-4' | 'split-left' | 'split-right' | 'row' | 'grid';
  gap?: 'none' | 'sm' | 'md' | 'lg' | string;
  tag?: 'section' | 'div' | 'header' | 'footer' | 'main';
}

export interface DividerBlockProps {
  thickness?: string;
}

export interface CollectionListItemTemplate {
  title_field?: string;
  image_field?: string;
  excerpt_field?: string;
}

export interface CollectionListBlockProps {
  content_type_id: string;
  limit?: number;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'desc' | 'asc';
  layout?: 'grid' | 'list' | 'carousel';
  item_template?: CollectionListItemTemplate;
}

export interface FormFieldDefinition {
  key: string;
  label: string;
  input_type: 'text' | 'email' | 'phone' | 'textarea';
  required?: boolean;
}

export interface FormBlockProps {
  fields: FormFieldDefinition[];
  submit_label?: string;
  webhook_id?: string;
  success_message?: string;
}

export interface VideoBlockProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

export interface EmbedBlockProps {
  provider: 'youtube' | 'google_maps' | 'facebook_video';
  embed_id: string;
  caption?: string;
}

export interface IconBlockProps {
  icon: string;
  size?: number;
  color?: string;
  style_variant?: 'bold' | 'linear' | 'broken' | 'bold-duotone' | 'line-duotone' | 'outline';
  href?: string;
  align?: 'left' | 'center' | 'right';
  bg_shape?: 'none' | 'circle' | 'square' | 'rounded';
  bg_color?: string;
  padding?: number;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface HeaderBlockProps {
  logo_src?: string;
  logo_alt?: string;
  site_title?: string;
  tagline?: string;
  nav_links?: NavLink[];
  sticky?: boolean;
  cta_button?: {
    show?: boolean;
    label?: string;
    href?: string;
  };
}

export interface SocialLink {
  platform: 'facebook' | 'youtube' | 'zalo' | 'tiktok' | 'instagram' | 'phone' | 'email';
  url: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface FooterBlockProps {
  logo_src?: string;
  logo_alt?: string;
  site_title?: string;
  tagline?: string;
  copyright?: string;
  columns?: FooterColumn[];
  social_links?: SocialLink[];
}

// ============================================================================
// 4. Block Mapping & Node Model
// ============================================================================

export type BlockType =
  | 'header'
  | 'footer'
  | 'heading'
  | 'text'
  | 'image'
  | 'button'
  | 'section'
  | 'container'
  | 'divider'
  | 'collection_list'
  | 'form'
  | 'video'
  | 'embed'
  | 'icon';

export interface BlockPropsMap {
  header: HeaderBlockProps;
  footer: FooterBlockProps;
  heading: HeadingBlockProps;
  text: TextBlockProps;
  image: ImageBlockProps;
  button: ButtonBlockProps;
  section: SectionBlockProps;
  container: ContainerBlockProps;
  divider: DividerBlockProps;
  collection_list: CollectionListBlockProps;
  form: FormBlockProps;
  video: VideoBlockProps;
  embed: EmbedBlockProps;
  icon: IconBlockProps;
}

export interface BaseBlockNode<T extends BlockType = BlockType> {
  id: string;
  page_version_id: string;
  parent_id: string | null;
  type: T;
  props: BlockPropsMap[T];
  styles?: BlockStyles;
  custom_classes?: string[];
  custom_css?: string;
  order_index: number;
  children?: BaseBlockNode[];
}

export type BlockNode =
  | BaseBlockNode<'header'>
  | BaseBlockNode<'footer'>
  | BaseBlockNode<'heading'>
  | BaseBlockNode<'text'>
  | BaseBlockNode<'image'>
  | BaseBlockNode<'button'>
  | BaseBlockNode<'section'>
  | BaseBlockNode<'container'>
  | BaseBlockNode<'divider'>
  | BaseBlockNode<'collection_list'>
  | BaseBlockNode<'form'>
  | BaseBlockNode<'video'>
  | BaseBlockNode<'embed'>
  | BaseBlockNode<'icon'>;
