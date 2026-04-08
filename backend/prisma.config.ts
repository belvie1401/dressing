import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { env } from 'prisma/config';

const databaseUrl = env('DATABASE_URL') ?? 'postgresql://mondressing:mondressing_secret@localhost:5432/mon_dressing';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    url: databaseUrl,
  },
});
