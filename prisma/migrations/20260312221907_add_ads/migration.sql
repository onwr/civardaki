-- CreateTable
CREATE TABLE `ad` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `linkUrl` VARCHAR(191) NULL,
    `placement` ENUM('BANNER', 'SIDEBAR', 'LISTING_TOP', 'LISTING_INLINE', 'FOOTER', 'POPUP') NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'DRAFT',
    `startAt` DATETIME(3) NULL,
    `endAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ad_placement_status_idx`(`placement`, `status`),
    INDEX `Ad_status_dates_idx`(`status`, `startAt`, `endAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ad` ADD CONSTRAINT `Ad_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
