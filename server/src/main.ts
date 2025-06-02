import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // strips properties that do not have decorators
    forbidNonWhitelisted: true, // throws error if unknown properties are sent
    transform: true,   // auto-transform payloads to DTO instances
  }));
    app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

    app.enableCors({
    origin: 'http://localhost:4200',  // your Angular frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,                // if you need to send cookies/auth headers
  });
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
