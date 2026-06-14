import { Injectable } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import { headerValue, IdentityPort, IdentityRequest, StudentIdentity } from "./identity.ports";

const STUDENT_ID_HEADER = "x-student-id";

/**
 * Fixed demo student uuid. `users.id` is a uuid, so the dev fallback must be a
 * valid uuid the seed also inserts; the two must stay in lockstep. The
 * x-student-id header still overrides this for QA against other seeded students.
 */
export const DEMO_STUDENT_ID = "11111111-1111-1111-1111-111111111111";

/** Dev/demo identity: trusts the x-student-id header, falls back to the demo student. */
@Injectable()
export class DevHeaderAdapter implements IdentityPort {
  async resolveIdentity(req: IdentityRequest): Promise<StudentIdentity> {
    const studentId = headerValue(req, STUDENT_ID_HEADER);
    const resolvedStudentId = studentId && studentId.length > 0 ? studentId : DEMO_STUDENT_ID;
    return { userId: resolvedStudentId, studentId: resolvedStudentId, role: UserRole.Student };
  }
}
