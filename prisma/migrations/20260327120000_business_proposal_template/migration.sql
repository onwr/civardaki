-- CreateTable
CREATE TABLE `business_proposal_template` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `kind` ENUM('PURCHASE_NOTE', 'BA_BS_FORM', 'SALES_NOTE', 'QUOTE', 'CUSTOM') NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'tr',
    `documentTitle` VARCHAR(191) NOT NULL DEFAULT 'TEKLİF FORMU',
    `pageSize` VARCHAR(191) NOT NULL DEFAULT 'A4',
    `introText` TEXT NULL,
    `footerText` TEXT NULL,
    `layoutSettings` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessProposalTemplate_businessId_name_key`(`businessId`, `name`),
    INDEX `BusinessProposalTemplate_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_proposal_template` ADD CONSTRAINT `BusinessProposalTemplate_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
