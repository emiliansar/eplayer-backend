import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors({
  //   origin: true,
  //   methods: 'GET,HEAD,PUT,PATCH,DELETE',
  //   allowedHeaders: 'Authorization, Content-Type',
  //   credentials: true,
  // })

  // В бэкенде
  app.use(cors({
    origin: ['http://eplayer-music.ru', 'http://localhost'], // ваши домены
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PUTCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
