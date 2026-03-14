-- CreateTable
CREATE TABLE `pricelist` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `customerGroup` VARCHAR(191) NOT NULL DEFAULT 'ALL',
    `discountRate` DOUBLE NOT NULL DEFAULT 0,
    `validFrom` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Pricelist_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricelistitem` (
    `id` VARCHAR(191) NOT NULL,
    `pricelistId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `PricelistItem_pricelistId_idx`(`pricelistId`),
    INDEX `PricelistItem_productId_idx`(`productId`),
    UNIQUE INDEX `PricelistItem_pricelistId_productId_key`(`pricelistId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pricelist` ADD CONSTRAINT `Pricelist_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricelistitem` ADD CONSTRAINT `PricelistItem_pricelistId_fkey` FOREIGN KEY (`pricelistId`) REFERENCES `pricelist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricelistitem` ADD CONSTRAINT `PricelistItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
