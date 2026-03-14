-- AlterTable
ALTER TABLE `cash_transaction` MODIFY `type` ENUM('INCOME', 'EXPENSE', 'DEBT', 'LOAN', 'CREDIT_CARD', 'TRANSFER') NOT NULL;

-- CreateTable
CREATE TABLE `financial_transaction` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `type` ENUM('INCOME', 'EXPENSE', 'DEBT', 'LOAN', 'CREDIT_CARD', 'TRANSFER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NULL,
    `totalAmount` DOUBLE NULL,
    `creditLimit` DOUBLE NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'COMPLETED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinancialTransaction_businessId_idx`(`businessId`),
    INDEX `FinancialTransaction_userId_idx`(`userId`),
    INDEX `FinancialTransaction_date_idx`(`date`),
    INDEX `FinancialTransaction_type_date_idx`(`type`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `financial_transaction` ADD CONSTRAINT `FinancialTransaction_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transaction` ADD CONSTRAINT `FinancialTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
