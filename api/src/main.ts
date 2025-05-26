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

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);

  app.use('/favicon.ico', express.static(join(__dirname, '..', 'favicon.ico')));

  const allowedHeaders = process.env.CORS_ALLOWED_HEADERS?.split(',') || [];

  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders})

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

  app.useGlobalFilters( new AllExceptionsFilter() );

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

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
