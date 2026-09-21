-- AlterTable: add the column as optional first
ALTER TABLE "FeeAssignment" ADD COLUMN "amount" DOUBLE PRECISION;

-- Backfill: copy each assignment's amount from its linked FeeRule
UPDATE "FeeAssignment" fa
SET "amount" = fr."amount"
FROM "FeeRule" fr
WHERE fa."feeRuleId" = fr."id";

-- Now that every row has a value, make the column required
ALTER TABLE "FeeAssignment" ALTER COLUMN "amount" SET NOT NULL;
