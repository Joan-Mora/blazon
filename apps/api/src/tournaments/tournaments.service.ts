import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgs: OrganizationsService,
  ) {}

  // ── Public reads ────────────────────────────────────────────────────────

  async listPublic(orgSlug: string, scope: "upcoming" | "past" | "all" = "all") {
    const org = await this.prisma.organization.findUnique({
      where: { slug: orgSlug },
      select: { id: true },
    });
    if (!org) throw new NotFoundException("Organization not found");

    const now = new Date();
    return this.prisma.tournament.findMany({
      where: {
        organizationId: org.id,
        status: { not: "DRAFT" },
        ...(scope === "upcoming" ? { startsAt: { gte: now } } : {}),
        ...(scope === "past" ? { startsAt: { lt: now } } : {}),
      },
      orderBy: { startsAt: scope === "past" ? "desc" : "asc" },
      include: {
        game: { select: { slug: true, name: true } },
        _count: { select: { registrations: true } },
      },
    });
  }

  async getPublic(orgSlug: string, tournamentSlug: string) {
    const tournament = await this.prisma.tournament.findFirst({
      where: {
        slug: tournamentSlug,
        organization: { slug: orgSlug },
        status: { not: "DRAFT" },
      },
      include: {
        game: { select: { slug: true, name: true } },
        organization: { select: { id: true, slug: true, name: true } },
        registrations: {
          select: {
            id: true,
            teamName: true,
            status: true,
            user: { select: { id: true, name: true } },
          },
        },
        matches: {
          orderBy: [{ round: "asc" }, { position: "asc" }],
          include: {
            participantA: {
              select: { id: true, teamName: true, user: { select: { name: true } } },
            },
            participantB: {
              select: { id: true, teamName: true, user: { select: { name: true } } },
            },
          },
        },
      },
    });
    if (!tournament) throw new NotFoundException("Tournament not found");
    return tournament;
  }

  /** Next upcoming published tournament for the org — used by hero countdown. */
  async nextUpcoming(orgSlug: string) {
    return this.prisma.tournament.findFirst({
      where: {
        organization: { slug: orgSlug },
        status: { in: ["REGISTRATION", "LIVE"] },
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      include: { game: { select: { name: true } } },
    });
  }

  // ── Admin ───────────────────────────────────────────────────────────────

  async listAdmin(userId: string, organizationId: string) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    return this.prisma.tournament.findMany({
      where: { organizationId },
      orderBy: { startsAt: "desc" },
      include: {
        game: { select: { slug: true, name: true } },
        _count: { select: { registrations: true, matches: true } },
      },
    });
  }

  async getAdmin(userId: string, organizationId: string, tournamentId: string) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        game: { select: { slug: true, name: true } },
        registrations: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        matches: {
          orderBy: [{ round: "asc" }, { position: "asc" }],
          include: {
            participantA: {
              select: { id: true, teamName: true, user: { select: { name: true } } },
            },
            participantB: {
              select: { id: true, teamName: true, user: { select: { name: true } } },
            },
          },
        },
      },
    });
    if (!tournament || tournament.organizationId !== organizationId) {
      throw new NotFoundException("Tournament not found");
    }
    return tournament;
  }

  async create(
    userId: string,
    organizationId: string,
    data: {
      name: string;
      slug: string;
      gameSlug: string;
      description?: string;
      rules?: string;
      prizePool?: string;
      maxParticipants?: number;
      startsAt: string;
      status?: string;
    },
  ) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    const game = await this.prisma.game.findUnique({
      where: { slug: data.gameSlug },
    });
    if (!game) throw new BadRequestException(`Unknown game '${data.gameSlug}'`);

    return this.prisma.tournament.create({
      data: {
        organizationId,
        gameId: game.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        rules: data.rules,
        prizePool: data.prizePool,
        maxParticipants: data.maxParticipants ?? 16,
        startsAt: new Date(data.startsAt),
        status: data.status ?? "REGISTRATION",
      },
    });
  }

  async update(
    userId: string,
    organizationId: string,
    tournamentId: string,
    data: Partial<{
      name: string;
      description: string;
      rules: string;
      prizePool: string;
      maxParticipants: number;
      startsAt: string;
      status: string;
    }>,
  ) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    await this.getOwned(organizationId, tournamentId);
    return this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      },
    });
  }

  // ── Player actions ──────────────────────────────────────────────────────

  async register(userId: string, tournamentId: string, teamName?: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!tournament) throw new NotFoundException("Tournament not found");
    if (tournament.status !== "REGISTRATION") {
      throw new BadRequestException("Registration is closed");
    }
    if (tournament._count.registrations >= tournament.maxParticipants) {
      throw new BadRequestException("Tournament is full");
    }
    return this.prisma.registration.upsert({
      where: { tournamentId_userId: { tournamentId, userId } },
      update: { teamName },
      create: { tournamentId, userId, teamName, status: "CONFIRMED" },
    });
  }

  async checkIn(userId: string, tournamentId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
    });
    if (!registration) throw new NotFoundException("Not registered");
    return this.prisma.registration.update({
      where: { id: registration.id },
      data: { status: "CHECKED_IN", checkedInAt: new Date() },
    });
  }

  // ── Bracket ─────────────────────────────────────────────────────────────

  async generateBracket(
    userId: string,
    organizationId: string,
    tournamentId: string,
  ) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    await this.getOwned(organizationId, tournamentId);

    const registrations = await this.prisma.registration.findMany({
      where: {
        tournamentId,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
      },
    });
    if (registrations.length < 2) {
      throw new BadRequestException("Need at least 2 participants");
    }

    // Random seeding for MVP
    const seeded = [...registrations].sort(() => Math.random() - 0.5);
    const size = 2 ** Math.ceil(Math.log2(seeded.length));
    const rounds = Math.log2(size);

    await this.prisma.match.deleteMany({ where: { tournamentId } });

    // Slots padded with byes (null)
    const slots: (string | null)[] = Array.from({ length: size }, (_, i) =>
      i < seeded.length ? seeded[i].id : null,
    );

    // Create all matches
    const matchData: {
      tournamentId: string;
      round: number;
      position: number;
      participantAId: string | null;
      participantBId: string | null;
    }[] = [];

    for (let position = 0; position < size / 2; position++) {
      matchData.push({
        tournamentId,
        round: 1,
        position,
        participantAId: slots[position * 2],
        participantBId: slots[position * 2 + 1],
      });
    }
    for (let round = 2; round <= rounds; round++) {
      const count = size / 2 ** round;
      for (let position = 0; position < count; position++) {
        matchData.push({
          tournamentId,
          round,
          position,
          participantAId: null,
          participantBId: null,
        });
      }
    }
    await this.prisma.match.createMany({ data: matchData });

    // Auto-resolve byes in round 1
    const byeMatches = await this.prisma.match.findMany({
      where: {
        tournamentId,
        round: 1,
        OR: [{ participantAId: null }, { participantBId: null }],
      },
    });
    for (const match of byeMatches) {
      const winnerId = match.participantAId ?? match.participantBId;
      if (winnerId) {
        await this.completeMatch(tournamentId, match.id, winnerId, null, null, rounds);
      }
    }

    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: "LIVE" },
    });

    return this.prisma.match.findMany({
      where: { tournamentId },
      orderBy: [{ round: "asc" }, { position: "asc" }],
    });
  }

  async reportResult(
    userId: string,
    organizationId: string,
    matchId: string,
    scoreA: number,
    scoreB: number,
  ) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });
    if (!match || match.tournament.organizationId !== organizationId) {
      throw new NotFoundException("Match not found");
    }
    if (!match.participantAId || !match.participantBId) {
      throw new BadRequestException("Match is missing participants");
    }
    if (scoreA === scoreB) {
      throw new BadRequestException("Draws are not allowed in single elimination");
    }

    const totalRounds = await this.prisma.match
      .aggregate({
        where: { tournamentId: match.tournamentId },
        _max: { round: true },
      })
      .then((r) => r._max.round ?? 1);

    const winnerId = scoreA > scoreB ? match.participantAId : match.participantBId;
    await this.completeMatch(
      match.tournamentId,
      matchId,
      winnerId,
      scoreA,
      scoreB,
      totalRounds,
    );

    // Final played → tournament completed
    if (match.round === totalRounds) {
      await this.prisma.tournament.update({
        where: { id: match.tournamentId },
        data: { status: "COMPLETED" },
      });
    }

    return this.prisma.match.findUnique({ where: { id: matchId } });
  }

  /** Marks a match complete and advances the winner to the next round slot. */
  private async completeMatch(
    tournamentId: string,
    matchId: string,
    winnerId: string,
    scoreA: number | null,
    scoreB: number | null,
    totalRounds: number,
  ) {
    const match = await this.prisma.match.update({
      where: { id: matchId },
      data: {
        winnerId,
        scoreA,
        scoreB,
        status: "COMPLETED",
        playedAt: new Date(),
      },
    });

    if (match.round < totalRounds) {
      const nextPosition = Math.floor(match.position / 2);
      const slot = match.position % 2 === 0 ? "participantAId" : "participantBId";
      await this.prisma.match.update({
        where: {
          tournamentId_round_position: {
            tournamentId,
            round: match.round + 1,
            position: nextPosition,
          },
        },
        data: { [slot]: winnerId },
      });
    }
  }

  private async getOwned(organizationId: string, tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament || tournament.organizationId !== organizationId) {
      throw new NotFoundException("Tournament not found");
    }
    return tournament;
  }
}
