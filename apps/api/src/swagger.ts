import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { patchNestJsSwagger } from 'nestjs-zod';

/** Đường dẫn tài liệu API: giao diện tại /docs, JSON OpenAPI tại /docs-json. */
export const SWAGGER_PATH = 'docs';

/** Cài Swagger. DTO tạo từ zod schema (`createZodDto`) được hiển thị nhờ `patchNestJsSwagger`. */
export function setupSwagger(app: INestApplication) {
  patchNestJsSwagger();
  const config = new DocumentBuilder()
    .setTitle('Evolve API')
    .setDescription(
      'REST API của Evolve Web. Bấm "Authorize" và dán accessToken để gọi route cần JWT.',
    )
    .setVersion('0.3.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
