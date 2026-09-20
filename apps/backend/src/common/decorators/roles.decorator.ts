import { SetMetadata } from '@nestjs/common';
import { PlatformRole, SiteRole } from '@t-business/shared-types';

export const SITE_ROLES_KEY = 'site_roles';
export const RequireSiteRoles = (...roles: SiteRole[]) => SetMetadata(SITE_ROLES_KEY, roles);

export const PLATFORM_ROLES_KEY = 'platform_roles';
export const RequirePlatformRoles = (...roles: PlatformRole[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);

export const PUBLIC_KEY = 'is_public';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
