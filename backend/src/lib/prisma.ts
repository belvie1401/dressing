import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mon_dressing';

// Parse URL into explicit components to avoid sslmode parsing issues with pg driver
function parseDbUrl(dbUrl: string) {
  const cleaned = dbUrl.replace(/\?.*$/, '');
  const parsed = new URL(cleaned);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 5432,
    database: parsed.pathname.replace('/', ''),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

const dbConfig = parseDbUrl(connectionString);
const isProduction = process.env.NODE_ENV === 'production' || dbConfig.host.includes('render.com');

const pool = new pg.Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  max: 10,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
