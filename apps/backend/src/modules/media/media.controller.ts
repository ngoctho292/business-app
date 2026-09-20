import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequireSiteRoles } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import {
  MediaAssetDTO,
  PagedResponse,
  PresignedUploadRequest,
  PresignedUploadResponse,
} from '@t-business/shared-types';

export class ConfirmUploadDto {
  filename?: string;
  mime_type?: string;
  file_size?: number;
  mimeType?: string;
  fileSize?: number;
  fileName?: string;
}

@Controller('sites/:siteId/media')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @RequireSiteRoles('viewer')
  async getMediaAssets(
    @Param('siteId') siteId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string
  ): Promise<PagedResponse<MediaAssetDTO>> {
    return this.mediaService.getMediaAssets(
      siteId,
      limit ? parseInt(limit, 10) : 20,
      cursor
    );
  }

  @Post()
  @RequireSiteRoles('editor')
  async createPresignedUpload(
    @Param('siteId') siteId: string,
    @Body() body: any
  ): Promise<PresignedUploadResponse> {
    const filename = body?.filename || body?.fileName || 'uploaded-file.jpg';
    const mimeType = body?.mime_type || body?.mimeType || 'image/jpeg';
    const fileSize = Number(body?.file_size || body?.fileSize || 0);

    return this.mediaService.createPresignedUpload(
      siteId,
      filename,
      mimeType,
      fileSize
    );
  }

  @Post(':assetId/confirm')
  @RequireSiteRoles('editor')
  async confirmUpload(
    @Param('siteId') siteId: string,
    @Param('assetId') assetId: string,
    @Body() body: ConfirmUploadDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<MediaAssetDTO> {
    const filename = body?.filename || body?.fileName || 'uploaded-file.jpg';
    const mimeType = body?.mime_type || body?.mimeType || 'image/jpeg';
    const fileSize = Number(body?.file_size || body?.fileSize || 0);
    const userId = user?.id || 'system';

    return this.mediaService.confirmUpload(
      siteId,
      assetId,
      filename,
      mimeType,
      fileSize,
      userId
    );
  }

  @Delete(':assetId')
  @RequireSiteRoles('editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMediaAsset(
    @Param('siteId') siteId: string,
    @Param('assetId') assetId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.mediaService.deleteMediaAsset(siteId, assetId, user.id);
  }
}
