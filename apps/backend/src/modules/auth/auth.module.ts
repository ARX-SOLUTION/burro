import { Global, Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleAuthUserStore } from "./adapters/drizzle-auth-user.store";
import { InMemoryAuthUserStore } from "./adapters/in-memory-auth-user.store";
import { AuthGuard } from "./auth.guard";
import { AUTH_USER_STORE } from "./auth-user.ports";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { DevHeaderAdapter } from "./dev-header.adapter";
import { IDENTITY_PORT } from "./identity.ports";
import { SessionIdentityAdapter } from "./session-identity.adapter";
import { SessionTokenService } from "./session-token.service";
import { createDrizzleUpsertStudent, TelegramInitDataAdapter } from "./telegram-init-data.adapter";

const sessionTokenProvider = {
  provide: SessionTokenService,
  useFactory: () => new SessionTokenService(appConfig().jwtSecret)
};

const identityProvider = {
  provide: IDENTITY_PORT,
  inject: [BURRO_DB, SessionTokenService],
  useFactory: (db: BurroDb | null, tokens: SessionTokenService) => {
    const config = appConfig();
    if (config.auth !== "telegram") {
      return new SessionIdentityAdapter(tokens, new DevHeaderAdapter());
    }
    // loadConfig guarantees the token; DatabaseModule guarantees the db for
    // telegram auth. Throwing keeps any regression loud instead of degrading.
    if (!db || !config.telegramBotToken) {
      throw new Error('BURRO_AUTH="telegram" requires DATABASE_URL and TELEGRAM_BOT_TOKEN.');
    }
    return new SessionIdentityAdapter(tokens, new TelegramInitDataAdapter(createDrizzleUpsertStudent(db), config.telegramBotToken));
  }
};

const authUserStoreProvider = {
  provide: AUTH_USER_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    const config = appConfig();
    if (config.auth !== "telegram") {
      return new InMemoryAuthUserStore();
    }
    if (!db) {
      throw new Error('BURRO_AUTH="telegram" requires DATABASE_URL.');
    }
    return new DrizzleAuthUserStore(db);
  }
};

// Global so @UseGuards(AuthGuard) resolves in any feature module without explicit imports.
@Global()
@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [sessionTokenProvider, identityProvider, authUserStoreProvider, AuthService, AuthGuard],
  exports: [sessionTokenProvider, identityProvider, AuthService, AuthGuard]
})
export class AuthModule {}
