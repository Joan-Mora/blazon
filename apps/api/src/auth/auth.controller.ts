import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { IsEmail, IsOptional, IsString } from "class-validator";
import type { Response } from "express";
import type { SessionUser } from "@blazon/shared";
import { AuthService } from "./auth.service";
import { JwtAuthGuard, CurrentUser } from "./jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

class DevLoginDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  name?: string;
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(":provider")
  redirectToProvider(@Param("provider") provider: string, @Res() res: Response) {
    res.redirect(this.auth.getAuthorizeUrl(provider));
  }

  @Get(":provider/callback")
  async callback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Res() res: Response,
  ) {
    const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
    if (!code) return res.redirect(`${webUrl}/login?error=oauth`);
    try {
      const token = await this.auth.handleCallback(provider, code);
      return res.redirect(`${webUrl}/auth/callback?token=${token}`);
    } catch {
      return res.redirect(`${webUrl}/login?error=oauth`);
    }
  }

  @Post("dev")
  async devLogin(@Body() dto: DevLoginDto) {
    const token = await this.auth.devLogin(dto.email, dto.name);
    return { token };
  }

  @Get("session/me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: SessionUser) {
    const full = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    return full ?? user;
  }

  @Get("session/registrations")
  @UseGuards(JwtAuthGuard)
  async myRegistrations(@CurrentUser() user: SessionUser) {
    return this.prisma.registration.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        tournament: {
          select: {
            id: true,
            slug: true,
            name: true,
            startsAt: true,
            status: true,
            organization: { select: { slug: true, name: true } },
          },
        },
      },
    });
  }

  @Get("session/orgs")
  @UseGuards(JwtAuthGuard)
  async myOrgs(@CurrentUser() user: SessionUser) {
    return this.prisma.membership.findMany({
      where: { userId: user.id },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
      },
    });
  }
}
