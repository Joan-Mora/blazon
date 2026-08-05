import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { ORG_ROLES, type SessionUser } from "@blazon/shared";
import { OrganizationsService } from "./organizations.service";
import { JwtAuthGuard, CurrentUser } from "../auth/jwt-auth.guard";

class CreateOrgDto {
  @IsString()
  @Matches(/^[a-z0-9-]{2,40}$/, {
    message: "slug must be lowercase letters, numbers and dashes",
  })
  slug!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  tagline?: string;
}

class UpdateOrgDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  mission?: string;
}

class UpdateThemeDto {
  @IsOptional() @IsString() background?: string;
  @IsOptional() @IsString() surface?: string;
  @IsOptional() @IsString() primary?: string;
  @IsOptional() @IsString() accent?: string;
  @IsOptional() @IsString() text?: string;
  @IsOptional() @IsString() textMuted?: string;
  @IsOptional() @IsString() fontFamily?: string;
  @IsOptional() @IsString() logoText?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() faviconEmoji?: string;
  @IsOptional() @IsString() heroImageUrl?: string;
}

class AddMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(ORG_ROLES as unknown as string[])
  role!: string;
}

class UpdatePageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

class ReplaceBlocksDto {
  @IsArray()
  blocks!: { type: string; data: unknown }[];
}

@Controller("orgs")
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get(":slug")
  getPublic(@Param("slug") slug: string) {
    return this.orgs.getPublicBySlug(slug);
  }

  // ── Authenticated ───────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: SessionUser, @Body() dto: CreateOrgDto) {
    return this.orgs.create(user.id, dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() dto: UpdateOrgDto,
  ) {
    return this.orgs.update(user.id, id, dto);
  }

  @Patch(":id/theme")
  @UseGuards(JwtAuthGuard)
  updateTheme(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.orgs.updateTheme(user.id, id, dto);
  }

  @Get(":id/members")
  @UseGuards(JwtAuthGuard)
  listMembers(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.orgs.listMembers(user.id, id);
  }

  @Post(":id/members")
  @UseGuards(JwtAuthGuard)
  addMember(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.orgs.addMember(user.id, id, dto);
  }

  @Delete(":id/members/:membershipId")
  @UseGuards(JwtAuthGuard)
  removeMember(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Param("membershipId") membershipId: string,
  ) {
    return this.orgs.removeMember(user.id, id, membershipId);
  }

  @Get(":id/pages")
  @UseGuards(JwtAuthGuard)
  listPages(@CurrentUser() user: SessionUser, @Param("id") id: string) {
    return this.orgs.listPages(user.id, id);
  }

  @Patch(":id/pages/:pageId")
  @UseGuards(JwtAuthGuard)
  updatePage(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Param("pageId") pageId: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.orgs.updatePage(user.id, id, pageId, dto);
  }

  @Put(":id/pages/:pageId/blocks")
  @UseGuards(JwtAuthGuard)
  replaceBlocks(
    @CurrentUser() user: SessionUser,
    @Param("id") id: string,
    @Param("pageId") pageId: string,
    @Body() dto: ReplaceBlocksDto,
  ) {
    return this.orgs.replaceBlocks(user.id, id, pageId, dto.blocks);
  }
}
