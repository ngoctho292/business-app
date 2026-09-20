import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SitesService,
  CreateSiteDto,
  SetCustomDomainDto,
  AddMemberDto,
  UpdateMemberRoleDto,
} from './sites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../rbac/rbac.guard';
import { RequireSiteRoles, Public } from '../../common/decorators/roles.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { SiteDTO, SiteUserDTO } from '@t-business/shared-types';

@Controller('sites')
@UseGuards(JwtAuthGuard, RbacGuard)
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  async createSite(
    @Body() body: CreateSiteDto,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<SiteDTO> {
    return this.sitesService.createSite(body, user.id);
  }

  @Delete(':siteId')
  @RequireSiteRoles('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSite(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthenticatedUser
  ): Promise<void> {
    await this.sitesService.deleteSite(siteId, user.id);
  }

  @Public()
  @Get(':siteId')
  async getSite(@Param('siteId') siteId: string): Promise<SiteDTO> {
    return this.sitesService.getSiteById(siteId);
  }

  @Public()
  @Get('lookup/domain/:domain')
  async lookupByDomain(@Param('domain') domain: string): Promise<SiteDTO | null> {
    return this.sitesService.getSiteByDomain(domain);
  }

  // --- Custom Domain Management ---

  @Public()
  @Post(':siteId/custom-domain')
  async setCustomDomain(
    @Param('siteId') siteId: string,
    @Body() body: SetCustomDomainDto
  ): Promise<SiteDTO> {
    return this.sitesService.setCustomDomain(siteId, body.custom_domain);
  }

  @Public()
  @Post(':siteId/custom-domain/verify')
  async verifyCustomDomain(
    @Param('siteId') siteId: string,
    @Body() body: { force?: boolean }
  ) {
    return this.sitesService.verifyCustomDomain(siteId, !!body?.force);
  }

  @Public()
  @Delete(':siteId/custom-domain')
  async removeCustomDomain(@Param('siteId') siteId: string): Promise<SiteDTO> {
    return this.sitesService.removeCustomDomain(siteId);
  }

  // --- Theme Management ---

  @Public()
  @Get(':siteId/theme')
  async getTheme(@Param('siteId') siteId: string) {
    return this.sitesService.getSiteTheme(siteId);
  }

  @Public()
  @Patch(':siteId/theme')
  async updateTheme(@Param('siteId') siteId: string, @Body() body: any) {
    return this.sitesService.updateSiteTheme(siteId, body);
  }


  // --- Members Management ---

  @Get(':siteId/members')
  @RequireSiteRoles('designer')
  async getMembers(@Param('siteId') siteId: string): Promise<SiteUserDTO[]> {
    return this.sitesService.getMembers(siteId);
  }

  @Post(':siteId/members')
  @RequireSiteRoles('owner')
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @Param('siteId') siteId: string,
    @Body() body: AddMemberDto
  ): Promise<SiteUserDTO> {
    return this.sitesService.addMember(siteId, body);
  }

  @Patch(':siteId/members/:userId')
  @RequireSiteRoles('owner')
  async updateMemberRole(
    @Param('siteId') siteId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateMemberRoleDto
  ): Promise<SiteUserDTO> {
    return this.sitesService.updateMemberRole(siteId, userId, body);
  }

  @Delete(':siteId/members/:userId')
  @RequireSiteRoles('owner')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('siteId') siteId: string,
    @Param('userId') userId: string
  ): Promise<void> {
    await this.sitesService.removeMember(siteId, userId);
  }
}
