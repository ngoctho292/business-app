import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  TemplatesService,
  CreateTemplateDto,
  SaveFromPageDto,
} from './templates.service';
import { Public } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * Lấy danh sách website templates từ Database
   * Hỗ trợ lọc theo category: ?category=technology | food_beverage | all
   */
  @Public()
  @Get()
  async list(@Query('category') category?: string) {
    return await this.templatesService.list(category);
  }

  /**
   * Lấy chi tiết 1 template
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.templatesService.findOne(id);
  }

  /**
   * Tạo template mới (Dành cho Admin / Designer)
   */
  @Public()
  @Post()
  async create(
    @Body() body: CreateTemplateDto,
    @CurrentUser('id') userId?: string
  ) {
    return await this.templatesService.create(body, userId);
  }

  /**
   * Lưu trang web hiện tại thành Template mẫu trong Kho Mẫu
   */
  @Public()
  @Post('save-from-page')
  async saveFromPage(
    @Body() body: SaveFromPageDto,
    @CurrentUser('id') userId?: string
  ) {
    return await this.templatesService.saveFromPage(body, userId);
  }
}
