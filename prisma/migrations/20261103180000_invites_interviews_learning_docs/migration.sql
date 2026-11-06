-- Anti-cheat signals
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'CUT';
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'FULLSCREEN_EXIT';
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'CONTEXT_MENU';
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'BLOCKED_SHORTCUT';
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'DEVTOOLS';
ALTER TYPE "IntegrityEventType" ADD VALUE IF NOT EXISTS 'BULK_INPUT';

-- New enums
CREATE TYPE "CredentialKind" AS ENUM ('CERTIFICATION', 'SAFETY_TICKET');
CREATE TYPE "AccessRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');
CREATE TYPE "GameKind" AS ENUM ('SYMBOL_MATCH', 'SPEED_ROUND', 'ERROR_HUNT');

-- Attempt: round wizard gate. Existing rows were already mid-round, so they
-- default to "ready"; new attempts default to false (wizard first).
ALTER TABLE "Attempt" ADD COLUMN "roundReady" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Attempt" ALTER COLUMN "roundReady" SET DEFAULT false;

ALTER TABLE "CriticalThinkingResponse" ADD COLUMN "typingStats" JSONB, ADD COLUMN "authenticity" JSONB;
ALTER TABLE "TechnicalScreeningResponse" ADD COLUMN "typingStats" JSONB, ADD COLUMN "authenticity" JSONB;

-- Invitations & access requests
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "fullName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATE',
    "targetRole" "JobRole",
    "assignStandard" BOOLEAN NOT NULL DEFAULT false,
    "technicalOnly" BOOLEAN NOT NULL DEFAULT false,
    "groupId" TEXT,
    "note" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailedAt" TIMESTAMP(3),
    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AccessRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "targetRole" "JobRole",
    "message" TEXT,
    "status" "AccessRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "invitationId" TEXT,
    CONSTRAINT "AccessRequest_pkey" PRIMARY KEY ("id")
);

-- Interviews
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Technical screening interview',
    "targetRole" "JobRole",
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "criteria" JSONB NOT NULL,
    "focusNotes" TEXT,
    "maxQuestions" INTEGER NOT NULL DEFAULT 10,
    "dueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "transcript" JSONB NOT NULL DEFAULT '[]',
    "selfRating" INTEGER,
    "expectations" JSONB,
    "scores" JSONB,
    "overallScore" DOUBLE PRECISION,
    "recommendation" TEXT,
    "summary" JSONB,
    "providers" TEXT,
    "integrity" JSONB,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Learning
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "quizScore" INTEGER,
    "quizMax" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LessonProgress_candidateId_lessonSlug_key" ON "LessonProgress"("candidateId", "lessonSlug");
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "game" "GameKind" NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "GameScore_candidateId_game_idx" ON "GameScore"("candidateId", "game");
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Documents & credentials
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "sharedWithAdmins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "DocumentShare" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DocumentShare_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DocumentShare_documentId_userId_key" ON "DocumentShare"("documentId", "userId");
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentShare" ADD CONSTRAINT "DocumentShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "kind" "CredentialKind" NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "number" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "documentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Credential_candidateId_idx" ON "Credential"("candidateId");
CREATE INDEX "Credential_expiresAt_idx" ON "Credential"("expiresAt");
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AI usage log
CREATE TABLE "AiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiUsage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AiUsage_userId_createdAt_idx" ON "AiUsage"("userId", "createdAt");
ALTER TABLE "AiUsage" ADD CONSTRAINT "AiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
