import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { db, contentTypes, contentItems } from '../../db';
import { eq, and, isNull, desc, lt } from 'drizzle-orm';
import {
  ContentTypeDTO,
  ContentTypeInputDTO,
  ContentItemDTO,
  PagedResponse,
  ContentItemStatus,
} from '@t-business/shared-types';

@Injectable()
export class ContentService {
  // ==========================================================================
  // Content Types
  // ==========================================================================

  async getContentTypes(siteId: string): Promise<ContentTypeDTO[]> {
    const records = await db.query.contentTypes.findMany({
      where: eq(contentTypes.site_id, siteId),
      orderBy: [desc(contentTypes.created_at)],
    });

    return records.map(this.mapTypeToDto);
  }

  async createContentType(
    siteId: string,
    payload: ContentTypeInputDTO,
    userId: string
  ): Promise<ContentTypeDTO> {
    const [newType] = await db
      .insert(contentTypes)
      .values({
        site_id: siteId,
        name: payload.name,
        field_schema: payload.field_schema as any,
        requires_approval: payload.requires_approval || false,
        created_by: userId,
      })
      .returning();

    return this.mapTypeToDto(newType);
  }

  async updateContentType(
    siteId: string,
    contentTypeId: string,
    payload: Partial<ContentTypeInputDTO>
  ): Promise<ContentTypeDTO> {
    const updateData: Partial<typeof contentTypes.$inferInsert> = {
      updated_at: new Date(),
    };

    if (payload.name) updateData.name = payload.name;
    if (payload.field_schema) updateData.field_schema = payload.field_schema as any;
    if (payload.requires_approval !== undefined)
      updateData.requires_approval = payload.requires_approval;

    const [updated] = await db
      .update(contentTypes)
      .set(updateData)
      .where(
        and(eq(contentTypes.id, contentTypeId), eq(contentTypes.site_id, siteId))
      )
      .returning();

    if (!updated) {
      throw new NotFoundException('Không tìm thấy loại nội dung (Content Type)');
    }

    return this.mapTypeToDto(updated);
  }

  async deleteContentType(siteId: string, contentTypeId: string): Promise<void> {
    await db
      .delete(contentTypes)
      .where(
        and(eq(contentTypes.id, contentTypeId), eq(contentTypes.site_id, siteId))
      );
  }

  // ==========================================================================
  // Content Items (Multi-tenant isolated & Paginated)
  // ==========================================================================

  async getContentItems(
    siteId: string,
    contentTypeId: string,
    limit = 20,
    cursor?: string,
    status?: ContentItemStatus
  ): Promise<PagedResponse<ContentItemDTO>> {
    const take = Math.min(Math.max(1, limit), 100);

    const conditions = [
      eq(contentItems.site_id, siteId),
      eq(contentItems.content_type_id, contentTypeId),
      isNull(contentItems.deleted_at),
    ];

    if (status) {
      conditions.push(eq(contentItems.status, status));
    }

    if (cursor) {
      const cursorDate = new Date(cursor);
      conditions.push(lt(contentItems.created_at, cursorDate));
    }

    const records = await db.query.contentItems.findMany({
      where: and(...conditions),
      orderBy: [desc(contentItems.created_at)],
      limit: take + 1,
    });

    const hasMore = records.length > take;
    const dataItems = hasMore ? records.slice(0, take) : records;
    const nextCursor =
      hasMore && dataItems.length > 0
        ? dataItems[dataItems.length - 1].created_at.toISOString()
        : null;

    return {
      data: dataItems.map(this.mapItemToDto),
      next_cursor: nextCursor,
      has_more: hasMore,
    };
  }

  async getContentItemById(
    siteId: string,
    contentTypeId: string,
    itemId: string
  ): Promise<ContentItemDTO> {
    const item = await db.query.contentItems.findFirst({
      where: and(
        eq(contentItems.id, itemId),
        eq(contentItems.content_type_id, contentTypeId),
        eq(contentItems.site_id, siteId),
        isNull(contentItems.deleted_at)
      ),
    });

    if (!item) {
      throw new NotFoundException('Không tìm thấy nội dung');
    }

    return this.mapItemToDto(item);
  }

  async createContentItem(
    siteId: string,
    contentTypeId: string,
    fields: Record<string, unknown>,
    status: ContentItemStatus = 'draft',
    userId: string,
    userRole: string
  ): Promise<ContentItemDTO> {
    const cType = await db.query.contentTypes.findFirst({
      where: and(eq(contentTypes.id, contentTypeId), eq(contentTypes.site_id, siteId)),
    });

    if (!cType) {
      throw new NotFoundException('Loại nội dung không tồn tại');
    }

    // Check requires_approval rule for editor role
    let finalStatus = status;
    if (cType.requires_approval && userRole === 'editor' && status === 'published') {
      finalStatus = 'draft'; // Enforce draft when approval is required
    }

    const [newItem] = await db
      .insert(contentItems)
      .values({
        content_type_id: contentTypeId,
        site_id: siteId,
        fields: fields || {},
        status: finalStatus,
        created_by: userId,
        updated_by: userId,
      })
      .returning();

    return this.mapItemToDto(newItem);
  }

  async updateContentItem(
    siteId: string,
    contentTypeId: string,
    itemId: string,
    fields?: Record<string, unknown>,
    status?: ContentItemStatus,
    userId?: string
  ): Promise<ContentItemDTO> {
    await this.getContentItemById(siteId, contentTypeId, itemId);

    const updateData: Partial<typeof contentItems.$inferInsert> = {
      updated_at: new Date(),
    };

    if (fields !== undefined) updateData.fields = fields;
    if (status !== undefined) updateData.status = status;
    if (userId) updateData.updated_by = userId;

    const [updated] = await db
      .update(contentItems)
      .set(updateData)
      .where(
        and(
          eq(contentItems.id, itemId),
          eq(contentItems.content_type_id, contentTypeId),
          eq(contentItems.site_id, siteId)
        )
      )
      .returning();

    return this.mapItemToDto(updated);
  }

  async deleteContentItem(
    siteId: string,
    contentTypeId: string,
    itemId: string,
    userId: string
  ): Promise<void> {
    await this.getContentItemById(siteId, contentTypeId, itemId);

    await db
      .update(contentItems)
      .set({
        deleted_at: new Date(),
        updated_by: userId,
      })
      .where(
        and(
          eq(contentItems.id, itemId),
          eq(contentItems.content_type_id, contentTypeId),
          eq(contentItems.site_id, siteId)
        )
      );
  }

  private mapTypeToDto(t: any): ContentTypeDTO {
    return {
      id: t.id,
      site_id: t.site_id,
      name: t.name,
      field_schema: t.field_schema || [],
      requires_approval: t.requires_approval,
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString(),
      created_by: t.created_by || null,
    };
  }

  private mapItemToDto(i: any): ContentItemDTO {
    return {
      id: i.id,
      content_type_id: i.content_type_id,
      site_id: i.site_id,
      fields: i.fields || {},
      status: i.status,
      created_at: i.created_at.toISOString(),
      updated_at: i.updated_at.toISOString(),
      created_by: i.created_by || null,
      updated_by: i.updated_by || null,
      deleted_at: i.deleted_at ? i.deleted_at.toISOString() : null,
    };
  }
}
