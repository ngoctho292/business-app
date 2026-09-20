import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  SITE_ROLES_KEY,
  PLATFORM_ROLES_KEY,
  PUBLIC_KEY,
} from '../../common/decorators/roles.decorator';
import { db, sitesUsers } from '../../db';
import { and, eq } from 'drizzle-orm';
import { SiteRole, PlatformRole } from '@t-business/shared-types';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // 1. Platform Admin always has full access (System-wide support/billing)
    if (user.role === 'platform_admin') {
      return true;
    }

    // 2. Check Platform Roles requirement if specified
    const requiredPlatformRoles = this.reflector.getAllAndOverride<PlatformRole[]>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (requiredPlatformRoles && requiredPlatformRoles.length > 0) {
      if (!requiredPlatformRoles.includes(user.role)) {
        throw new ForbiddenException('Chỉ dành cho quản trị viên hệ thống (Platform Admin)');
      }
    }

    // 3. Check Site-level Roles requirement
    const requiredSiteRoles = this.reflector.getAllAndOverride<SiteRole[]>(
      SITE_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no specific site role is required, standard authenticated user passes
    if (!requiredSiteRoles || requiredSiteRoles.length === 0) {
      return true;
    }

    // Extract siteId from path params (primary), query, or body
    const siteId =
      request.params.siteId || request.body?.site_id || request.query?.siteId;

    if (!siteId) {
      throw new ForbiddenException('Yêu cầu không chứa định danh trang (siteId)');
    }

    // Query site membership
    const membership = await db.query.sitesUsers.findFirst({
      where: and(
        eq(sitesUsers.site_id, siteId),
        eq(sitesUsers.user_id, user.id)
      ),
    });

    if (!membership) {
      throw new ForbiddenException('Bạn không phải là thành viên của website này');
    }

    const userSiteRole = membership.role as SiteRole;
    user.siteRole = userSiteRole;
    user.siteId = siteId;

    // Role hierarchy / inclusion check
    // owner has all permissions of designer, editor, viewer
    // designer has permissions of editor, viewer
    // editor has permissions of viewer
    const hasRole = this.checkRoleMatch(userSiteRole, requiredSiteRoles);

    if (!hasRole) {
      throw new ForbiddenException(
        `Quyền của bạn (${userSiteRole}) không đủ để thực hiện thao tác này. Yêu cầu: ${requiredSiteRoles.join(', ')}`
      );
    }

    return true;
  }

  private checkRoleMatch(userRole: SiteRole, requiredRoles: SiteRole[]): boolean {
    if (requiredRoles.includes(userRole)) return true;

    // Role inheritance hierarchy
    if (userRole === 'owner') return true; // Owner has all permissions
    if (userRole === 'designer' && requiredRoles.includes('editor')) return true;
    if (userRole === 'designer' && requiredRoles.includes('viewer')) return true;
    if (userRole === 'editor' && requiredRoles.includes('viewer')) return true;

    return false;
  }
}
