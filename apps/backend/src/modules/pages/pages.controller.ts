import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequireSiteRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  PageDTO,
  PageVersionDTO,
  PagedResponse,
  PageStatus,
  VersionStatus,
} from '@t-business/shared-types';

import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsOptional()
  @IsObject()
  seo_meta?: Record<string, unknown>;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsObject()
  seo_meta?: Record<string, unknown>;
}

export class CreateVersionDto {
  @IsOptional()
  @IsString()
  status?: VersionStatus;

  @IsOptional()
  @IsArray()
  blocks?: any[];
}

export class ApproveVersionDto {
  @IsOptional()
  @IsObject()
  review_notes?: Record<string, unknown>;
}

@Controller('sites/:siteId/pages')
@UseGuards(JwtAuthGuard, RbacGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @RequireSiteRoles('viewer')
  async getPages(
    @Param('siteId') siteId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: PageStatus
  ): Promise<PagedResponse<PageDTO>> {
    return this.pagesService.getPages(
      siteId,
      limit ? parseInt(limit, 10) : 20,
      cursor,
      status
    );
  }

  @Post()
  @RequireSiteRoles('designer')
  @HttpCode(HttpStatus.CREATED)
  async createPage(
    @Param('siteId') siteId: string,
    @Body() body: CreatePageDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageDTO> {
    return this.pagesService.createPage(
      siteId,
      body.slug,
      body.seo_meta,
      user.id
    );
  }

  @Get(':pageId')
  @RequireSiteRoles('viewer')
  async getPage(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string
  ): Promise<PageDTO> {
    return this.pagesService.getPageById(siteId, pageId);
  }

  @Patch(':pageId')
  @RequireSiteRoles('designer')
  async updatePage(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Body() body: UpdatePageDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageDTO> {
    return this.pagesService.updatePage(
      siteId,
      pageId,
      body.slug,
      body.seo_meta,
      user.id
    );
  }

  @Delete(':pageId')
  @RequireSiteRoles('designer')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePage(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.pagesService.deletePage(siteId, pageId, user.id);
  }

  // --- Versioning Routes ---

  @Get(':pageId/versions')
  @RequireSiteRoles('viewer')
  async getVersions(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ): Promise<PagedResponse<PageVersionDTO>> {
    return this.pagesService.getVersions(
      siteId,
      pageId,
      limit ? parseInt(limit, 10) : 20,
      cursor
    );
  }

  @Post(':pageId/versions')
  @RequireSiteRoles('designer')
  @HttpCode(HttpStatus.CREATED)
  async createVersion(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Body() body: CreateVersionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageVersionDTO> {
    return this.pagesService.createVersion(
      siteId,
      pageId,
      body.status || 'draft',
      body.blocks || [],
      user.id
    );
  }

  @Post(':pageId/versions/:versionId/approve')
  @RequireSiteRoles('owner')
  async approveVersion(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Param('versionId') versionId: string,
    @Body() body: ApproveVersionDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<PageVersionDTO> {
    return this.pagesService.approveVersion(
      siteId,
      pageId,
      versionId,
      body.review_notes,
      user.id,
      user.role === 'platform_admin'
    );
  }

  @Post(':pageId/versions/:versionId/publish')
  @RequireSiteRoles('designer')
  async publishVersion(
    @Param('siteId') siteId: string,
    @Param('pageId') pageId: string,
    @Param('versionId') versionId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ published_url: string }> {
    return this.pagesService.publishVersion(
      siteId,
      pageId,
      versionId,
      user.id
    );
  }
}
