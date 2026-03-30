-- CreateTable
CREATE TABLE `business_customer` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `customerClass` VARCHAR(191) NOT NULL DEFAULT 'GENEL',
    `openBalance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `checkNoteBalance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `integrationLabel` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `email` LONGTEXT NULL,
    `mobilePhone` VARCHAR(191) NULL,
    `phone2` VARCHAR(191) NULL,
    `otherAccess` LONGTEXT NULL,
    `authorizedPerson` VARCHAR(191) NULL,
    `address` LONGTEXT NULL,
    `shippingAddresses` JSON NULL,
    `taxOffice` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `taxExempt` BOOLEAN NOT NULL DEFAULT false,
    `bankInfo` LONGTEXT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `riskLimit` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `maturityDays` INTEGER NULL,
    `fixedDiscountPct` DECIMAL(5, 2) NULL,
    `priceListMode` VARCHAR(191) NULL,
    `openingBalance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `otherNotes` LONGTEXT NULL,
    `branchesJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessCustomer_businessId_idx`(`businessId`),
    INDEX `BusinessCustomer_businessId_isActive_idx`(`businessId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_customer` ADD CONSTRAINT `BusinessCustomer_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
