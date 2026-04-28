/*
  Warnings:

  - Added the required column `updated_at` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Detection" ADD COLUMN     "confidence_avg" DOUBLE PRECISION,
ADD COLUMN     "frame_id" TEXT,
ADD COLUMN     "thumbnail_url" TEXT;

-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "description" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
