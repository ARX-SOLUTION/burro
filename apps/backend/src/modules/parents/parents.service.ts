import { Injectable } from "@nestjs/common";

@Injectable()
export class ParentsService {
  // TODO: Implement parents business rules from ../../../../../docs/04-API_SPEC.md and permissions from ../../../../../docs/05-PERMISSION_MATRIX.md.
  status() {
    return { module: "parents", status: "skeleton" };
  }
}
