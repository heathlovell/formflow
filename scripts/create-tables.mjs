import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "name" TEXT,
      "email" TEXT NOT NULL,
      "hashedPassword" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Form" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "userId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Form_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Question" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "text" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'text',
      "order" INTEGER NOT NULL,
      "formId" TEXT NOT NULL,
      CONSTRAINT "Question_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Question_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Submission" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "formId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Submission_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Answer" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "value" TEXT NOT NULL,
      "questionId" TEXT NOT NULL,
      "submissionId" TEXT NOT NULL,
      CONSTRAINT "Answer_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE,
      CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE
    )
  `;

  console.log("All tables created successfully!");
}

main().catch(console.error);
