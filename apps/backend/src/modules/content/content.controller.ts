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
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { Public, RequireSiteRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';
import {
  ContentTypeDTO,
  ContentTypeInputDTO,
  ContentItemDTO,
  PagedResponse,
  ContentItemStatus,
} from '@t-business/shared-types';

export class CreateContentTypeDto implements ContentTypeInputDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  field_schema: any[];

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;
}

export class UpdateContentTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  field_schema?: any[];

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;
}

export class CreateContentItemDto {
  @IsObject()
  fields: Record<string, unknown>;

  @IsOptional()
  @IsString()
  status?: ContentItemStatus;
}

export class UpdateContentItemDto {
  @IsOptional()
  @IsObject()
  fields?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  status?: ContentItemStatus;
}

const DEFAULT_USER_ID = 'b229a374-19d3-4332-b175-3e1541e4255f'; // khachhang@nhahangabc.vn

@Controller('sites/:siteId')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  // --- Content Types ---

  @Get('content-types')
  @Public()
  async getContentTypes(@Param('siteId') siteId: string): Promise<ContentTypeDTO[]> {
    return this.contentService.getContentTypes(siteId);
  }

  @Post('content-types')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createContentType(
    @Param('siteId') siteId: string,
    @Body() body: CreateContentTypeDto,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<ContentTypeDTO> {
    const userId = user?.id || DEFAULT_USER_ID;
    return this.contentService.createContentType(siteId, body, userId);
  }

  @Patch('content-types/:contentTypeId')
  @Public()
  async updateContentType(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Body() body: UpdateContentTypeDto
  ): Promise<ContentTypeDTO> {
    return this.contentService.updateContentType(siteId, contentTypeId, body);
  }

  @Delete('content-types/:contentTypeId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContentType(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string
  ): Promise<void> {
    await this.contentService.deleteContentType(siteId, contentTypeId);
  }

  // --- Content Items ---

  @Get('content-types/:contentTypeId/items')
  @Public()
  async getContentItems(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: ContentItemStatus
  ): Promise<PagedResponse<ContentItemDTO>> {
    return this.contentService.getContentItems(
      siteId,
      contentTypeId,
      limit ? parseInt(limit, 10) : 50,
      cursor,
      status
    );
  }

  @Post('content-types/:contentTypeId/items')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async createContentItem(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Body() body: CreateContentItemDto,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<ContentItemDTO> {
    const userId = user?.id || DEFAULT_USER_ID;
    const role = user?.siteRole || 'owner';
    return this.contentService.createContentItem(
      siteId,
      contentTypeId,
      body.fields,
      body.status || 'published',
      userId,
      role
    );
  }

  @Get('content-types/:contentTypeId/items/:itemId')
  @Public()
  async getContentItem(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Param('itemId') itemId: string
  ): Promise<ContentItemDTO> {
    return this.contentService.getContentItemById(siteId, contentTypeId, itemId);
  }

  @Patch('content-types/:contentTypeId/items/:itemId')
  @Public()
  async updateContentItem(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateContentItemDto,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<ContentItemDTO> {
    const userId = user?.id || DEFAULT_USER_ID;
    return this.contentService.updateContentItem(
      siteId,
      contentTypeId,
      itemId,
      body.fields,
      body.status,
      userId
    );
  }

  @Delete('content-types/:contentTypeId/items/:itemId')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContentItem(
    @Param('siteId') siteId: string,
    @Param('contentTypeId') contentTypeId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user?: AuthenticatedUser
  ): Promise<void> {
    const userId = user?.id || DEFAULT_USER_ID;
    await this.contentService.deleteContentItem(
      siteId,
      contentTypeId,
      itemId,
      userId
    );
  }
}
