import { Injectable } from "@nestjs/common";

@Injectable()
export class NotificationsService {
  // TODO: Implement notifications business rules from ../../../../../docs/04-API_SPEC.md and permissions from ../../../../../docs/05-PERMISSION_MATRIX.md.
  status() {
    return { module: "notifications", status: "skeleton" };
  }
}
