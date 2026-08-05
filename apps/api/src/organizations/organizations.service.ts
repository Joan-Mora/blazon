import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ADMIN_ROLES, DEFAULT_THEME } from "@blazon/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Throws unless the user is ORG_OWNER or ORG_ADMIN of the org. */
  async assertOrgAdmin(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership || !ADMIN_ROLES.includes(membership.role as never)) {
      throw new ForbiddenException("Requires org admin role");
    }
    return membership;
  }

  async getPublicBySlug(slug: string) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
      include: {
        theme: true,
        pages: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          include: { blocks: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    if (!org) throw new NotFoundException(`Organization '${slug}' not found`);
    return org;
  }

  async create(userId: string, data: { slug: string; name: string; tagline?: string }) {
    const org = await this.prisma.organization.create({
      data: {
        slug: data.slug,
        name: data.name,
        tagline: data.tagline,
        theme: {
          create: { ...DEFAULT_THEME, logoText: data.name },
        },
        pages: {
          create: DEFAULT_PAGES.map((p, i) => ({
            slug: p.slug,
            title: p.title,
            sortOrder: i,
            published: true,
          })),
        },
        memberships: { create: { userId, role: "ORG_OWNER" } },
      },
      include: { theme: true, pages: true },
    });
    return org;
  }

  async update(
    userId: string,
    organizationId: string,
    data: { name?: string; tagline?: string; mission?: string },
  ) {
    await this.assertOrgAdmin(userId, organizationId);
    return this.prisma.organization.update({
      where: { id: organizationId },
      data,
    });
  }

  async updateTheme(
    userId: string,
    organizationId: string,
    theme: Partial<{
      background: string;
      surface: string;
      primary: string;
      accent: string;
      text: string;
      textMuted: string;
      fontFamily: string;
      logoText: string;
      logoUrl: string;
      faviconEmoji: string;
      heroImageUrl: string;
    }>,
  ) {
    await this.assertOrgAdmin(userId, organizationId);
    return this.prisma.organizationTheme.update({
      where: { organizationId },
      data: theme,
    });
  }

  // ── Members ─────────────────────────────────────────────────────────────

  async listMembers(userId: string, organizationId: string) {
    await this.assertOrgAdmin(userId, organizationId);
    return this.prisma.membership.findMany({
      where: { organizationId },
      include: {
        user: { select: { id: true, email: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async addMember(
    userId: string,
    organizationId: string,
    data: { email: string; role: string },
  ) {
    await this.assertOrgAdmin(userId, organizationId);
    const target = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!target) {
      throw new NotFoundException(
        `No user with email '${data.email}' — they must sign up first`,
      );
    }
    return this.prisma.membership.upsert({
      where: {
        userId_organizationId: { userId: target.id, organizationId },
      },
      update: { role: data.role },
      create: { userId: target.id, organizationId, role: data.role },
    });
  }

  async removeMember(userId: string, organizationId: string, membershipId: string) {
    await this.assertOrgAdmin(userId, organizationId);
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });
    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException("Membership not found");
    }
    if (membership.role === "ORG_OWNER") {
      throw new ForbiddenException("Cannot remove the org owner");
    }
    await this.prisma.membership.delete({ where: { id: membershipId } });
    return { ok: true };
  }

  // ── Pages & blocks ──────────────────────────────────────────────────────

  async listPages(userId: string, organizationId: string) {
    await this.assertOrgAdmin(userId, organizationId);
    return this.prisma.organizationPage.findMany({
      where: { organizationId },
      orderBy: { sortOrder: "asc" },
      include: { blocks: { orderBy: { sortOrder: "asc" } } },
    });
  }

  async updatePage(
    userId: string,
    organizationId: string,
    pageId: string,
    data: { title?: string; published?: boolean },
  ) {
    await this.assertOrgAdmin(userId, organizationId);
    const page = await this.prisma.organizationPage.findUnique({
      where: { id: pageId },
    });
    if (!page || page.organizationId !== organizationId) {
      throw new NotFoundException("Page not found");
    }
    return this.prisma.organizationPage.update({
      where: { id: pageId },
      data,
    });
  }

  /** Replaces the full block list of a page (simple MVP editor semantics). */
  async replaceBlocks(
    userId: string,
    organizationId: string,
    pageId: string,
    blocks: { type: string; data: unknown }[],
  ) {
    await this.assertOrgAdmin(userId, organizationId);
    const page = await this.prisma.organizationPage.findUnique({
      where: { id: pageId },
    });
    if (!page || page.organizationId !== organizationId) {
      throw new NotFoundException("Page not found");
    }
    await this.prisma.$transaction([
      this.prisma.pageBlock.deleteMany({ where: { pageId } }),
      this.prisma.pageBlock.createMany({
        data: blocks.map((b, i) => ({
          pageId,
          type: b.type,
          sortOrder: i,
          data: (b.data ?? {}) as object,
        })),
      }),
    ]);
    return this.prisma.pageBlock.findMany({
      where: { pageId },
      orderBy: { sortOrder: "asc" },
    });
  }
}

const DEFAULT_PAGES = [
  { slug: "home", title: "Inicio" },
  { slug: "torneos", title: "Torneos" },
  { slug: "ranking", title: "Ranking" },
  { slug: "academia", title: "Academia" },
  { slug: "streaming", title: "Streaming & Casteo" },
  { slug: "clips", title: "Clips" },
  { slug: "tienda", title: "Tienda" },
  { slug: "reclutamiento", title: "Reclutamiento" },
];
