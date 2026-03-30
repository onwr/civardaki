-- CreateTable
CREATE TABLE `business_fihrist_entry` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone1` VARCHAR(191) NULL,
    `phone2` VARCHAR(191) NULL,
    `email` TEXT NULL,
    `authorizedPerson` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `note` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `class1Id` VARCHAR(191) NULL,
    `class2Id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessFihristEntry_businessId_idx`(`businessId`),
    INDEX `BusinessFihristEntry_class1Id_idx`(`class1Id`),
    INDEX `BusinessFihristEntry_class2Id_idx`(`class2Id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_fihrist_entry` ADD CONSTRAINT `BusinessFihristEntry_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_fihrist_entry` ADD CONSTRAINT `BusinessFihristEntry_class1Id_fkey` FOREIGN KEY (`class1Id`) REFERENCES `business_masterdata_entry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_fihrist_entry` ADD CONSTRAINT `BusinessFihristEntry_class2Id_fkey` FOREIGN KEY (`class2Id`) REFERENCES `business_masterdata_entry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
