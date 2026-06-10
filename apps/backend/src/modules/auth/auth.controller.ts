import { Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post("telegram-miniapp/login")
  telegramMiniappLogin() { return { status: "todo", flow: "telegram-miniapp" }; }

  @Post("web-code/request")
  requestWebCode() { return { status: "todo", flow: "web-code-request" }; }

  @Post("web-code/verify")
  verifyWebCode() { return { status: "todo", flow: "web-code-verify" }; }

  @Get("me")
  me() { return { status: "todo", user: null }; }
}
