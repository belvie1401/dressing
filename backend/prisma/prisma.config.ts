import path from 'node:path';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://mondressing:mondressing_secret@localhost:5432/mon_dressing';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  datasource: {
    async url() {
      return databaseUrl;
    },
  },
  migrate: {
    async url() {
      return databaseUrl;
    },
  },
});
