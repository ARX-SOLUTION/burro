import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@burro/shared";
import { IDENTITY_PORT, UnauthorizedError } from "./identity.ports";
import type { AuthenticatedIdentity, IdentityPort, IdentityRequest, StudentIdentity } from "./identity.ports";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(IDENTITY_PORT) private readonly identity: IdentityPort) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      IdentityRequest & { user?: AuthenticatedIdentity; student?: StudentIdentity }
    >();
    try {
      const identity = await this.identity.resolveIdentity(request);
      request.user = identity;
      if (identity.role === UserRole.Student) {
        request.student = { ...identity, studentId: identity.userId, role: UserRole.Student };
      }
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new UnauthorizedException(error.message);
      }
      throw error;
    }
  }
}
