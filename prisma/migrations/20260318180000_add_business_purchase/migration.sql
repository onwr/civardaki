-- CreateTable
CREATE TABLE `business_purchase` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `documentType` ENUM('ORDER', 'WAYBILLED', 'INVOICED') NOT NULL DEFAULT 'ORDER',
    `supplierId` VARCHAR(191) NULL,
    `supplierName` VARCHAR(191) NULL,
    `purchaseDate` DATETIME(3) NOT NULL,
    `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    `paymentAmount` DOUBLE NOT NULL DEFAULT 0,
    `cashAccountId` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessPurchase_businessId_idx`(`businessId`),
    INDEX `BusinessPurchase_businessId_purchaseDate_idx`(`businessId`, `purchaseDate`),
    INDEX `BusinessPurchase_documentType_idx`(`documentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_purchase_item` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,

    INDEX `BusinessPurchaseItem_purchaseId_idx`(`purchaseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_purchase` ADD CONSTRAINT `BusinessPurchase_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_purchase` ADD CONSTRAINT `BusinessPurchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `business_supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_purchase` ADD CONSTRAINT `BusinessPurchase_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `cash_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_purchase_item` ADD CONSTRAINT `BusinessPurchaseItem_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `business_purchase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
