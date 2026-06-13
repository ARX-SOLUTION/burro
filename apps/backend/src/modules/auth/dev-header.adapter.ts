import { Injectable } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import { headerValue, IdentityPort, IdentityRequest, StudentIdentity } from "./identity.ports";

const STUDENT_ID_HEADER = "x-student-id";
const DEMO_STUDENT_ID = "student-demo";

/** Dev/demo identity: trusts the x-student-id header, falls back to the demo student. */
@Injectable()
export class DevHeaderAdapter implements IdentityPort {
  async resolveIdentity(req: IdentityRequest): Promise<StudentIdentity> {
    const studentId = headerValue(req, STUDENT_ID_HEADER);
    const resolvedStudentId = studentId && studentId.length > 0 ? studentId : DEMO_STUDENT_ID;
    return { userId: resolvedStudentId, studentId: resolvedStudentId, role: UserRole.Student };
  }
}
