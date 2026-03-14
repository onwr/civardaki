-- CreateTable
CREATE TABLE `catalog` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `pdfUrl` VARCHAR(191) NULL,
    `shareUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Catalog_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catalogitem` (
    `id` VARCHAR(191) NOT NULL,
    `catalogId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `CatalogItem_catalogId_idx`(`catalogId`),
    INDEX `CatalogItem_productId_idx`(`productId`),
    UNIQUE INDEX `CatalogItem_catalogId_productId_key`(`catalogId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `catalog` ADD CONSTRAINT `Catalog_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogitem` ADD CONSTRAINT `CatalogItem_catalogId_fkey` FOREIGN KEY (`catalogId`) REFERENCES `catalog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catalogitem` ADD CONSTRAINT `CatalogItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
