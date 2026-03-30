-- CreateTable
CREATE TABLE `cash_promissory_note` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `direction` ENUM('RECEIVED', 'ISSUED') NOT NULL DEFAULT 'RECEIVED',
    `status` ENUM('IN_PORTFOLIO', 'OVERDUE', 'GIVEN_TO_SUPPLIER', 'GIVEN_TO_BANK', 'PAID', 'PARTIAL_PAID', 'CANCELLED') NOT NULL DEFAULT 'IN_PORTFOLIO',
    `noteNumber` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL DEFAULT 0,
    `paidAmount` DOUBLE NOT NULL DEFAULT 0,
    `issueDate` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `drawerName` VARCHAR(191) NULL,
    `payeeName` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CashPromissoryNote_businessId_idx`(`businessId`),
    INDEX `CashPromissoryNote_businessId_status_idx`(`businessId`, `status`),
    INDEX `CashPromissoryNote_dueDate_idx`(`dueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `cash_promissory_note`
ADD CONSTRAINT `CashPromissoryNote_businessId_fkey`
FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
