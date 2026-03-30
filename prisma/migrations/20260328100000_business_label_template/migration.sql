-- CreateTable
CREATE TABLE `business_label_template` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` ENUM('PRODUCT', 'ADDRESS') NOT NULL,
    `format` ENUM('A4', 'RIBBON') NOT NULL,
    `settings` JSON NOT NULL DEFAULT (JSON_OBJECT()),
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessLabelTemplate_businessId_name_key`(`businessId`, `name`),
    INDEX `BusinessLabelTemplate_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_label_template` ADD CONSTRAINT `BusinessLabelTemplate_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
