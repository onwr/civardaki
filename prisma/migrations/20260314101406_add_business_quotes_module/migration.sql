-- CreateTable
CREATE TABLE `quote` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `quoteNumber` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerCompany` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `customerPhone` VARCHAR(191) NULL,
    `quoteDate` DATETIME(3) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `sentDate` DATETIME(3) NULL,
    `acceptedDate` DATETIME(3) NULL,
    `followUpDate` DATETIME(3) NULL,
    `expectedCloseDate` DATETIME(3) NULL,
    `subtotal` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `total` DOUBLE NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    `priority` ENUM('LOW', 'NORMAL', 'HIGH') NOT NULL DEFAULT 'NORMAL',
    `probability` INTEGER NOT NULL DEFAULT 0,
    `convertedToSale` BOOLEAN NOT NULL DEFAULT false,
    `template` VARCHAR(191) NULL DEFAULT 'Standard',
    `termsAndConditions` TEXT NULL,
    `notes` TEXT NULL,
    `tags` JSON NULL,
    `budget` DOUBLE NULL,
    `timeline` VARCHAR(191) NULL,
    `requirements` TEXT NULL,
    `objections` TEXT NULL,
    `nextSteps` TEXT NULL,
    `competitor` VARCHAR(191) NULL,
    `decisionMaker` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Quote_businessId_status_idx`(`businessId`, `status`),
    INDEX `Quote_businessId_createdAt_idx`(`businessId`, `createdAt`),
    INDEX `Quote_businessId_validUntil_idx`(`businessId`, `validUntil`),
    UNIQUE INDEX `Quote_businessId_quoteNumber_key`(`businessId`, `quoteNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quote_item` (
    `id` VARCHAR(191) NOT NULL,
    `quoteId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `isService` BOOLEAN NOT NULL DEFAULT true,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unitPrice` DOUBLE NOT NULL DEFAULT 0,
    `discount` DOUBLE NOT NULL DEFAULT 0,
    `lineTotal` DOUBLE NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `QuoteItem_quoteId_idx`(`quoteId`),
    INDEX `QuoteItem_quoteId_sortOrder_idx`(`quoteId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `quote` ADD CONSTRAINT `Quote_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quote_item` ADD CONSTRAINT `QuoteItem_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `quote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
