import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filter/http-execption.filter';

import * as dotenv from 'dotenv';

import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf'

import { join } from 'path';

dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.use('/favicon.ico', express.static(join(__dirname, '..', 'favicon.ico')));

  // CORS config com log
  const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean);
  const allowedMethods = process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const allowedHeaders = process.env.CORS_ALLOWED_HEADERS || 'Authorization,Content-Type,Application-json,Access-Control-Allow-Credentials,Access-Control-Allow-Origin,X-Requested-With,x-csrf-token';

  console.log('CORS config:', {
    allowedOrigins,
    allowedMethods,
    allowedHeaders
  });

  app.enableCors({
    origin: function (origin, callback) {
      // Permite requests sem origin (ex: mobile, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error('CORS blocked:', origin);
        return callback(new Error('Not allowed by CORS'), false);
      }
    },
    methods: allowedMethods,
    allowedHeaders: allowedHeaders,
    credentials: true,
  });

  app.use(cookieParser());

  const {
    doubleCsrfProtection,
    validateRequest,
    generateCsrfToken,
    invalidCsrfTokenError
  } = doubleCsrf({
    getSecret: () => process.env.SECRET || 'default_secret',
    cookieName: 'x-csrf-token',
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
    getSessionIdentifier: (req) => {
      return req.ip || 'anon';
    },
    getCsrfTokenFromRequest: (req) => {
      return req.headers['x-csrf-token'] as string;
    },
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      errors.forEach((error) => {
        throw new HttpException({
          status: 400,
          error: error.constraints,
        }, 400)
      })
    }
  }))

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle("API KdABoa")
    .setDescription("API para o projeto KdABoa")
    .setVersion("1.0")
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }, 'Authorization')
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory)

  console.log('process.env.PORT:', process.env.PORT);
  const port = 3000;
  await app.listen(port);
  console.log(`Servidor rodando na porta ${port}`);
}

bootstrap();
