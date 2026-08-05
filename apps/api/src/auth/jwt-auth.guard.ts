import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { SessionUser } from "@blazon/shared";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }
    try {
      const payload = this.jwt.verify<{
        sub: string;
        email: string;
        name: string;
      }>(header.slice(7));
      (req as Request & { user: SessionUser }).user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser => {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: SessionUser }>();
    return req.user;
  },
);
