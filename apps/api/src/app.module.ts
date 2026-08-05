import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { TournamentsModule } from "./tournaments/tournaments.module";
import { BillingModule } from "./billing/billing.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
      signOptions: { expiresIn: "7d" },
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    TournamentsModule,
    BillingModule,
  ],
})
export class AppModule {}
