const pg = require('pg');

const connectionString = process.env.DATABASE_URL || '';

// Parse URL into explicit components
function parseDbUrl(dbUrl) {
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

// Extract internal hostname (without .oregon-postgres.render.com)
const internalHost = dbConfig.host.replace(/\.oregon-postgres\.render\.com$/, '');

console.log('Database config:');
console.log('  External host:', dbConfig.host);
console.log('  Internal host:', internalHost);
console.log('  Port:', dbConfig.port);
console.log('  Database:', dbConfig.database);
console.log('  User:', dbConfig.user);
console.log('  Node version:', process.version);

const schema = `
DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('CLIENT', 'STYLIST', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Category" AS ENUM ('TOP', 'BOTTOM', 'DRESS', 'JACKET', 'SHOES', 'ACCESSORY'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Season" AS ENUM ('SUMMER', 'WINTER', 'ALL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Occasion" AS ENUM ('CASUAL', 'WORK', 'EVENING', 'SPORT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'ENDED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "LookbookStatus" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'REJECTED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'LOOKBOOK', 'OUTFIT'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "Plan" AS ENUM ('FREE', 'CLIENT_PRO', 'STYLIST_PRO'); EXCEPTION WHEN duplicate_object THEN null; END $$;

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

CREATE TABLE IF NOT EXISTS "MagicLinkToken" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MagicLinkToken_token_key" ON "MagicLinkToken"("token");
CREATE INDEX IF NOT EXISTS "MagicLinkToken_email_idx" ON "MagicLinkToken"("email");
CREATE INDEX IF NOT EXISTS "MagicLinkToken_token_idx" ON "MagicLinkToken"("token");

-- Migrations for stylist workspace
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'MessageType' AND e.enumlabel = 'ZOOM_LINK'
  ) THEN
    ALTER TYPE "MessageType" ADD VALUE 'ZOOM_LINK';
  END IF;
END $$;

ALTER TABLE "CalendarEntry" ALTER COLUMN "outfit_id" DROP NOT NULL;
ALTER TABLE "CalendarEntry" ADD COLUMN IF NOT EXISTS "client_id" TEXT;
ALTER TABLE "CalendarEntry" ADD COLUMN IF NOT EXISTS "event_type" TEXT;
ALTER TABLE "CalendarEntry" ADD COLUMN IF NOT EXISTS "duration_min" INTEGER;
ALTER TABLE "CalendarEntry" ADD COLUMN IF NOT EXISTS "zoom_link" TEXT;
ALTER TABLE "CalendarEntry" ADD COLUMN IF NOT EXISTS "title" TEXT;

-- Lookbook portfolio fields
ALTER TABLE "Lookbook" ALTER COLUMN "client_id" DROP NOT NULL;
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "type" TEXT;
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "price" INTEGER;
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "photos" TEXT[] DEFAULT '{}';
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "before_photos" TEXT[] DEFAULT '{}';
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "after_photos" TEXT[] DEFAULT '{}';
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lookbook" ADD COLUMN IF NOT EXISTS "favorite_count" INTEGER NOT NULL DEFAULT 0;

-- Wallet + Transactions
DO $$ BEGIN CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'WITHDRAWN'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "StylistWallet" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "stylist_id" TEXT NOT NULL,
  "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pending_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "stripe_account_id" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StylistWallet_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StylistWallet_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "StylistWallet_stylist_id_key" ON "StylistWallet"("stylist_id");

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "stylist_id" TEXT NOT NULL,
  "client_id" TEXT,
  "session_id" TEXT,
  "gross_amount" DOUBLE PRECISION NOT NULL,
  "platform_fee" DOUBLE PRECISION NOT NULL,
  "net_amount" DOUBLE PRECISION NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
  "stripe_payment_intent_id" TEXT,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Transaction_stylist_id_fkey" FOREIGN KEY ("stylist_id") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Transaction_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "Transaction_stylist_id_idx" ON "Transaction"("stylist_id");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

-- Dual role fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "active_role" TEXT NOT NULL DEFAULT 'CLIENT';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_dual_role" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "active_role" = 'STYLIST' WHERE "role" = 'STYLIST' AND "active_role" = 'CLIENT';

-- Referral fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referral_code" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referred_by" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referral_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "free_months_earned" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS "User_referral_code_key" ON "User"("referral_code");
UPDATE "User" SET "referral_code" = 'LIEN-' || UPPER(SUBSTRING("id", 1, 6)) WHERE "referral_code" IS NULL;

-- Clothing item: name + photo dedup
ALTER TABLE "ClothingItem" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "ClothingItem" ADD COLUMN IF NOT EXISTS "photo_hash" TEXT;
CREATE INDEX IF NOT EXISTS "ClothingItem_user_id_photo_hash_idx" ON "ClothingItem"("user_id", "photo_hash");

-- Clothing item: back photo + 360° view
ALTER TABLE "ClothingItem" ADD COLUMN IF NOT EXISTS "photo_back_url" TEXT;
ALTER TABLE "ClothingItem" ADD COLUMN IF NOT EXISTS "photo_back_removed" TEXT;
ALTER TABLE "ClothingItem" ADD COLUMN IF NOT EXISTS "has_360_view" BOOLEAN NOT NULL DEFAULT false;
`;

// Try multiple connection strategies
const strategies = [
  {
    name: 'Internal host (no SSL)',
    config: {
      host: internalHost,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: false,
      connectionTimeoutMillis: 10000,
    },
  },
  {
    name: 'External host + SSL rejectUnauthorized=false',
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 30000,
    },
  },
  {
    name: 'External host + SSL with servername',
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: { rejectUnauthorized: false, servername: dbConfig.host },
      connectionTimeoutMillis: 30000,
    },
  },
  {
    name: 'External host + SSL true',
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: true,
      connectionTimeoutMillis: 30000,
    },
  },
  {
    name: 'Connection string with sslmode=require',
    config: {
      connectionString: connectionString.includes('sslmode=')
        ? connectionString
        : connectionString + (connectionString.includes('?') ? '&' : '?') + 'sslmode=require',
      connectionTimeoutMillis: 30000,
    },
  },
];

async function tryConnect() {
  for (const strategy of strategies) {
    console.log(`\nTrying: ${strategy.name}...`);
    const client = new pg.Client(strategy.config);
    try {
      await client.connect();
      console.log(`SUCCESS with: ${strategy.name}`);
      return { client, strategyName: strategy.name };
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      try { await client.end(); } catch (_) {}
    }
  }
  throw new Error('All connection strategies failed');
}

async function main() {
  console.log('Setting up database tables...');
  let client;
  try {
    const result = await tryConnect();
    client = result.client;
    console.log(`\nConnected via: ${result.strategyName}`);
    console.log('Running schema...');
    await client.query(schema);
    console.log('Database tables created successfully!');
  } catch (err) {
    console.error('Database setup error:', err.message);
    process.exit(1);
  } finally {
    if (client) {
      try { await client.end(); } catch (_) {}
    }
  }
}

main();
