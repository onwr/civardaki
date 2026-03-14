-- CreateTable
CREATE TABLE `business_note` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `authorUserId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Genel',
    `color` VARCHAR(191) NOT NULL DEFAULT 'blue',
    `tags` JSON NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessNote_businessId_createdAt_idx`(`businessId`, `createdAt`),
    INDEX `BusinessNote_businessId_category_idx`(`businessId`, `category`),
    INDEX `BusinessNote_businessId_isPinned_idx`(`businessId`, `isPinned`),
    INDEX `BusinessNote_businessId_archivedAt_idx`(`businessId`, `archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_note` ADD CONSTRAINT `BusinessNote_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_note` ADD CONSTRAINT `BusinessNote_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
