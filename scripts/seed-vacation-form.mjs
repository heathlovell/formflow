import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  // Get the first user (or create a system user)
  const users = await sql`SELECT "id" FROM "User" LIMIT 1`;

  if (users.length === 0) {
    console.log("No users found. Sign up first, then run this script.");
    return;
  }

  const userId = users[0].id;

  // Create the vacation form
  const [form] = await sql`
    INSERT INTO "Form" ("id", "title", "description", "userId")
    VALUES (
      'vacation-form',
      'Vacation Planner',
      'Tell us about your dream vacation!'
    , ${userId})
    ON CONFLICT ("id") DO NOTHING
    RETURNING "id"
  `;

  const formId = form?.id || 'vacation-form';

  // Create questions
  await sql`
    INSERT INTO "Question" ("id", "text", "type", "order", "formId")
    VALUES
      ('q1-destination', 'Where do you want to go on vacation?', 'text', 1, ${formId}),
      ('q2-timeframe', 'Do you have a timeframe in mind?', 'text', 2, ${formId})
    ON CONFLICT ("id") DO NOTHING
  `;

  console.log("Vacation form seeded! Form ID:", formId);
  console.log("View it at: http://localhost:3000/forms/vacation-form");
}

main().catch(console.error);
