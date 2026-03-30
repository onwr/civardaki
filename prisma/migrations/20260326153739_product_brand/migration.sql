-- AlterTable
ALTER TABLE `product` ADD COLUMN `brand` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Product_businessId_brand_idx` ON `product`(`businessId`, `brand`);
