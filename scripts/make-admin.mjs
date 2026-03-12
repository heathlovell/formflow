import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const result = await sql`
    UPDATE "User" SET "role" = 'admin' WHERE "email" = ${email} RETURNING "email"
  `;

  if (result.length === 0) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`User ${email} is now an admin.`);
    console.log("They must log out and log back in to pick up the new role.");
  }
}

main().catch(console.error);
