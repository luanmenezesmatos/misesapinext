/*
  Warnings:

  - You are about to drop the column `bearerTokenAuthenticationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BearerTokenAuthentication` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bearerTokenAuth]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bearerTokenAuth` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_bearerTokenAuthenticationId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "bearerTokenAuthenticationId",
ADD COLUMN     "bearerTokenAuth" TEXT NOT NULL;

-- DropTable
DROP TABLE "BearerTokenAuthentication";

-- CreateIndex
CREATE UNIQUE INDEX "User_bearerTokenAuth_key" ON "User"("bearerTokenAuth");
