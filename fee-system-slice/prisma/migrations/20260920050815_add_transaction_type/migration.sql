-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYMENT', 'LATE_FEE', 'REFUND', 'WAIVER');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'PAYMENT';
