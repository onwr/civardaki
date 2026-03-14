/*
  Warnings:

  - A unique constraint covering the columns `[parentId,name]` on the table `category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Category_name_key` ON `category`;

-- AlterTable
ALTER TABLE `business` ADD COLUMN `primaryCategoryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `businesscategory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isPrimary` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `category` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `keywords` TEXT NULL,
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `path` VARCHAR(500) NULL,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE INDEX `Business_primaryCategoryId_idx` ON `business`(`primaryCategoryId`);

-- CreateIndex
CREATE INDEX `BusinessCategory_businessId_isPrimary_idx` ON `businesscategory`(`businessId`, `isPrimary`);

-- CreateIndex
CREATE INDEX `BusinessCategory_categoryId_isPrimary_idx` ON `businesscategory`(`categoryId`, `isPrimary`);

-- CreateIndex
CREATE INDEX `Category_parentId_sortOrder_idx` ON `category`(`parentId`, `sortOrder`);

-- CreateIndex
CREATE INDEX `Category_level_isActive_idx` ON `category`(`level`, `isActive`);

-- CreateIndex
CREATE INDEX `Category_isActive_isFeatured_idx` ON `category`(`isActive`, `isFeatured`);

-- CreateIndex
CREATE UNIQUE INDEX `Category_parentId_name_key` ON `category`(`parentId`, `name`);

-- AddForeignKey
ALTER TABLE `business` ADD CONSTRAINT `business_primaryCategoryId_fkey` FOREIGN KEY (`primaryCategoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
