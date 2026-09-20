import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { db, sites, sitesUsers, pages } from '../../db';
import { eq, and, isNull } from 'drizzle-orm';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  /**
   * Trả về thông tin user đang đăng nhập
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Trả về danh sách Sites mà user là thành viên
   */
  @Get('sites')
  @HttpCode(HttpStatus.OK)
  async getMySites(@CurrentUser() user: AuthenticatedUser) {
    // Platform Admin thấy tất cả sites
    if (user.role === 'platform_admin') {
      const allSites = await db.query.sites.findMany();
      return allSites.map((s: any) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        domain_verified: s.domain_verified,
        role: 'platform_admin',
        created_at: s.created_at?.toISOString() || new Date().toISOString(),
        updated_at: s.updated_at?.toISOString() || new Date().toISOString(),
      }));
    }

    // User thường: lấy danh sách sites từ bảng sites_users
    const memberships = await db.query.sitesUsers.findMany({
      where: eq(sitesUsers.user_id, user.id),
    });

    const siteIds = memberships.map((m) => m.site_id);
    if (siteIds.length === 0) return [];

    const results: any[] = [];
    for (const membership of memberships) {
      const site = await db.query.sites.findFirst({
        where: eq(sites.id, membership.site_id),
      });
      if (site) {
        results.push({
          id: site.id,
          name: site.name,
          domain: site.domain,
          domain_verified: site.domain_verified,
          role: membership.role,
          created_at: site.created_at.toISOString(),
          updated_at: site.updated_at.toISOString(),
        });
      }
    }

    return results;
  }

  /**
   * Trả về danh sách Pages của một Site (phải là thành viên của site đó)
   */
  @Get('sites/:siteId/pages')
  @HttpCode(HttpStatus.OK)
  async getMySitePages(
    @Param('siteId') siteId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    // Kiểm tra quyền truy cập (trừ platform_admin)
    if (user.role !== 'platform_admin') {
      const membership = await db.query.sitesUsers.findFirst({
        where: and(
          eq(sitesUsers.site_id, siteId),
          eq(sitesUsers.user_id, user.id),
        ),
      });

      if (!membership) {
        return { error: 'Bạn không phải là thành viên của website này', pages: [] };
      }
    }

    const sitePages = await db.query.pages.findMany({
      where: and(eq(pages.site_id, siteId), isNull(pages.deleted_at)),
    });

    return sitePages.map((p) => ({
      id: p.id,
      site_id: p.site_id,
      slug: p.slug,
      status: p.status,
      current_version_id: p.current_version_id,
      seo_meta: p.seo_meta,
      created_at: p.created_at?.toISOString() || new Date().toISOString(),
      updated_at: p.updated_at?.toISOString() || new Date().toISOString(),
    }));
  }
}
