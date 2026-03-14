-- CreateTable
CREATE TABLE `ecommerce_product_match` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `platformProductId` VARCHAR(191) NULL,
    `platformProductName` VARCHAR(191) NULL,
    `matchStatus` ENUM('MATCHED', 'PENDING', 'NOT_LISTED') NOT NULL DEFAULT 'NOT_LISTED',
    `lastSyncedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `EcommerceProductMatch_businessId_platform_idx`(`businessId`, `platform`),
    INDEX `EcommerceProductMatch_businessId_matchStatus_idx`(`businessId`, `matchStatus`),
    INDEX `EcommerceProductMatch_productId_idx`(`productId`),
    UNIQUE INDEX `EcommerceProductMatch_businessId_productId_platform_key`(`businessId`, `productId`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ecommerce_product_match` ADD CONSTRAINT `EcommerceProductMatch_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ecommerce_product_match` ADD CONSTRAINT `EcommerceProductMatch_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
