import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IDENTITY_PORT, UnauthorizedError } from "./identity.ports";
import type { IdentityPort, IdentityRequest, StudentIdentity } from "./identity.ports";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(IDENTITY_PORT) private readonly identity: IdentityPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IdentityRequest & { student?: StudentIdentity }>();
    try {
      request.student = await this.identity.resolveStudent(request);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
