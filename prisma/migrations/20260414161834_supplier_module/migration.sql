-- AlterTable
ALTER TABLE `business_supplier` ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `supplier_category` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupplierCategory_businessId_idx`(`businessId`),
    UNIQUE INDEX `SupplierCategory_businessId_name_key`(`businessId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier_document` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupplierDocument_businessId_idx`(`businessId`),
    INDEX `SupplierDocument_supplierId_idx`(`supplierId`),
    INDEX `SupplierDocument_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `BusinessSupplier_categoryId_idx` ON `business_supplier`(`categoryId`);

-- AddForeignKey
ALTER TABLE `business_supplier` ADD CONSTRAINT `BusinessSupplier_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `supplier_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_category` ADD CONSTRAINT `SupplierCategory_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_document` ADD CONSTRAINT `SupplierDocument_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `supplier_document` ADD CONSTRAINT `SupplierDocument_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `business_supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
