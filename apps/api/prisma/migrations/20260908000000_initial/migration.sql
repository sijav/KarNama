-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ModerationState" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "postingUrl" TEXT,
    "location" TEXT,
    "employmentType" TEXT,
    "jobLevel" TEXT,
    "experience" TEXT,
    "salary" TEXT,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "source" TEXT,
    "description" TEXT,
    "skills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_history" (
    "id" TEXT NOT NULL,
    "jobRecordId" TEXT NOT NULL,
    "fromStatusId" TEXT,
    "toStatusId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "social" TEXT,
    "jobRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "jobRecordId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_references" (
    "id" TEXT NOT NULL,
    "jobRecordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_submissions" (
    "id" TEXT NOT NULL,
    "jobRecordId" TEXT NOT NULL,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "body" TEXT NOT NULL,
    "suggestedChanges" JSONB,
    "state" "ModerationState" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "statuses_userId_idx" ON "statuses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_userId_position_key" ON "statuses"("userId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "statuses_userId_name_key" ON "statuses"("userId", "name");

-- CreateIndex
CREATE INDEX "job_records_userId_statusId_idx" ON "job_records"("userId", "statusId");

-- CreateIndex
CREATE INDEX "job_records_userId_company_idx" ON "job_records"("userId", "company");

-- CreateIndex
CREATE INDEX "status_history_jobRecordId_changedAt_idx" ON "status_history"("jobRecordId", "changedAt");

-- CreateIndex
CREATE INDEX "contacts_userId_idx" ON "contacts"("userId");

-- CreateIndex
CREATE INDEX "contacts_jobRecordId_idx" ON "contacts"("jobRecordId");

-- CreateIndex
CREATE INDEX "notes_jobRecordId_createdAt_idx" ON "notes"("jobRecordId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "file_references_storageKey_key" ON "file_references"("storageKey");

-- CreateIndex
CREATE INDEX "file_references_jobRecordId_idx" ON "file_references"("jobRecordId");

-- CreateIndex
CREATE INDEX "feedback_submissions_state_createdAt_idx" ON "feedback_submissions"("state", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_submissions_jobRecordId_idx" ON "feedback_submissions"("jobRecordId");

-- AddForeignKey
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_records" ADD CONSTRAINT "job_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_records" ADD CONSTRAINT "job_records_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "job_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_fromStatusId_fkey" FOREIGN KEY ("fromStatusId") REFERENCES "statuses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_history" ADD CONSTRAINT "status_history_toStatusId_fkey" FOREIGN KEY ("toStatusId") REFERENCES "statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "job_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "job_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_references" ADD CONSTRAINT "file_references_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "job_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_jobRecordId_fkey" FOREIGN KEY ("jobRecordId") REFERENCES "job_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_submissions" ADD CONSTRAINT "feedback_submissions_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

