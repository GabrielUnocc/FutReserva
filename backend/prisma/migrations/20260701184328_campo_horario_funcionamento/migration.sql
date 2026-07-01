/*
  Warnings:

  - You are about to drop the column `horarioId` on the `Agendamento` table. All the data in the column will be lost.
  - You are about to drop the `Horario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `campoId` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaFim` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaInicio` to the `Agendamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaAbertura` to the `Campo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horaFechamento` to the `Campo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agendamento" DROP CONSTRAINT "Agendamento_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_campoId_fkey";

-- AlterTable
ALTER TABLE "Agendamento" DROP COLUMN "horarioId",
ADD COLUMN     "campoId" INTEGER NOT NULL,
ADD COLUMN     "horaFim" TEXT NOT NULL,
ADD COLUMN     "horaInicio" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Campo" ADD COLUMN     "horaAbertura" TEXT NOT NULL,
ADD COLUMN     "horaFechamento" TEXT NOT NULL;

-- DropTable
DROP TABLE "Horario";

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_campoId_fkey" FOREIGN KEY ("campoId") REFERENCES "Campo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
