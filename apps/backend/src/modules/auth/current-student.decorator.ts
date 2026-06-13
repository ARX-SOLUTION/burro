import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import type { StudentIdentity } from "./identity.ports";

export const CurrentStudent = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{ student?: StudentIdentity }>();
  if (!request.student || request.student.role !== UserRole.Student) {
    throw new UnauthorizedException("Student identity missing on request.");
  }
  return request.student.studentId;
});
