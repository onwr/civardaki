-- CreateTable
CREATE TABLE `cash_project` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `notes` TEXT NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CashProject_businessId_idx`(`businessId`),
    INDEX `CashProject_businessId_status_idx`(`businessId`, `status`),
    INDEX `CashProject_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cash_project` ADD CONSTRAINT `CashProject_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_project` ADD CONSTRAINT `CashProject_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `cash_project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `cash_transaction` ADD COLUMN `projectId` VARCHAR(191) NULL;

CREATE INDEX `CashTransaction_projectId_idx` ON `cash_transaction`(`projectId`);

ALTER TABLE `cash_transaction` ADD CONSTRAINT `CashTransaction_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `cash_project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `business_sale` ADD COLUMN `projectId` VARCHAR(191) NULL;

CREATE INDEX `BusinessSale_projectId_idx` ON `business_sale`(`projectId`);

ALTER TABLE `business_sale` ADD CONSTRAINT `BusinessSale_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `cash_project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `business_purchase` ADD COLUMN `projectId` VARCHAR(191) NULL;

CREATE INDEX `BusinessPurchase_projectId_idx` ON `business_purchase`(`projectId`);

ALTER TABLE `business_purchase` ADD CONSTRAINT `BusinessPurchase_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `cash_project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
