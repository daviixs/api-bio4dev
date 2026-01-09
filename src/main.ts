import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

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

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
