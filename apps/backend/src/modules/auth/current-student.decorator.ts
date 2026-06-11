import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { StudentIdentity } from "./identity.ports";

export const CurrentStudent = createParamDecorator((_data: unknown, context: ExecutionContext): string => {
  const request = context.switchToHttp().getRequest<{ student?: StudentIdentity }>();
  if (!request.student) {
    throw new UnauthorizedException("Student identity missing on request.");
  }
  return request.student.studentId;
});
