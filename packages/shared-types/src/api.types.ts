/**
 * API Specification TypeScript Interfaces — Synchronized with 02-api-specification.yaml v0.2
 */

// ============================================================================
// Enums & Literals
// ============================================================================

export type PlatformRole = 'platform_admin' | 'user';
export type SiteRole = 'owner' | 'designer' | 'editor' | 'viewer';
export type PageStatus = 'draft' | 'in_review' | 'approved' | 'published';
export type VersionStatus = 'draft' | 'in_review' | 'approved' | 'published';
export type ContentItemStatus = 'draft' | 'published' | 'archived';
export type FieldType = 'text' | 'richtext' | 'number' | 'boolean' | 'date' | 'image' | 'reference';
export type MediaType = 'image' | 'video' | 'document';

// ============================================================================
// Core Entities & DTOs
// ============================================================================

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: PlatformRole;
  created_at: string;
  updated_at: string;
}

export interface SiteThemeDTO {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontHeading?: string;
  fontBody?: string;
  borderRadius?: string;
}

export interface SiteDTO {
  id: string;
  name: string;
  domain: string;
  custom_domain?: string | null;
  verification_token?: string | null;
  domain_verified: boolean;
  domain_verified_at: string | null;
  theme?: SiteThemeDTO;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionDTO {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'business';
  status: 'active' | 'expired' | 'canceled';
  billing_cycle: 'monthly' | 'yearly';
  expires_at: string | null;
  created_at: string;
}

export interface OrderDTO {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  payment_method: 'vietqr' | 'momo' | 'vnpay';
  status: 'pending' | 'completed' | 'failed';
  order_code: string;
  qr_url?: string;
  created_at: string;
  completed_at?: string | null;
}

export interface PlanFeatureDTO {
  name: string;
  included: boolean;
}

export interface PlanDTO {
  id: 'free' | 'pro' | 'business';
  name: string;
  priceMonthly: number;
  priceYearly: number;
  badge?: string;
  description: string;
  features: string[];
  maxSites: number;
  maxPages: number;
  maxStorageMb: number;
  customDomain: boolean;
  aiGenerations: number;
}


export interface FormSubmissionDTO {
  id: string;
  site_id: string;
  page_slug: string;
  form_title: string;
  payload: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface SiteUserDTO {
  id: string;
  site_id: string;
  user_id: string;
  role: SiteRole;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  created_at: string;
}


export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  og_image?: string;
  canonical_url?: string;
  [key: string]: unknown;
}

export interface PageDTO {
  id: string;
  site_id: string;
  current_version_id: string | null;
  slug: string;
  status: PageStatus;
  seo_meta: SeoMeta;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface CreatePageRequest {
  slug: string;
  seo_meta?: SeoMeta;
}

export interface UpdatePageRequest {
  slug?: string;
  seo_meta?: SeoMeta;
}

export interface CreateVersionRequest {
  notes?: string;
}

export interface ApproveVersionRequest {
  approved: boolean;
  notes?: string;
}

export interface PageVersionDTO {
  id: string;
  page_id: string;
  version_number: number;
  status: VersionStatus;
  submitted_by: string | null;
  approved_by: string | null;
  review_notes: Record<string, unknown> | null;
  created_at: string;
  created_by?: string | null;
  blocks?: BlockDTO[];
}

export interface BlockDTO {
  id: string;
  page_version_id: string;
  parent_id: string | null;
  type: string;
  props: Record<string, unknown>;
  order_index: number;
  created_at?: string;
  updated_at?: string;
  updated_by?: string | null;
}

export interface ContentTypeFieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export type ContentFieldSchema = ContentTypeFieldDefinition;

export interface ContentTypeInputDTO {
  name: string;
  requires_approval?: boolean;
  field_schema: ContentTypeFieldDefinition[];
}

export interface ContentTypeDTO extends ContentTypeInputDTO {
  id: string;
  site_id: string;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface ContentItemDTO {
  id: string;
  content_type_id: string;
  site_id: string;
  fields: Record<string, unknown>;
  status: ContentItemStatus;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface MediaAssetDTO {
  id: string;
  site_id: string;
  url: string;
  type: MediaType;
  mime_type: string;
  file_size: number;
  filename: string;
  created_at: string;
  created_by?: string | null;
  deleted_at?: string | null;
}

// ============================================================================
// Auth & Token DTOs
// ============================================================================

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserDTO;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
}

// ============================================================================
// Common Pagination & Error Responses
// ============================================================================

export interface CursorPaginationParams {
  limit?: number;
  cursor?: string;
}

export interface CursorPagedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
  total?: number;
}

export interface PagedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
  total?: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  request_id?: string;
}

// ============================================================================
// Media Upload
// ============================================================================

export interface PresignedUploadRequest {
  filename: string;
  mime_type: string;
  file_size: number;
}

export interface PresignedUploadResponse {
  upload_url: string;
  asset_id: string;
}

// ============================================================================
// AI Layer DTOs (ADR-002)
// ============================================================================

export interface AISuggestSeoMetaRequest {
  page_content: string;
  language?: string;
}

export interface AISuggestSeoMetaResponse {
  meta_description: string;
  title_suggestion: string;
}

export interface AISuggestExcerptRequest {
  body: string;
  language?: string;
}

export interface AISuggestExcerptResponse {
  excerpt: string;
}
