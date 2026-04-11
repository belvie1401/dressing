import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

// Load .env so DATABASE_URL / DIRECT_URL are available to Prisma CLI commands
dotenv.config({ path: path.join(__dirname, '.env') });

// Pooled URL — used by the app at runtime via PrismaPg adapter
const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://mondressing:mondressing_secret@localhost:5432/mon_dressing';

// Direct (non-pooled) URL — used by Prisma CLI (db pull, migrate)
const directUrl = process.env.DIRECT_URL || databaseUrl;

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    // CLI commands (db pull, introspect) use the direct URL
    url: directUrl,
  },
  migrate: {
    // Migrations also use the direct URL
    url: directUrl,
  },
});
