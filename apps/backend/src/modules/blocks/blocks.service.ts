import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { db, blocks } from '../../db';
import { eq, and } from 'drizzle-orm';
import { BlockDTO } from '@t-business/shared-types';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlocksService {
  /**
   * Cập nhật thuộc tính props hoặc vị trí của một block (Granular Patch)
   */
  async updateBlock(
    blockId: string,
    dto: UpdateBlockDto,
    userId?: string
  ): Promise<BlockDTO> {
    const existing = await db.query.blocks.findFirst({
      where: eq(blocks.id, blockId),
    });

    if (!existing) {
      throw new NotFoundException(`Block with ID '${blockId}' not found`);
    }

    // Nếu thay đổi parent_id, kiểm tra chống vòng lặp cha-con (Circular Reference DFS)
    if (dto.parent_id !== undefined && dto.parent_id !== existing.parent_id) {
      if (dto.parent_id === blockId) {
        throw new BadRequestException('A block cannot be its own parent');
      }

      if (dto.parent_id !== null) {
        const isCycle = await this.detectCycle(blockId, dto.parent_id);
        if (isCycle) {
          throw new BadRequestException(
            'Circular reference detected: target parent is a descendant of this block'
          );
        }
      }
    }

    // Merge props JSONB
    const mergedProps = dto.props
      ? { ...(existing.props as Record<string, unknown>), ...dto.props }
      : (existing.props as Record<string, unknown>);

    const [updated] = await db
      .update(blocks)
      .set({
        props: mergedProps,
        parent_id:
          dto.parent_id !== undefined ? dto.parent_id : existing.parent_id,
        order_index:
          dto.order_index !== undefined ? dto.order_index : existing.order_index,
        updated_by: userId || existing.updated_by,
        updated_at: new Date(),
      })
      .where(eq(blocks.id, blockId))
      .returning();

    return {
      id: updated.id,
      page_version_id: updated.page_version_id,
      parent_id: updated.parent_id,
      type: updated.type as any,
      order_index: updated.order_index,
      props: updated.props as any,
      created_at: updated.created_at.toISOString(),
      updated_at: updated.updated_at.toISOString(),
      updated_by: updated.updated_by || undefined,
    };
  }

  /**
   * DFS kiểm tra xem blockId có nằm trong chuỗi tổ tiên của targetParentId hay không
   */
  private async detectCycle(
    blockId: string,
    targetParentId: string
  ): Promise<boolean> {
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === blockId) {
        return true; // Phát hiện chu trình lặp!
      }

      if (visited.has(currentId)) {
        return true;
      }
      visited.add(currentId);

      const parentNode = await db.query.blocks.findFirst({
        where: eq(blocks.id, currentId),
      });

      if (!parentNode || !parentNode.parent_id) {
        break;
      }

      currentId = parentNode.parent_id;
    }

    return false;
  }
}
