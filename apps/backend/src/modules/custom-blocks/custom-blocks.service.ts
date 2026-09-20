import { Injectable, NotFoundException } from '@nestjs/common';
import { db, customBlocks } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { BlockNode } from '@t-business/shared-types';

export interface CreateCustomBlockDto {
  name: string;
  category?: string;
  thumbnail_url?: string;
  block_nodes: BlockNode[];
}

@Injectable()
export class CustomBlocksService {
  /**
   * Danh sách custom blocks thuộc về riêng site_id (Multi-tenant isolated)
   */
  async listBySite(siteId: string) {
    return await db
      .select()
      .from(customBlocks)
      .where(eq(customBlocks.site_id, siteId))
      .orderBy(desc(customBlocks.created_at));
  }

  /**
   * Lưu một block/section tự thiết kế hoặc AI sinh vào thư viện của site
   */
  async create(siteId: string, dto: CreateCustomBlockDto, userId?: string) {
    const [created] = await db
      .insert(customBlocks)
      .values({
        site_id: siteId,
        name: dto.name || 'Khối Tùy Chỉnh',
        category: dto.category || 'custom',
        thumbnail_url: dto.thumbnail_url || null,
        block_nodes: dto.block_nodes || [],
        created_by: userId || null,
      })
      .returning();

    return created;
  }

  /**
   * Xóa custom block khỏi thư viện của site
   */
  async delete(siteId: string, id: string) {
    const res = await db
      .delete(customBlocks)
      .where(and(eq(customBlocks.id, id), eq(customBlocks.site_id, siteId)))
      .returning();

    if (res.length === 0) {
      throw new NotFoundException('Không tìm thấy custom block hoặc không có quyền xóa');
    }

    return { success: true, id };
  }
}
