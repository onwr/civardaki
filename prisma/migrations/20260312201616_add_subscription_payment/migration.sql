-- CreateTable
CREATE TABLE `subscription_payment` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'TRY',
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `provider` VARCHAR(191) NULL,
    `providerReference` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SubscriptionPayment_businessId_idx`(`businessId`),
    INDEX `SubscriptionPayment_subscriptionId_idx`(`subscriptionId`),
    INDEX `SubscriptionPayment_status_idx`(`status`),
    INDEX `SubscriptionPayment_providerReference_idx`(`providerReference`),
    INDEX `SubscriptionPayment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `subscription_payment` ADD CONSTRAINT `SubscriptionPayment_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscription_payment` ADD CONSTRAINT `SubscriptionPayment_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `businesssubscription`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
