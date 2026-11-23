-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('S', 'M', 'L', 'XL');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sizes" "ProductSize"[] DEFAULT ARRAY[]::"ProductSize"[];
