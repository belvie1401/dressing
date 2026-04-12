-- AlterEnum: Add new plan values
ALTER TYPE "Plan" ADD VALUE 'ESSENTIAL';
ALTER TYPE "Plan" ADD VALUE 'FAMILY';
ALTER TYPE "Plan" ADD VALUE 'PREMIUM';
ALTER TYPE "Plan" ADD VALUE 'STYLIST_FREE';

-- CreateTable: Dressing
CREATE TABLE "Dressing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_label" TEXT,
    "emoji" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dressing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dressing_user_id_idx" ON "Dressing"("user_id");

-- AlterTable: Add dressing_id to ClothingItem
ALTER TABLE "ClothingItem" ADD COLUMN "dressing_id" TEXT;

-- CreateIndex
CREATE INDEX "ClothingItem_dressing_id_idx" ON "ClothingItem"("dressing_id");

-- AddForeignKey
ALTER TABLE "Dressing" ADD CONSTRAINT "Dressing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClothingItem" ADD CONSTRAINT "ClothingItem_dressing_id_fkey" FOREIGN KEY ("dressing_id") REFERENCES "Dressing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
