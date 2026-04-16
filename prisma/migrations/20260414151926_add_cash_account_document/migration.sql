-- CreateTable
CREATE TABLE `cash_account_document` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `fileId` VARCHAR(191) NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CashAccountDocument_businessId_idx`(`businessId`),
    INDEX `CashAccountDocument_accountId_idx`(`accountId`),
    INDEX `CashAccountDocument_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cash_account_document` ADD CONSTRAINT `CashAccountDocument_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_account_document` ADD CONSTRAINT `CashAccountDocument_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `cash_account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
