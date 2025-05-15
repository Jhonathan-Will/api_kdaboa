import { NestFactory } from '@nestjs/core';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AllExceptionsFilter } from './common/filter/http-execption.filter';

import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  
  const app = await NestFactory.create(AppModule,  {cors: true});

  const allowedHeaders = process.env.CORS_ALLOWED_HEADERS || [];
  app.enableCors({
    origin: process.env.CORS_ORIGIN,
    methods: process.env.CORS_METHODS,
    allowedHeaders})

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
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
