-- CreateTable
CREATE TABLE `business_sale` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `documentType` ENUM('ORDER', 'WAYBILL', 'INVOICED_EFATURA', 'INVOICED_NOT_EFATURA') NOT NULL DEFAULT 'ORDER',
    `saleKind` ENUM('RETAIL', 'TO_NEW_CUSTOMER', 'TO_REGISTERED_CUSTOMER') NOT NULL DEFAULT 'RETAIL',
    `customerId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NULL,
    `saleDate` DATETIME(3) NOT NULL,
    `totalAmount` DOUBLE NOT NULL DEFAULT 0,
    `collectionAmount` DOUBLE NOT NULL DEFAULT 0,
    `cashAccountId` VARCHAR(191) NULL,
    `description` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessSale_businessId_idx`(`businessId`),
    INDEX `BusinessSale_businessId_saleDate_idx`(`businessId`, `saleDate`),
    INDEX `BusinessSale_documentType_idx`(`documentType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_sale_item` (
    `id` VARCHAR(191) NOT NULL,
    `saleId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,

    INDEX `BusinessSaleItem_saleId_idx`(`saleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_sale` ADD CONSTRAINT `BusinessSale_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_sale` ADD CONSTRAINT `BusinessSale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `business_customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_sale` ADD CONSTRAINT `BusinessSale_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `cash_account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_sale_item` ADD CONSTRAINT `BusinessSaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `business_sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
