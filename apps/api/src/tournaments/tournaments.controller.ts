import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Min,
} from "class-validator";
import { TOURNAMENT_STATUSES, type SessionUser } from "@blazon/shared";
import { TournamentsService } from "./tournaments.service";
import { JwtAuthGuard, CurrentUser } from "../auth/jwt-auth.guard";

class CreateTournamentDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]{2,60}$/)
  slug!: string;

  @IsString()
  gameSlug!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() rules?: string;
  @IsOptional() @IsString() prizePool?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxParticipants?: number;

  @IsISO8601()
  startsAt!: string;

  @IsOptional()
  @IsIn(TOURNAMENT_STATUSES as unknown as string[])
  status?: string;
}

class UpdateTournamentDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() rules?: string;
  @IsOptional() @IsString() prizePool?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxParticipants?: number;

  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @IsOptional()
  @IsIn(TOURNAMENT_STATUSES as unknown as string[])
  status?: string;
}

class RegisterDto {
  @IsOptional()
  @IsString()
  teamName?: string;
}

class ReportResultDto {
  @IsInt()
  @Min(0)
  scoreA!: number;

  @IsInt()
  @Min(0)
  scoreB!: number;
}

@Controller()
export class TournamentsController {
  constructor(private readonly tournaments: TournamentsService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get("orgs/:slug/tournaments")
  listPublic(
    @Param("slug") slug: string,
    @Query("scope") scope?: "upcoming" | "past" | "all",
  ) {
    return this.tournaments.listPublic(slug, scope ?? "all");
  }

  @Get("orgs/:slug/tournaments/next")
  nextUpcoming(@Param("slug") slug: string) {
    return this.tournaments.nextUpcoming(slug);
  }

  @Get("orgs/:slug/tournaments/:tslug")
  getPublic(@Param("slug") slug: string, @Param("tslug") tslug: string) {
    return this.tournaments.getPublic(slug, tslug);
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  @Get("admin/orgs/:orgId/tournaments")
  @UseGuards(JwtAuthGuard)
  listAdmin(@CurrentUser() user: SessionUser, @Param("orgId") orgId: string) {
    return this.tournaments.listAdmin(user.id, orgId);
  }

  @Get("admin/orgs/:orgId/tournaments/:tournamentId")
  @UseGuards(JwtAuthGuard)
  getAdmin(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
    @Param("tournamentId") tournamentId: string,
  ) {
    return this.tournaments.getAdmin(user.id, orgId, tournamentId);
  }

  @Post("admin/orgs/:orgId/tournaments")
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
    @Body() dto: CreateTournamentDto,
  ) {
    return this.tournaments.create(user.id, orgId, dto);
  }

  @Patch("admin/orgs/:orgId/tournaments/:tournamentId")
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
    @Param("tournamentId") tournamentId: string,
    @Body() dto: UpdateTournamentDto,
  ) {
    return this.tournaments.update(user.id, orgId, tournamentId, dto);
  }

  @Post("admin/orgs/:orgId/tournaments/:tournamentId/bracket")
  @UseGuards(JwtAuthGuard)
  generateBracket(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
    @Param("tournamentId") tournamentId: string,
  ) {
    return this.tournaments.generateBracket(user.id, orgId, tournamentId);
  }

  @Post("admin/orgs/:orgId/matches/:matchId/result")
  @UseGuards(JwtAuthGuard)
  reportResult(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
    @Param("matchId") matchId: string,
    @Body() dto: ReportResultDto,
  ) {
    return this.tournaments.reportResult(
      user.id,
      orgId,
      matchId,
      dto.scoreA,
      dto.scoreB,
    );
  }

  // ── Player ──────────────────────────────────────────────────────────────

  @Post("tournaments/:tournamentId/register")
  @UseGuards(JwtAuthGuard)
  register(
    @CurrentUser() user: SessionUser,
    @Param("tournamentId") tournamentId: string,
    @Body() dto: RegisterDto,
  ) {
    return this.tournaments.register(user.id, tournamentId, dto.teamName);
  }

  @Post("tournaments/:tournamentId/checkin")
  @UseGuards(JwtAuthGuard)
  checkIn(
    @CurrentUser() user: SessionUser,
    @Param("tournamentId") tournamentId: string,
  ) {
    return this.tournaments.checkIn(user.id, tournamentId);
  }
}
