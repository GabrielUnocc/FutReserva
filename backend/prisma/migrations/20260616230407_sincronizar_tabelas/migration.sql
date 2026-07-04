/*
  Warnings:

  - You are about to drop the column `metodo` on the `Pagamento` table. All the data in the column will be lost.
  - Added the required column `metodoPagamento` to the `Pagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "metodo",
ADD COLUMN     "dataPagamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metodoPagamento" TEXT NOT NULL;
