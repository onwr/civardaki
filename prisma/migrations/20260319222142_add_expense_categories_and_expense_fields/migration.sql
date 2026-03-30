-- AlterTable
ALTER TABLE `business_purchase` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `cash_transaction` ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `expenseItemId` VARCHAR(191) NULL,
    ADD COLUMN `expensePaymentStatus` ENUM('PENDING', 'PAID') NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `paymentDate` DATETIME(3) NULL,
    ADD COLUMN `projectName` VARCHAR(191) NULL,
    ADD COLUMN `receiptNo` VARCHAR(191) NULL,
    ADD COLUMN `recurring` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `vatRate` DOUBLE NULL;

-- CreateTable
CREATE TABLE `expense_category` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ExpenseCategory_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expense_item` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagColor` VARCHAR(32) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ExpenseItem_businessId_idx`(`businessId`),
    INDEX `ExpenseItem_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `CashTransaction_expensePaymentStatus_idx` ON `cash_transaction`(`expensePaymentStatus`);

-- CreateIndex
CREATE INDEX `CashTransaction_expenseItemId_idx` ON `cash_transaction`(`expenseItemId`);

-- AddForeignKey
ALTER TABLE `expense_category` ADD CONSTRAINT `ExpenseCategory_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_item` ADD CONSTRAINT `ExpenseItem_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expense_item` ADD CONSTRAINT `ExpenseItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `expense_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_transaction` ADD CONSTRAINT `CashTransaction_expenseItemId_fkey` FOREIGN KEY (`expenseItemId`) REFERENCES `expense_item`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
