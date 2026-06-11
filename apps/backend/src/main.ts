import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { EnvelopeInterceptor } from "./common/envelope.interceptor";
import { appConfig } from "./config";

async function bootstrap() {
  // Validate env before Nest boots so misconfiguration fails fast with a clear message.
  const config = appConfig();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  await app.listen(config.port, "0.0.0.0");
}

void bootstrap();
