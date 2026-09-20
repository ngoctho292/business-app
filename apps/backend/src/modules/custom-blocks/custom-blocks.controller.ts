import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CustomBlocksService, CreateCustomBlockDto } from './custom-blocks.service';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('sites/:siteId/custom-blocks')
export class CustomBlocksController {
  constructor(private readonly customBlocksService: CustomBlocksService) {}

  /**
   * Lấy danh sách block tự thiết kế của riêng site_id này
   */
  @Public()
  @Get()
  async list(@Param('siteId') siteId: string) {
    return await this.customBlocksService.listBySite(siteId);
  }

  /**
   * Lưu block/section tự thiết kế vào thư viện của site_id này
   */
  @Public()
  @Post()
  async create(
    @Param('siteId') siteId: string,
    @Body() body: CreateCustomBlockDto,
    @CurrentUser('id') userId?: string
  ) {
    return await this.customBlocksService.create(siteId, body, userId);
  }

  /**
   * Xóa block tự thiết kế khỏi thư viện của site_id này
   */
  @Public()
  @Delete(':id')
  async remove(
    @Param('siteId') siteId: string,
    @Param('id') id: string
  ) {
    return await this.customBlocksService.delete(siteId, id);
  }
}
