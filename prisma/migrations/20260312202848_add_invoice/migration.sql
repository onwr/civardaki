-- CreateTable
CREATE TABLE `invoice` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `subscriptionPaymentId` VARCHAR(191) NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBSCRIPTION', 'MANUAL', 'OTHER') NOT NULL DEFAULT 'MANUAL',
    `status` ENUM('DRAFT', 'ISSUED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `issueDate` DATETIME(3) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `description` TEXT NULL,
    `pdfUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `Invoice_businessId_idx`(`businessId`),
    INDEX `Invoice_subscriptionPaymentId_idx`(`subscriptionPaymentId`),
    INDEX `Invoice_status_idx`(`status`),
    INDEX `Invoice_issueDate_idx`(`issueDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `Invoice_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `Invoice_subscriptionPaymentId_fkey` FOREIGN KEY (`subscriptionPaymentId`) REFERENCES `subscription_payment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
