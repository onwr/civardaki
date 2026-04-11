-- AlterTable
ALTER TABLE `lead` ADD COLUMN `categoryId` VARCHAR(191) NULL,
    MODIFY `businessId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `lead_business_state` (
    `id` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUOTED', 'REPLIED', 'CLOSED', 'LOST') NOT NULL DEFAULT 'NEW',
    `dismissedAt` DATETIME(3) NULL,
    `replyText` TEXT NULL,
    `quotedPrice` DOUBLE NULL,
    `repliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `LeadBusinessState_businessId_status_idx`(`businessId`, `status`),
    INDEX `LeadBusinessState_businessId_dismissedAt_idx`(`businessId`, `dismissedAt`),
    UNIQUE INDEX `LeadBusinessState_leadId_businessId_key`(`leadId`, `businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Lead_distributed_category_createdAt_idx` ON `lead`(`isDistributed`, `categoryId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Lead_categoryId_idx` ON `lead`(`categoryId`);

-- AddForeignKey
ALTER TABLE `lead` ADD CONSTRAINT `Lead_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_business_state` ADD CONSTRAINT `LeadBusinessState_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `lead`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lead_business_state` ADD CONSTRAINT `LeadBusinessState_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
