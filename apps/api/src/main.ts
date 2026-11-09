import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SWAGGER_PATH, setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(','),
    credentials: true,
  });

  setupSwagger(app);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API đang chạy tại http://localhost:${port} (Swagger: /${SWAGGER_PATH})`);
}

void bootstrap();
