import { Injectable } from "@nestjs/common";
import { headerValue } from "./identity.ports";
import type { AuthenticatedIdentity, IdentityPort, IdentityRequest } from "./identity.ports";
import { SessionTokenService } from "./session-token.service";

@Injectable()
export class SessionIdentityAdapter implements IdentityPort {
  constructor(
    private readonly tokens: SessionTokenService,
    private readonly fallback: IdentityPort
  ) {}

  async resolveIdentity(req: IdentityRequest): Promise<AuthenticatedIdentity> {
    const bearerToken = bearerTokenFrom(req);
    if (!bearerToken) {
      return this.fallback.resolveIdentity(req);
    }
    const claims = this.tokens.verifyAccessToken(bearerToken);
    return { userId: claims.sub, role: claims.role };
  }
}

function bearerTokenFrom(req: IdentityRequest): string | undefined {
  const authorization = headerValue(req, "authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }
  return token;
}
