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
import { FormsService, SubmitFormDto } from './forms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequireSiteRoles, Public } from '../../common/decorators/roles.decorator';
import { FormSubmissionDTO, PagedResponse } from '@t-business/shared-types';

@Controller()
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  /**
   * Public endpoint nhận form submission từ website
   * POST /v1/public/forms/submit
   */
  @Public()
  @Post('public/forms/submit')
  async submitForm(@Body() body: SubmitFormDto) {
    return this.formsService.submitForm(body);
  }

  /**
   * Lấy danh sách form submissions của site (Authenticated)
   * GET /v1/sites/:siteId/forms/submissions
   */
  @Get('sites/:siteId/forms/submissions')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequireSiteRoles('viewer')
  async getSubmissions(
    @Param('siteId') siteId: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('page_slug') pageSlug?: string
  ): Promise<PagedResponse<FormSubmissionDTO>> {
    return this.formsService.getSubmissions(
      siteId,
      limit ? parseInt(limit, 10) : 20,
      cursor,
      pageSlug
    );
  }

  /**
   * Đánh dấu đã đọc
   * PATCH /v1/sites/:siteId/forms/submissions/:id/read
   */
  @Patch('sites/:siteId/forms/submissions/:id/read')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequireSiteRoles('editor')
  async markAsRead(
    @Param('siteId') siteId: string,
    @Param('id') submissionId: string
  ): Promise<FormSubmissionDTO> {
    return this.formsService.markAsRead(siteId, submissionId);
  }

  /**
   * Xóa form submission
   * DELETE /v1/sites/:siteId/forms/submissions/:id
   */
  @Delete('sites/:siteId/forms/submissions/:id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequireSiteRoles('editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSubmission(
    @Param('siteId') siteId: string,
    @Param('id') submissionId: string
  ): Promise<void> {
    await this.formsService.deleteSubmission(siteId, submissionId);
  }
}
