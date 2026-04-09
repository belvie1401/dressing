const pg = require('pg');

const connectionString = process.env.DATABASE_URL || '';
const cleanConnectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, '');

const pool = new pg.Pool({
  connectionString: cleanConnectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const schema = `
-- Enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('CLIENT', 'STYLIST', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "Category" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'JACKET', 'SHOES', 'ACCESSORY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'ALL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "Occasion" AS ENUM ('CASUAL', 'WORK', 'EVENING', 'SPORT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LookbookStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'LOOKBOOK', 'OUTFIT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "Plan" AS ENUM ('FREE', 'CLIENT_PRO', 'STYLIST_PRO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tables
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatar_url" TEXT,
  "role" "Role" NOT NULL DEFAULT 'CLIENT',
  "style_profile" JSONB,
  "location" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "ClothingItem" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  "bg_removed_url" TEXT,
  "category" "Category" NOT NULL,
  "colors" TEXT[] DEFAULT '{}',
  "material" TEXT,
  "season" "Season" NOT NULL DEFAULT 'ALL',
  "occasion" "Occasion" NOT NULL DEFAULT 'CASUAL',
  "brand" TEXT,
  "purchase_price" DOUBLE PRECISION,
  "purchase_date" TIMESTAMP(3),
  "wear_count" INTEGER NOT NULL DEFAULT 0,
  "last_worn_at" TIMESTAMP(3),
  "ai_tags" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClothingItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClothingItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Outfit" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "occasion" "Occasion",
  "season" "Season",
  "ai_generated" BOOLEAN NOT NULL DEFAULT false,
  "worn_count" INTEGER NOT NULL DEFAULT 0,
  "last_worn_at" TIMESTAMP(3),
  "try_on_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Outfit_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Outfit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "OutfitItem" (
  "outfit_id" TEXT NOT NULL,
  "item_id" TEXT NOT NULL,
  CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfit_id", "item_id"),
  CONSTRAINT "OutfitItem_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE,
  CONSTRAINT "OutfitItem_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "ClothingItem"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CalendarEntry" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "outfit_id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "weather_data" JSONB,
  "notes" TEXT,
  CONSTRAINT "CalendarEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CalendarEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "CalendarEntry_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StylistClient" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "stylist_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "status" "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
  "permissions" JSONB,
  "started_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StylistClient_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StylistClient_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "StylistClient_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Lookbook" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "stylist_id" TEXT NOT NULL,
  "client_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "LookbookStatus" NOT NULL DEFAULT 'DRAFT',
  "feedback" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lookbook_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Lookbook_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Lookbook_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "LookbookOutfit" (
  "lookbook_id" TEXT NOT NULL,
  "outfit_id" TEXT NOT NULL,
  CONSTRAINT "LookbookOutfit_pkey" PRIMARY KEY ("lookbook_id", "outfit_id"),
  CONSTRAINT "LookbookOutfit_lookbook_id_fkey" FOREIGN KEY ("lookbook_id") REFERENCES "Lookbook"("id") ON DELETE CASCADE,
  CONSTRAINT "LookbookOutfit_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "Outfit"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "from_id" TEXT NOT NULL,
  "to_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "metadata" JSONB,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Message_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Message_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" TEXT NOT NULL,
  "plan" "Plan" NOT NULL DEFAULT 'FREE',
  "stripe_subscription_id" TEXT,
  "status" TEXT NOT NULL,
  "current_period_end" TIMESTAMP(3),
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_user_id_key" ON "Subscription"("user_id");
`;

async function main() {
  console.log('Setting up database tables...');
  try {
    await pool.query(schema);
    console.log('Database tables created successfully!');
  } catch (err) {
    console.error('Database setup error:', err.message);
    // Don't exit with error - tables might already exist
  } finally {
    await pool.end();
  }
}

main();
