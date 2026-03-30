-- CreateTable
CREATE TABLE `business_masterdata_entry` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `kind` ENUM('PRODUCT_BRAND', 'CUSTOMER_CLASS_1', 'CUSTOMER_CLASS_2', 'SUPPLIER_CLASS_1', 'SUPPLIER_CLASS_2', 'FIHRIST_1', 'FIHRIST_2', 'SHELF_LOCATION') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessMasterdataEntry_businessId_kind_idx`(`businessId`, `kind`),
    UNIQUE INDEX `BusinessMasterdataEntry_businessId_kind_name_key`(`businessId`, `kind`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_masterdata_entry` ADD CONSTRAINT `BusinessMasterdataEntry_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
