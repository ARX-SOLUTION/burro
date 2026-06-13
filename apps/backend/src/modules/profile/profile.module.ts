import { Module } from "@nestjs/common";
import { appConfig } from "../../config";
import type { BurroDb } from "../../db/client";
import { BURRO_DB, DatabaseModule } from "../../db/database.module";
import { DrizzleProfileStore } from "./adapters/drizzle-profile.store";
import { InMemoryProfileStore } from "./adapters/in-memory-profile.store";
import { PROFILE_STORE } from "./profile.ports";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

const storeProvider = {
  provide: PROFILE_STORE,
  inject: [BURRO_DB],
  useFactory: (db: BurroDb | null) => {
    if (appConfig().attemptsStore === "memory") {
      return new InMemoryProfileStore();
    }
    if (!db) {
      throw new Error("Drizzle profile store requires a database, but BURRO_DB resolved to null.");
    }
    return new DrizzleProfileStore(db);
  }
};

@Module({
  imports: [DatabaseModule],
  controllers: [ProfileController],
  providers: [ProfileService, storeProvider]
})
export class ProfileModule {}
