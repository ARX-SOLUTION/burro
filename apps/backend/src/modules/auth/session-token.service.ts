import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { UserRole } from "@burro/shared";
import { UnauthorizedError } from "./identity.ports";

type TokenKind = "access" | "refresh";

export interface SessionTokenOptions {
  accessTokenTtlSeconds?: number;
  refreshTokenTtlSeconds?: number;
}

export interface SessionTokenClaims {
  sub: string;
  role: UserRole;
  typ: TokenKind;
  iat: number;
  exp: number;
  jti: string;
}

export interface IssuedSessionTokens {
  tokenType: "Bearer";
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

const DEFAULT_ACCESS_TTL_SECONDS = 15 * 60;
const DEFAULT_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60;

export class SessionTokenService {
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlSeconds: number;
  private readonly revokedRefreshTokenIds = new Set<string>();

  constructor(
    private readonly secret: string,
    options: SessionTokenOptions = {}
  ) {
    this.accessTokenTtlSeconds = options.accessTokenTtlSeconds ?? DEFAULT_ACCESS_TTL_SECONDS;
    this.refreshTokenTtlSeconds = options.refreshTokenTtlSeconds ?? DEFAULT_REFRESH_TTL_SECONDS;
  }

  issueSession(userId: string, role: UserRole, now: Date = new Date()): IssuedSessionTokens {
    const accessClaims = this.createClaims(userId, role, "access", this.accessTokenTtlSeconds, now);
    const refreshClaims = this.createClaims(userId, role, "refresh", this.refreshTokenTtlSeconds, now);
    return {
      tokenType: "Bearer",
      accessToken: this.sign(accessClaims),
      refreshToken: this.sign(refreshClaims),
      accessTokenExpiresAt: secondsToDate(accessClaims.exp),
      refreshTokenExpiresAt: secondsToDate(refreshClaims.exp)
    };
  }

  verifyAccessToken(token: string, now: Date = new Date()): SessionTokenClaims {
    const claims = this.verify(token, "access", now);
    return claims;
  }

  verifyRefreshToken(token: string, now: Date = new Date()): SessionTokenClaims {
    const claims = this.verify(token, "refresh", now);
    if (this.revokedRefreshTokenIds.has(claims.jti)) {
      throw new UnauthorizedError("refresh token has been revoked.");
    }
    return claims;
  }

  refreshSession(refreshToken: string, now: Date = new Date()): IssuedSessionTokens {
    const claims = this.verifyRefreshToken(refreshToken, now);
    this.revokedRefreshTokenIds.add(claims.jti);
    return this.issueSession(claims.sub, claims.role, now);
  }

  revokeRefreshToken(refreshToken: string, now: Date = new Date()): void {
    const claims = this.verifyRefreshToken(refreshToken, now);
    this.revokedRefreshTokenIds.add(claims.jti);
  }

  private createClaims(
    userId: string,
    role: UserRole,
    typ: TokenKind,
    ttlSeconds: number,
    now: Date
  ): SessionTokenClaims {
    const issuedAt = Math.floor(now.getTime() / 1000);
    return {
      sub: userId,
      role,
      typ,
      iat: issuedAt,
      exp: issuedAt + ttlSeconds,
      jti: randomUUID()
    };
  }

  private sign(claims: SessionTokenClaims): string {
    const header = encodeJson({ alg: "HS256", typ: "JWT" });
    const payload = encodeJson(claims);
    const signature = this.signature(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
  }

  private verify(token: string, expectedType: TokenKind, now: Date): SessionTokenClaims {
    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra !== undefined) {
      throw new UnauthorizedError("session token is malformed.");
    }
    const expectedSignature = this.signature(`${header}.${payload}`);
    if (!safeEqual(signature, expectedSignature)) {
      throw new UnauthorizedError("session token signature mismatch.");
    }
    const claims = parseClaims(payload);
    if (claims.typ !== expectedType) {
      throw new UnauthorizedError(`expected ${expectedType} token.`);
    }
    if (claims.exp <= Math.floor(now.getTime() / 1000)) {
      throw new UnauthorizedError("session token has expired.");
    }
    return claims;
  }

  private signature(value: string): string {
    return createHmac("sha256", this.secret).update(value).digest("base64url");
  }
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function parseClaims(payload: string): SessionTokenClaims {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    throw new UnauthorizedError("session token payload is invalid.");
  }
  if (!isClaims(parsed)) {
    throw new UnauthorizedError("session token payload is malformed.");
  }
  return parsed;
}

function isClaims(value: unknown): value is SessionTokenClaims {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<SessionTokenClaims>;
  return (
    typeof candidate.sub === "string" &&
    Object.values(UserRole).includes(candidate.role as UserRole) &&
    (candidate.typ === "access" || candidate.typ === "refresh") &&
    typeof candidate.iat === "number" &&
    typeof candidate.exp === "number" &&
    typeof candidate.jti === "string"
  );
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function secondsToDate(seconds: number): Date {
  return new Date(seconds * 1000);
}
