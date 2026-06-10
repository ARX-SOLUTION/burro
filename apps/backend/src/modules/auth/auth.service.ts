import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  // TODO: Implement auth business rules from ../../../../../docs/04-API_SPEC.md and permissions from ../../../../../docs/05-PERMISSION_MATRIX.md.
  status() {
    return { module: "auth", status: "skeleton" };
  }
}
