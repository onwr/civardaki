-- CreateTable
CREATE TABLE `business_loan` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `remainingDebt` DOUBLE NOT NULL,
    `remainingInstallments` INTEGER NOT NULL,
    `nextInstallmentDate` DATETIME(3) NOT NULL,
    `paymentSchedule` ENUM('MONTHLY', 'WEEKLY', 'BIWEEKLY', 'QUARTERLY', 'YEARLY') NOT NULL DEFAULT 'MONTHLY',
    `cashAccountId` VARCHAR(191) NOT NULL,
    `notes` LONGTEXT NULL,
    `isClosed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessLoan_businessId_idx`(`businessId`),
    INDEX `BusinessLoan_cashAccountId_idx`(`cashAccountId`),
    INDEX `BusinessLoan_nextInstallmentDate_idx`(`nextInstallmentDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_loan` ADD CONSTRAINT `BusinessLoan_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_loan` ADD CONSTRAINT `BusinessLoan_cashAccountId_fkey` FOREIGN KEY (`cashAccountId`) REFERENCES `cash_account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
