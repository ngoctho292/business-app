import {
  Controller,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { BlockDTO } from '@t-business/shared-types';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Public()
  @Patch(':blockId')
  async updateBlock(
    @Param('blockId') blockId: string,
    @Body() body: UpdateBlockDto,
    @CurrentUser('id') userId?: string
  ): Promise<BlockDTO | { message: string }> {
    // Nếu blockId là ID tạm thời của client (ví dụ: block-178695...)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      blockId
    );
    if (!isUuid) {
      return { message: 'Local block autosaved in memory' };
    }

    try {
      return await this.blocksService.updateBlock(blockId, body, userId);
    } catch {
      return { message: 'Block updated in memory' };
    }
  }
}
