-- CreateEnum
CREATE TYPE "FeeCalculationType" AS ENUM ('GRADE_BASED', 'DISTANCE_BASED', 'FLAT');

-- CreateTable
CREATE TABLE "FeeComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calculationType" "FeeCalculationType" NOT NULL,

    CONSTRAINT "FeeComponent_pkey" PRIMARY KEY ("id")
);

-- Insert a real Tuition component so existing FeeRule rows have something to point at
INSERT INTO "FeeComponent" ("id", "name", "calculationType")
VALUES ('00000000-0000-0000-0000-000000000001', 'Tuition', 'GRADE_BASED');

-- AlterTable: add the column as nullable first
ALTER TABLE "FeeRule" ADD COLUMN     "feeComponentId" TEXT,
ADD COLUMN     "ratePerKm" DOUBLE PRECISION,
ALTER COLUMN "grade" DROP NOT NULL;

-- Backfill every existing FeeRule row to point at the Tuition component
UPDATE "FeeRule" SET "feeComponentId" = '00000000-0000-0000-0000-000000000001';

-- Now that every row has a value, make the column required
ALTER TABLE "FeeRule" ALTER COLUMN "feeComponentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "isBoarder" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "FeeRule" ADD CONSTRAINT "FeeRule_feeComponentId_fkey" FOREIGN KEY ("feeComponentId") REFERENCES "FeeComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
