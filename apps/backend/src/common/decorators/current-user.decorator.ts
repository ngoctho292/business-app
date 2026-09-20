import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDTO } from '@t-business/shared-types';

export interface AuthenticatedUser extends UserDTO {
  siteRole?: string;
  siteId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    return data ? user?.[data] : user;
  }
);
