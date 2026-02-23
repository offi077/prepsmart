import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  // ─── Swagger / OpenAPI ─────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Mission Control API')
    .setDescription(
      'Backend API for PrepSmart — competitive exam preparation platform. ' +
      'Covers authentication, exams, quizzes, courses, blog, downloads, ' +
      'current affairs, notifications, payments, analytics, study teams, ' +
      'mentorship, and tasks.',
    )
    .setVersion('1.0')
    .setContact('PrepSmart Team', 'https://github.com/offi077/prepsmart', '')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'JWT',
    )
    .addTag('Auth', 'Registration & login')
    .addTag('Users', 'User profile management')
    .addTag('Exams', 'Exam management & sessions')
    .addTag('Quizzes', 'Quiz management & attempts')
    .addTag('Courses', 'Course management & enrollment')
    .addTag('Blog', 'Blog posts & articles')
    .addTag('Current Affairs', 'Current affairs articles')
    .addTag('Downloads', 'Downloadable resources')
    .addTag('Notifications', 'In-app notifications')
    .addTag('Payments', 'Subscription plans & payments')
    .addTag('Analytics', 'Performance & business analytics')
    .addTag('Study Teams', 'Collaborative study groups')
    .addTag('Mentorship', 'Mentor-student sessions')
    .addTag('Tasks', 'Task assignment & tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Mission Control API running on http://localhost:${port}/api`);
  console.log(`📖 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

