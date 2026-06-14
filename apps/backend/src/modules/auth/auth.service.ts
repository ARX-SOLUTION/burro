import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type {
  AuthLogoutResponse,
  AuthMeResponse,
  AuthSessionResponse,
  AuthSessionTokens,
  AuthUserSummary,
  LogoutSessionRequest,
  RefreshSessionRequest
} from "@burro/shared";
import type { AuthenticatedIdentity } from "./identity.ports";
import { AUTH_USER_STORE } from "./auth-user.ports";
import type { AuthUserRecord, AuthUserStorePort } from "./auth-user.ports";
import { SessionTokenService } from "./session-token.service";
import type { IssuedSessionTokens } from "./session-token.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly tokens: SessionTokenService,
    @Inject(AUTH_USER_STORE) private readonly users: AuthUserStorePort
  ) {}

  async createSession(identity: AuthenticatedIdentity): Promise<AuthSessionResponse> {
    const user = await this.getActiveUser(identity.userId);
    return { session: toSessionTokens(this.tokens.issueSession(user.id, user.role)), user: toUserSummary(user) };
  }

  async refresh(req: RefreshSessionRequest): Promise<AuthSessionResponse> {
    const claims = this.tokens.verifyRefreshToken(req.refreshToken);
    const user = await this.getActiveUser(claims.sub);
    const session = this.tokens.refreshSession(req.refreshToken);
    return { session: toSessionTokens(session), user: toUserSummary(user) };
  }

  async logout(req: LogoutSessionRequest): Promise<AuthLogoutResponse> {
    this.tokens.revokeRefreshToken(req.refreshToken);
    return { revoked: true };
  }

  async me(identity: AuthenticatedIdentity): Promise<AuthMeResponse> {
    const user = await this.getActiveUser(identity.userId);
    return { user: toUserSummary(user) };
  }

  private async getActiveUser(userId: string): Promise<AuthUserRecord> {
    const user = await this.users.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException("user not found.");
    }
    if (user.status !== "active") {
      throw new UnauthorizedException("user is not active.");
    }
    return user;
  }
}

function toSessionTokens(tokens: IssuedSessionTokens): AuthSessionTokens {
  return {
    tokenType: tokens.tokenType,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt.toISOString(),
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString()
  };
}

function toUserSummary(user: AuthUserRecord): AuthUserSummary {
  return {
    id: user.id,
    role: user.role,
    status: user.status,
    profile: {
      displayName: user.telegramFirstName,
      telegramFirstName: user.telegramFirstName,
      telegramLastName: user.telegramLastName,
      telegramUsername: user.telegramUsername,
      telegramAvatarUrl: user.telegramAvatarUrl,
      preferredLanguage: user.preferredLanguage
    }
  };
}
