import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common';
import { PagesService } from './pages.service';
import { IsArray, IsOptional, IsString, IsObject } from 'class-validator';

export class SyncBlocksDto {
  @IsOptional()
  @IsString()
  site_id?: string;

  @IsOptional()
  @IsString()
  page_id?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'in_review' | 'approved' | 'published';

  @IsOptional()
  @IsObject()
  seo_meta?: Record<string, any>;

  @IsArray()
  @IsOptional()
  blocks: any[];
}

@Controller('public')
export class PublicRenderController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('render/:domain')
  async renderHomePage(
    @Param('domain') domain: string,
    @Query('slug') querySlug?: string
  ) {
    return this.pagesService.getPublicPageRender(domain, querySlug || 'home');
  }

  @Get('render/:domain/:slug')
  async renderPage(
    @Param('domain') domain: string,
    @Param('slug') slug: string
  ) {
    return this.pagesService.getPublicPageRender(domain, slug);
  }

  /**
   * Trích xuất dữ liệu phiên bản mới nhất (bao gồm draft) phục vụ Editor Canvas
   * GET /v1/public/editor-data/:domain/:slug
   */
  @Get('editor-data/:domain')
  async getEditorDataHome(
    @Param('domain') domain: string,
    @Query('slug') querySlug?: string
  ) {
    return this.pagesService.getEditorPageData(domain, querySlug || 'home');
  }

  @Get('editor-data/:domain/:slug')
  async getEditorData(
    @Param('domain') domain: string,
    @Param('slug') slug: string
  ) {
    return this.pagesService.getEditorPageData(domain, slug);
  }

  /**
   * Cập nhật Theme toàn site theo domain (phục vụ ThemeModal)
   * PATCH /v1/public/theme/:domain
   */
  @Patch('theme/:domain')
  async updateThemeByDomain(
    @Param('domain') domain: string,
    @Body() body: Record<string, any>
  ) {
    return this.pagesService.updateSiteThemeByDomain(domain, body);
  }

  /**
   * Trả về danh sách slug các trang đã published của 1 domain.
   * Dùng cho sitemap.xml generation phía renderer.
   * GET /v1/public/pages/:domain
   */
  @Get('pages/:domain')
  async getPublishedPages(@Param('domain') domain: string) {
    return this.pagesService.getPublishedPageSlugs(domain);
  }

  @Post('sync-blocks')
  async syncAndPublish(@Body() body: SyncBlocksDto) {
    return this.pagesService.syncCanvasBlocks(
      body.domain || 'nhahangabc.local',
      body.slug || 'home',
      body.blocks || [],
      body.status || 'published',
      undefined,
      body.seo_meta
    );
  }
}
