import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { extname, join } from 'path';
import { existsSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Servir arquivos estáticos da pasta uploads
  expressApp.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Servir o build do front (SPA) e fazer fallback para index.html em rotas públicas
  const clientBuildPath = join(__dirname, '..', '..', 'front-bio4dev', 'build');
  if (existsSync(clientBuildPath)) {
    expressApp.use(express.static(clientBuildPath));

    // Middleware de fallback SPA: antes do router do Nest responder 404
    app.use((req, res, next) => {
      const url = req.originalUrl || '';
      const isApiRoute =
        url.startsWith('/api') ||
        url.startsWith('/profile') ||
        url.startsWith('/auth') ||
        url.startsWith('/users') ||
        url.startsWith('/analytics') ||
        url.startsWith('/page') ||
        url.startsWith('/social') ||
        url.startsWith('/techstack') ||
        url.startsWith('/workexperience') ||
        url.startsWith('/workexperince') ||
        url.startsWith('/config') ||
        url.startsWith('/projects') ||
        url.startsWith('/link-button') ||
        url.startsWith('/upload') ||
        url.startsWith('/uploads');

      const hasFileExtension = extname(url) !== '';

      if (req.method !== 'GET' || isApiRoute || hasFileExtension) {
        return next();
      }

      return res.sendFile(join(clientBuildPath, 'index.html'));
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️  Front build não encontrado em ${clientBuildPath}. Rotas públicas (/:slug) continuarão retornando 404.`,
    );
  }

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
