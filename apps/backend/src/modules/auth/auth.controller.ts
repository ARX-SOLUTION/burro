import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from "@nestjs/common";
import {
  logoutSessionRequestSchema,
  refreshSessionRequestSchema,
  type LogoutSessionRequest,
  type RefreshSessionRequest
} from "@burro/shared";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { UnauthorizedError, type AuthenticatedIdentity } from "./identity.ports";

@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("refresh")
  async refresh(@Body(new ZodValidationPipe(refreshSessionRequestSchema)) body: RefreshSessionRequest) {
    try {
      return await this.service.refresh(body);
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Post("logout")
  async logout(@Body(new ZodValidationPipe(logoutSessionRequestSchema)) body: LogoutSessionRequest) {
    try {
      return await this.service.logout(body);
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: AuthenticatedIdentity) {
    return this.service.me(user);
  }
}

function toHttpError(error: unknown): unknown {
  if (error instanceof UnauthorizedError) {
    return new UnauthorizedException(error.message);
  }
  return error;
}
