-- CreateTable
CREATE TABLE `business_supplier` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `imageUrl` VARCHAR(191) NULL,
    `taxOffice` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `taxExempt` BOOLEAN NOT NULL DEFAULT false,
    `bankInfo` LONGTEXT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `maturityDays` INTEGER NULL,
    `openingBalance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `authorizedPerson` VARCHAR(191) NULL,
    `email` LONGTEXT NULL,
    `address` LONGTEXT NULL,
    `phone` VARCHAR(191) NULL,
    `otherAccess` LONGTEXT NULL,
    `otherNotes` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessSupplier_businessId_idx`(`businessId`),
    INDEX `BusinessSupplier_businessId_isActive_idx`(`businessId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_supplier` ADD CONSTRAINT `BusinessSupplier_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
