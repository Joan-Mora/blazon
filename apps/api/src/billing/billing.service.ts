import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";
import { OrganizationsService } from "../organizations/organizations.service";

@Injectable()
export class BillingService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orgs: OrganizationsService,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) this.stripe = new Stripe(key);
  }

  listPlans() {
    return this.prisma.plan.findMany({ orderBy: { priceMonthlyUsd: "asc" } });
  }

  async getSubscription(userId: string, organizationId: string) {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    return this.prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
  }

  async createCheckout(
    userId: string,
    organizationId: string,
    planCode: string,
  ): Promise<{ url: string }> {
    await this.orgs.assertOrgAdmin(userId, organizationId);
    if (!this.stripe) {
      throw new ServiceUnavailableException(
        "Stripe is not configured (missing STRIPE_SECRET_KEY)",
      );
    }
    const plan = await this.prisma.plan.findUnique({ where: { code: planCode } });
    if (!plan) throw new NotFoundException(`Unknown plan '${planCode}'`);
    if (plan.priceMonthlyUsd === 0) {
      // Free plan → activate directly, no checkout needed
      await this.activate(organizationId, plan.id, null, null);
      const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
      return { url: `${webUrl}/dashboard?billing=activated` };
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException("Organization not found");

    const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: organizationId,
      metadata: { organizationId, planCode },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: plan.priceMonthlyUsd * 100,
            recurring: { interval: "month" },
            product_data: {
              name: `Blazon ${plan.name} — ${org.name}`,
            },
          },
        },
      ],
      success_url: `${webUrl}/dashboard?billing=success`,
      cancel_url: `${webUrl}/dashboard?billing=canceled`,
    });
    if (!session.url) throw new BadRequestException("Stripe session has no URL");
    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe) {
      throw new ServiceUnavailableException("Stripe not configured");
    }
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;
    if (secret && signature) {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } else {
      event = JSON.parse(rawBody.toString()) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const organizationId =
        session.metadata?.organizationId ?? session.client_reference_id;
      const planCode = session.metadata?.planCode;
      if (organizationId && planCode) {
        const plan = await this.prisma.plan.findUnique({
          where: { code: planCode },
        });
        if (plan) {
          await this.activate(
            organizationId,
            plan.id,
            typeof session.customer === "string" ? session.customer : null,
            typeof session.subscription === "string" ? session.subscription : null,
          );
        }
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.paused"
    ) {
      const sub = event.data.object;
      await this.prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELED" },
      });
    }

    return { received: true };
  }

  private async activate(
    organizationId: string,
    planId: string,
    stripeCustomerId: string | null,
    stripeSubscriptionId: string | null,
  ) {
    await this.prisma.subscription.upsert({
      where: { organizationId },
      update: {
        planId,
        status: "ACTIVE",
        stripeCustomerId: stripeCustomerId ?? undefined,
        stripeSubscriptionId: stripeSubscriptionId ?? undefined,
      },
      create: {
        organizationId,
        planId,
        status: "ACTIVE",
        stripeCustomerId,
        stripeSubscriptionId,
      },
    });
  }
}
