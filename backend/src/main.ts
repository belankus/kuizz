import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.set('trust proxy', 1);
  app.use(cookieParser());

  // Configuration CORS incluant votre nom de domaine
  app.enableCors({
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.getHttpAdapter().getInstance().get('/health', (_request, response) => {
    response.sendStatus(200);
  });

  // Utilisation dynamique du port Render
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
}
await bootstrap();