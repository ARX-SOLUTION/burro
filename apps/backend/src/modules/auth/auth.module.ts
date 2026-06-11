import { Global, Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { AuthGuard } from "./auth.guard";
import { DevHeaderAdapter } from "./dev-header.adapter";
import { IDENTITY_PORT } from "./identity.ports";
import { createDrizzleUpsertStudent, TelegramInitDataAdapter } from "./telegram-init-data.adapter";

const identityProvider = {
  provide: IDENTITY_PORT,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    const config = appConfig();
    if (config.auth !== "telegram") {
      return new DevHeaderAdapter();
    }
    // loadConfig guarantees the token; DatabaseModule guarantees the db for
    // telegram auth. Throwing keeps any regression loud instead of degrading.
    if (!db || !config.telegramBotToken) {
      throw new Error('BURRO_AUTH="telegram" requires DATABASE_URL and TELEGRAM_BOT_TOKEN.');
    }
    return new TelegramInitDataAdapter(createDrizzleUpsertStudent(db), config.telegramBotToken);
  }
};

// Global so @UseGuards(AuthGuard) resolves in any feature module without explicit imports.
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [identityProvider, AuthGuard],
  exports: [identityProvider, AuthGuard]
})
export class AuthModule {}
