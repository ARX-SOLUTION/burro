import { Global, Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard";
import { DevHeaderAdapter } from "./dev-header.adapter";
import { IDENTITY_PORT } from "./identity.ports";
import { TelegramInitDataAdapter } from "./telegram-init-data.adapter";

const identityProvider = {
  provide: IDENTITY_PORT,
  useFactory: () => (process.env.BURRO_AUTH === "telegram" ? new TelegramInitDataAdapter() : new DevHeaderAdapter())
};

// Global so @UseGuards(AuthGuard) resolves in any feature module without explicit imports.
@Global()
@Module({
  providers: [identityProvider, AuthGuard],
  exports: [identityProvider, AuthGuard]
})
export class AuthModule {}
