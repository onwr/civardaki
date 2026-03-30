-- CreateTable
CREATE TABLE `productvariantdimension` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariantDimension_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productvariantdimensionvalue` (
    `id` VARCHAR(191) NOT NULL,
    `dimensionId` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductVariantDimensionValue_dimensionId_idx`(`dimensionId`),
    UNIQUE INDEX `ProductVariantDimensionValue_dimensionId_value_key`(`dimensionId`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `productvariantdimension` ADD CONSTRAINT `ProductVariantDimension_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productvariantdimensionvalue` ADD CONSTRAINT `ProductVariantDimensionValue_dimensionId_fkey` FOREIGN KEY (`dimensionId`) REFERENCES `productvariantdimension`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
