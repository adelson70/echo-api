process.loadEnvFile();

import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvironmentValidator } from './infra/config/env';
import helmet from 'helmet';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import gracefulShutdown from 'http-graceful-shutdown';
import { z } from 'zod';
import basicAuth from 'express-basic-auth';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { PermissaoGuard } from './common/guards/permissao.guard';
import { PrismaReadService } from './infra/database/prisma/prisma-read.service';

z.config(z.locales.pt());

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  EnvironmentValidator.validate();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isDevelopment = process.env.NODE_ENV === 'development';

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Configurar arquivos estáticos para o Swagger
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  // Configurar Helmet com exceções para o Swagger
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`, `'unsafe-eval'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        },
      },
    }),
  );

  app.useGlobalGuards(new RateLimitGuard());
  app.useGlobalGuards(new PermissaoGuard(new Reflector(), app.get(PrismaReadService)));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  if (isDevelopment) {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER as string]: process.env
            .SWAGGER_PASS as string,
        },
      }),
    );
  
    const config = new DocumentBuilder()
      .setTitle('Echo API')
      .setDescription('Documentação da API Echo')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addSecurityRequirements('JWT-auth')
      .build();
  
    const document = SwaggerModule.createDocument(app, config);
  
    const swaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };
  
    SwaggerModule.setup('/docs', app, document, swaggerCustomOptions);
  
  }
    
  gracefulShutdown(app.getHttpServer());

  await app.listen(process.env.PORT ?? 5000);

  logger.log(`🚀 Aplicação iniciada com sucesso!`);
}

void bootstrap();
