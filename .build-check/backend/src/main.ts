import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Utilise Pino pour les logs (remplace le logger par défaut de NestJS)
  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  // Configuration Helmet pour autoriser les ressources cross-origin (images, etc.)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- CONFIGURATION CORS CORRIGÉE ---
  const frontendUrl = (
    process.env.FRONTEND_URL || 'http://localhost:5173'
  ).replace(/\/+$/, '');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowedOrigins: Array<string | RegExp> = [
        frontendUrl,
        /^http:\/\/localhost(:\d+)?$/,
      ];
      if (
        !origin ||
        allowedOrigins.some((allowed) =>
          typeof allowed === 'string'
            ? origin === allowed
            : allowed.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: origin not allowed'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // -----------------------------------

  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/api/uploads', express.static(path.join(process.cwd(), uploadDir)));

  // Écoute sur le port fourni par Render ou 3000 par défaut
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Erreur lors du démarrage du serveur Immo Lamis :', err);
  process.exit(1);
});
// Fix final pour le groupe CH-PUB
