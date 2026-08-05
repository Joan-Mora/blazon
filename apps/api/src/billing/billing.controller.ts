import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { IsIn, IsString } from "class-validator";
import type { Request } from "express";
import { PLAN_CODES, type SessionUser } from "@blazon/shared";
import { BillingService } from "./billing.service";
import { JwtAuthGuard, CurrentUser } from "../auth/jwt-auth.guard";

class CheckoutDto {
  @IsString()
  organizationId!: string;

  @IsIn(PLAN_CODES as unknown as string[])
  planCode!: string;
}

@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get("plans")
  listPlans() {
    return this.billing.listPlans();
  }

  @Get("orgs/:orgId/subscription")
  @UseGuards(JwtAuthGuard)
  getSubscription(
    @CurrentUser() user: SessionUser,
    @Param("orgId") orgId: string,
  ) {
    return this.billing.getSubscription(user.id, orgId);
  }

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  createCheckout(@CurrentUser() user: SessionUser, @Body() dto: CheckoutDto) {
    return this.billing.createCheckout(user.id, dto.organizationId, dto.planCode);
  }

  @Post("webhook")
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature?: string,
  ) {
    return this.billing.handleWebhook(
      req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {})),
      signature,
    );
  }
}
