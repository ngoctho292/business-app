import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { db, websiteTemplates, blocks, pageVersions } from '../../db';
import { eq, desc, and } from 'drizzle-orm';
import { BlockNode } from '@t-business/shared-types';

export interface CreateTemplateDto {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  badge?: string;
  features?: string[];
  block_nodes: BlockNode[];
  theme?: Record<string, any>;
  is_system?: boolean;
  is_featured?: boolean;
}

export interface SaveFromPageDto {
  name: string;
  category: string;
  description?: string;
  thumbnail_url?: string;
  badge?: string;
  features?: string[];
  page_version_id?: string;
  block_nodes?: BlockNode[];
  theme?: Record<string, any>;
}

@Injectable()
export class TemplatesService {
  /**
   * Lấy danh sách website templates từ Database
   */
  async list(category?: string) {
    let query = db
      .select()
      .from(websiteTemplates)
      .orderBy(desc(websiteTemplates.is_featured), desc(websiteTemplates.created_at));

    if (category && category !== 'all') {
      return await db
        .select()
        .from(websiteTemplates)
        .where(eq(websiteTemplates.category, category))
        .orderBy(desc(websiteTemplates.is_featured), desc(websiteTemplates.created_at));
    }

    return await query;
  }

  /**
   * Lấy chi tiết 1 template theo ID hoặc slug
   */
  async findOne(idOrSlug: string) {
    const template = await db.query.websiteTemplates.findFirst({
      where: (wt, { or, eq }) => or(eq(wt.id, idOrSlug), eq(wt.slug, idOrSlug)),
    });

    if (!template) {
      throw new NotFoundException(`Không tìm thấy template: ${idOrSlug}`);
    }

    return template;
  }

  /**
   * Tạo một website template mới
   */
  async create(dto: CreateTemplateDto, userId?: string) {
    const slug = dto.slug || this.generateSlug(dto.name);

    // Kiểm tra trùng slug
    const existing = await db.query.websiteTemplates.findFirst({
      where: eq(websiteTemplates.slug, slug),
    });
    if (existing) {
      throw new ConflictException(`Slug template "${slug}" đã tồn tại`);
    }

    const [created] = await db
      .insert(websiteTemplates)
      .values({
        name: dto.name,
        slug: slug,
        category: dto.category || 'general',
        description: dto.description || null,
        thumbnail_url: dto.thumbnail_url || null,
        badge: dto.badge || null,
        features: dto.features || [],
        block_nodes: dto.block_nodes || [],
        theme: dto.theme || {},
        is_system: dto.is_system ?? true,
        is_featured: dto.is_featured ?? false,
        created_by: userId || null,
      })
      .returning();

    return created;
  }

  /**
   * Lưu trang web hiện tại thành Template mới trong Kho Mẫu
   */
  async saveFromPage(dto: SaveFromPageDto, userId?: string) {
    let blockNodes = dto.block_nodes || [];

    // Nếu truyền page_version_id, tự động truy vấn toàn bộ blocks của version đó
    if (dto.page_version_id && blockNodes.length === 0) {
      const pageBlocks = await db
        .select()
        .from(blocks)
        .where(eq(blocks.page_version_id, dto.page_version_id))
        .orderBy(blocks.order_index);

      blockNodes = pageBlocks as any;
    }

    const slug = this.generateSlug(dto.name) + '-' + Date.now().toString(36);

    const [created] = await db
      .insert(websiteTemplates)
      .values({
        name: dto.name,
        slug: slug,
        category: dto.category || 'general',
        description: dto.description || 'Mẫu website được lưu từ trang thiết kế.',
        thumbnail_url: dto.thumbnail_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
        badge: dto.badge || '⭐ Bản Thiết Kế Đẹp',
        features: dto.features || ['Toàn bộ khối trang hiện tại', 'Tối ưu Responsive'],
        block_nodes: blockNodes,
        theme: dto.theme || {},
        is_system: false,
        is_featured: false,
        created_by: userId || null,
      })
      .returning();

    return created;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
