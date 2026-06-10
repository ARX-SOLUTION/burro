import { Injectable } from "@nestjs/common";

@Injectable()
export class AchievementsService {
  // TODO: Implement achievements business rules from ../../../../../docs/04-API_SPEC.md and permissions from ../../../../../docs/05-PERMISSION_MATRIX.md.
  status() {
    return { module: "achievements", status: "skeleton" };
  }
}
