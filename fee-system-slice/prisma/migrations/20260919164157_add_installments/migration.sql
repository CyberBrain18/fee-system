-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "installmentId" TEXT;

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "feeAssignmentId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_feeAssignmentId_fkey" FOREIGN KEY ("feeAssignmentId") REFERENCES "FeeAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
