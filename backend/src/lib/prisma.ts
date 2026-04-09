import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mon_dressing';

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
const needsSSL = dbConfig.host.includes('neon.tech') || dbConfig.host.includes('render.com') || process.env.NODE_ENV === 'production';

console.log('DB config:', { host: dbConfig.host, port: dbConfig.port, database: dbConfig.database, ssl: needsSSL });

const pool = new pg.Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 30000,
  max: 10,
});
pool.on('error', () => {});

const setupSchema = `
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('CLIENT', 'STYLIST', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Category" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'JACKET', 'SHOES', 'ACCESSORY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'ALL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Occasion" AS ENUM ('CASUAL', 'WORK', 'EVENING', 'SPORT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "LookbookStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'LOOKBOOK', 'OUTFIT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Plan" AS ENUM ('FREE', 'CLIENT_PRO', 'STYLIST_PRO'); EXCEPTION WHEN duplicate_object THEN null; END $$;
CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "avatar_url" TEXT, "role" "Role" NOT NULL DEFAULT 'CLIENT', "style_profile" JSONB, "location" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE TABLE IF NOT EXISTS "ClothingItem" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "user_id" TEXT NOT NULL, "photo_url" TEXT NOT NULL, "bg_removed_url" TEXT, "category" "Category" NOT NULL, "colors" TEXT[] DEFAULT '{}', "material" TEXT, "season" "Season" NOT NULL DEFAULT 'ALL', "occasion" "Occasion" NOT NULL DEFAULT 'CASUAL', "brand" TEXT, "purchase_price" DOUBLE PRECISION, "purchase_date" TIMESTAMP(3), "wear_count" INTEGER NOT NULL DEFAULT 0, "last_worn_at" TIMESTAMP(3), "ai_tags" JSONB, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ClothingItem_pkey" PRIMARY KEY ("id"), CONSTRAINT "ClothingItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "Outfit" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "user_id" TEXT NOT NULL, "name" TEXT NOT NULL, "occasion" "Occasion", "season" "Season", "ai_generated" BOOLEAN NOT NULL DEFAULT false, "worn_count" INTEGER NOT NULL DEFAULT 0, "last_worn_at" TIMESTAMP(3), "try_on_url" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id"), CONSTRAINT "Outfit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "OutfitItem" ("outfit_id" TEXT NOT NULL, "item_id" TEXT NOT NULL, CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfit_id", "item_id"), CONSTRAINT "OutfitItem_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE, CONSTRAINT "OutfitItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "ClothingItem"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "CalendarEntry" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "user_id" TEXT NOT NULL, "outfit_id" TEXT NOT NULL, "date" TIMESTAMP(3) NOT NULL, "weather_data" JSONB, "notes" TEXT, CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id"), CONSTRAINT "CalendarEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE, CONSTRAINT "CalendarEntry_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "StylistClient" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "stylist_id" TEXT NOT NULL, "client_id" TEXT NOT NULL, "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING', "permissions" JSONB, "started_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "StylistClient_pkey" PRIMARY KEY ("id"), CONSTRAINT "StylistClient_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE, CONSTRAINT "StylistClient_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "Lookbook" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "stylist_id" TEXT NOT NULL, "client_id" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "status" "LookbookStatus" NOT NULL DEFAULT 'DRAFT', "feedback" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Lookbook_pkey" PRIMARY KEY ("id"), CONSTRAINT "Lookbook_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE, CONSTRAINT "Lookbook_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "LookbookOutfit" ("lookbook_id" TEXT NOT NULL, "outfit_id" TEXT NOT NULL, CONSTRAINT "LookbookOutfit_pkey" PRIMARY KEY ("lookbook_id", "outfit_id"), CONSTRAINT "LookbookOutfit_lookbook_id_fkey" FOREIGN KEY ("lookbook_id") REFERENCES "Lookbook"("id") ON DELETE CASCADE, CONSTRAINT "LookbookOutfit_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "Message" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "from_id" TEXT NOT NULL, "to_id" TEXT NOT NULL, "content" TEXT NOT NULL, "type" "MessageType" NOT NULL DEFAULT 'TEXT', "metadata" JSONB, "read_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Message_pkey" PRIMARY KEY ("id"), CONSTRAINT "Message_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE CASCADE, CONSTRAINT "Message_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "Subscription" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "user_id" TEXT NOT NULL, "plan" "Plan" NOT NULL DEFAULT 'FREE', "stripe_subscription_id" TEXT, "status" TEXT NOT NULL, "current_period_end" TIMESTAMP(3), CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"), CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_user_id_key" ON "Subscription"("user_id");
`;

let prisma: PrismaClient;

export async function initDatabase(): Promise<PrismaClient> {
  if (prisma) return prisma;

  // Try connecting with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`DB connection attempt ${attempt}/3...`);
      const client = await pool.connect();
      console.log('Connected! Creating tables...');
      await client.query(setupSchema);
      console.log('Tables created successfully!');
      client.release();

      const adapter = new PrismaPg(pool);
      prisma = new PrismaClient({ adapter });
      return prisma;
    } catch (err: any) {
      console.error(`  Attempt ${attempt} failed:`, err.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, 5000));
    }
  }

  throw new Error('Database connection failed after 3 attempts');
}

export default new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prisma) throw new Error('Database not initialized. Call initDatabase() first.');
    return (prisma as any)[prop];
  },
});
