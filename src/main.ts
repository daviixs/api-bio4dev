import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Servir arquivos estáticos da pasta uploads
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const config = new DocumentBuilder()
    .setTitle('API Bio4Dev')
    .setDescription('API para gerenciamento de perfis, paginas e conteudo')
    .setVersion('1.0')
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Habilita validacao global e transforma os payloads em DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades nao definidas no DTO
      forbidNonWhitelisted: true, // Lanca erro se propriedades extras forem enviadas
      transform: true, // Transforma payloads em instancias de DTO
    }),
  );

  // Use PORT from env, fallback to 3000 to avoid clashes with common local services
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
