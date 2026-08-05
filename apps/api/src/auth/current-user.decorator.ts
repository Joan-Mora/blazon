import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { User } from "@blazon/db";

export type AuthUser = User;

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as AuthUser;
  },
);
