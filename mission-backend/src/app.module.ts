import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ExamsModule } from './exams/exams.module.js';
import { QuizzesModule } from './quizzes/quizzes.module.js';
import { CoursesModule } from './courses/courses.module.js';
import { BlogModule } from './blog/blog.module.js';
import { ContentModule } from './content/content.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PaymentsModule } from './payments/payments.module.js';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { StudyTeamsModule } from './study-teams/study-teams.module.js';
import { MentorshipModule } from './mentorship/mentorship.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ExamsModule,
    QuizzesModule,
    CoursesModule,
    BlogModule,
    ContentModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    StudyTeamsModule,
    MentorshipModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
