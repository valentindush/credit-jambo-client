import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3003',
    credentials: true,
  });

  // Global prefix for client routes (exclude admin routes)
  app.setGlobalPrefix('api', {
    exclude: ['/admin/(.*)'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  // Swagger configuration for Client API
  const clientConfig = new DocumentBuilder()
    .setTitle('CreditJambo Client API')
    .setDescription('Digital Credit & Savings Platform - Client Application API')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User profile and account management')
    .addTag('Savings', 'Savings account operations')
    .addTag('Credit', 'Credit request and repayment management')
    .addTag('Transactions', 'Transaction history and analytics')
    .addTag('Notifications', 'User notifications management')
    .addBearerAuth()
    .build();

  const clientDocument = SwaggerModule.createDocument(app, clientConfig);
  SwaggerModule.setup('api/docs', app, clientDocument, {
    customSiteTitle: 'CreditJambo Client API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Swagger configuration for Admin API
  const adminConfig = new DocumentBuilder()
    .setTitle('CreditJambo Admin API')
    .setDescription('Admin API for CreditJambo Digital Credit & Savings Platform')
    .setVersion('1.0')
    .addTag('Admin Authentication', 'Admin authentication endpoints')
    .addTag('Admin Users Management', 'Admin user management endpoints')
    .addTag('Admin Credit Management', 'Admin credit management endpoints')
    .addTag('Admin Analytics', 'Admin analytics endpoints')
    .addBearerAuth()
    .build();

  const adminDocument = SwaggerModule.createDocument(app, adminConfig);
  SwaggerModule.setup('admin/docs', app, adminDocument, {
    customSiteTitle: 'CreditJambo Admin API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Client API Documentation: http://localhost:${port}/api/docs`);
  console.log(`📚 Admin API Documentation: http://localhost:${port}/admin/docs`);
}

bootstrap();
