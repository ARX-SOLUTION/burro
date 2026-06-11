import { Injectable } from "@nestjs/common";
import { headerValue, IdentityPort, IdentityRequest, StudentIdentity } from "./identity.ports";

const STUDENT_ID_HEADER = "x-student-id";
const DEMO_STUDENT_ID = "student-demo";

/** Dev/demo identity: trusts the x-student-id header, falls back to the demo student. */
@Injectable()
export class DevHeaderAdapter implements IdentityPort {
  async resolveStudent(req: IdentityRequest): Promise<StudentIdentity> {
    const studentId = headerValue(req, STUDENT_ID_HEADER);
    return { studentId: studentId && studentId.length > 0 ? studentId : DEMO_STUDENT_ID };
  }
}
