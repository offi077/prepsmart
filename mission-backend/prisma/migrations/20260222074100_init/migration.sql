-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'EMPLOYEE', 'ADMIN', 'MENTOR', 'SUPER_ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmployeeCategoryEnum" AS ENUM ('SUBJECT_MATTER_EXPERT', 'CONTENT_CREATOR', 'TEST_DEVELOPER', 'QUALITY_REVIEWER', 'CONTENT_MODERATOR', 'TECHNICAL_SUPPORT', 'REGIONAL_COORDINATOR');

-- CreateEnum
CREATE TYPE "ExamLevelEnum" AS ENUM ('PRELIMS', 'MAINS', 'BOTH');

-- CreateEnum
CREATE TYPE "QuestionTypeEnum" AS ENUM ('MCQ', 'MSQ', 'NUMERICAL');

-- CreateEnum
CREATE TYPE "DifficultyEnum" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuizTypeEnum" AS ENUM ('DAILY', 'RAPID_FIRE', 'MINI_TEST', 'SECTIONAL', 'FULL_PRELIMS', 'FULL_MAINS', 'SPEED_CHALLENGE');

-- CreateEnum
CREATE TYPE "BlogStatusEnum" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskStatusEnum" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskTypeEnum" AS ENUM ('CONTENT_CREATION', 'REVIEW', 'TEST_DEVELOPMENT', 'MODERATION', 'COORDINATION');

-- CreateEnum
CREATE TYPE "PriorityEnum" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SessionStatusEnum" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionStatusEnum" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateEnum
CREATE TYPE "NotificationTypeEnum" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'REMINDER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "avatar" TEXT,
    "targetExam" TEXT,
    "secondaryExam" TEXT,
    "examCategory" TEXT,
    "state" TEXT,
    "employeeCategory" "EmployeeCategoryEnum",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "examLevel" "ExamLevelEnum" NOT NULL,
    "totalDuration" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "instructions" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "questionsCount" INTEGER NOT NULL,
    "duration" INTEGER,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "QuestionTypeEnum" NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" JSONB NOT NULL,
    "marks" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "explanation" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "answers" JSONB,
    "score" DOUBLE PRECISION,
    "totalMarks" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "sectionScores" JSONB,
    "isSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "timeTaken" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "type" "QuizTypeEnum" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "difficulty" "DifficultyEnum" NOT NULL,
    "examLevel" "ExamLevelEnum" NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB,
    "score" DOUBLE PRECISION,
    "timeTaken" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "subjects" JSONB,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "content" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT NOT NULL,
    "tags" JSONB,
    "authorId" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" "BlogStatusEnum" NOT NULL DEFAULT 'DRAFT',
    "scheduledDate" TIMESTAMP(3),
    "publishedDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "readTime" INTEGER,
    "seoMeta" JSONB,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "plagiarismScore" DOUBLE PRECISION,
    "sources" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_affairs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "tags" JSONB,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_affairs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxMembers" INTEGER NOT NULL DEFAULT 10,
    "createdById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_sessions" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "SessionStatusEnum" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorship_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskTypeEnum" NOT NULL,
    "priority" "PriorityEnum" NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "assignedById" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "status" "TaskStatusEnum" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationTypeEnum" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "period" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doubt_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "tags" JSONB,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doubt_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doubt_replies" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doubt_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "exam_categories_name_key" ON "exam_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "exam_categories_slug_key" ON "exam_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_userId_courseId_key" ON "course_enrollments"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_slug_key" ON "blogs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "study_team_members_teamId_userId_key" ON "study_team_members"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "exam_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "exam_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "exam_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_teams" ADD CONSTRAINT "study_teams_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_team_members" ADD CONSTRAINT "study_team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "study_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_team_members" ADD CONSTRAINT "study_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "payment_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doubt_posts" ADD CONSTRAINT "doubt_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doubt_replies" ADD CONSTRAINT "doubt_replies_postId_fkey" FOREIGN KEY ("postId") REFERENCES "doubt_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doubt_replies" ADD CONSTRAINT "doubt_replies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
