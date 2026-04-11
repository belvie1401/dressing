// This file mirrors backend/prisma.config.ts for tooling that resolves
// config relative to the schema file location.
import path from 'node:path';
import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl =
  process.env.DATABASE_URL ||
  'postgresql://mondressing:mondressing_secret@localhost:5432/mon_dressing';

const directUrl = process.env.DIRECT_URL || databaseUrl;

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    url: directUrl,
  },
  migrate: {
    url: directUrl,
  },
});
