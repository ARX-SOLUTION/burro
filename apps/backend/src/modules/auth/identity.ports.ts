import { UserRole } from "@burro/shared";

// Structural subset of FastifyRequest. fastify is not a direct dependency under
// pnpm strict node_modules, so the identity seam depends only on the header shape it reads.
export interface IdentityRequest {
  headers: Record<string, string | string[] | undefined>;
}

export interface AuthenticatedIdentity {
  userId: string;
  role: UserRole;
}

export interface StudentIdentity extends AuthenticatedIdentity {
  studentId: string;
  role: UserRole.Student;
}

export interface IdentityPort {
  resolveIdentity(req: IdentityRequest): Promise<AuthenticatedIdentity>;
}

export const IDENTITY_PORT = Symbol("IDENTITY_PORT");

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function headerValue(req: IdentityRequest, name: string): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}
