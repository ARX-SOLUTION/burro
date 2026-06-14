import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzlePremiumStore } from "./adapters/drizzle-premium.store";
import { InMemoryPremiumStore } from "./adapters/in-memory-premium.store";
import { PREMIUM_STORE } from "./premium.ports";
import { PremiumController } from "./premium.controller";
import { PremiumService } from "./premium.service";

const storeProvider = {
  provide: PREMIUM_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryPremiumStore();
    }
    if (!db) {
      throw new Error("Drizzle premium store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzlePremiumStore(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [PremiumController],
  providers: [PremiumService, storeProvider]
})
export class PremiumModule {}
