-- CreateTable
CREATE TABLE `broadcast` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `linkUrl` VARCHAR(191) NULL,
    `linkLabel` VARCHAR(191) NULL,
    `layout` ENUM('BANNER', 'MODAL', 'SIDEBAR', 'INLINE') NOT NULL,
    `audience` ENUM('ALL', 'USER', 'BUSINESS') NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED') NOT NULL DEFAULT 'DRAFT',
    `startAt` DATETIME(3) NULL,
    `endAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Broadcast_layout_audience_status_idx`(`layout`, `audience`, `status`),
    INDEX `Broadcast_status_dates_idx`(`status`, `startAt`, `endAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `broadcast` ADD CONSTRAINT `Broadcast_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
