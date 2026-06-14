import { createParamDecorator, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { AuthenticatedIdentity } from "./identity.ports";

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedIdentity => {
  const request = context.switchToHttp().getRequest<{ user?: AuthenticatedIdentity }>();
  if (!request.user) {
    throw new UnauthorizedException("User identity missing on request.");
  }
  return request.user;
});
