import { BlockNode } from '@t-business/shared-types';

export interface WebsiteTemplate {
  id: string;
  name: string;
  slug?: string;
  category: string;
  description: string;
  thumbnail?: string;
  thumbnail_url?: string;
  badge?: string;
  features?: string[];
  blocks?: BlockNode[];
  block_nodes?: BlockNode[];
  theme?: Record<string, any>;
  is_system?: boolean;
  is_featured?: boolean;
}
