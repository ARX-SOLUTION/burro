import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { EnvelopeInterceptor } from "./common/envelope.interceptor";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000, "0.0.0.0");
}

void bootstrap();
