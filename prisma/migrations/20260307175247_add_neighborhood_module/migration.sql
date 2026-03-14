-- CreateTable
CREATE TABLE `neighborhood_post` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `tab` ENUM('AGENDA', 'MARKETPLACE', 'EVENTS', 'HELP') NOT NULL,
    `type` ENUM('ANNOUNCEMENT', 'SOCIAL', 'LISTING', 'EVENT', 'HELP_REQUEST') NOT NULL,
    `marketplaceCategory` ENUM('ALL', 'SECONDHAND', 'VEHICLE', 'REALESTATE', 'JOBS') NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED') NOT NULL DEFAULT 'PUBLISHED',
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NULL,
    `description` TEXT NULL,
    `price` DOUBLE NULL,
    `currency` VARCHAR(191) NULL DEFAULT 'TL',
    `location` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `eventStartAt` DATETIME(3) NULL,
    `eventEndAt` DATETIME(3) NULL,
    `eventLocation` VARCHAR(191) NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `shareCount` INTEGER NOT NULL DEFAULT 0,
    `authorUserId` VARCHAR(191) NULL,
    `authorBusinessId` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `contactWhatsapp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `neighborhood_post_slug_key`(`slug`),
    INDEX `NeighborhoodPost_tab_status_createdAt_idx`(`tab`, `status`, `createdAt`),
    INDEX `NeighborhoodPost_marketplaceCategory_status_idx`(`marketplaceCategory`, `status`),
    INDEX `NeighborhoodPost_authorUserId_idx`(`authorUserId`),
    INDEX `NeighborhoodPost_authorBusinessId_idx`(`authorBusinessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neighborhood_post_image` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NeighborhoodPostImage_postId_sortOrder_idx`(`postId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neighborhood_post_attribute` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `NeighborhoodPostAttribute_postId_sortOrder_idx`(`postId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neighborhood_post_comment` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `NeighborhoodPostComment_postId_createdAt_idx`(`postId`, `createdAt`),
    INDEX `NeighborhoodPostComment_userId_idx`(`userId`),
    INDEX `NeighborhoodPostComment_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neighborhood_post_like` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NeighborhoodPostLike_postId_idx`(`postId`),
    UNIQUE INDEX `NeighborhoodPostLike_postId_userId_key`(`postId`, `userId`),
    UNIQUE INDEX `NeighborhoodPostLike_postId_businessId_key`(`postId`, `businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `neighborhood_post` ADD CONSTRAINT `NeighborhoodPost_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post` ADD CONSTRAINT `NeighborhoodPost_authorBusinessId_fkey` FOREIGN KEY (`authorBusinessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_image` ADD CONSTRAINT `NeighborhoodPostImage_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `neighborhood_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_attribute` ADD CONSTRAINT `NeighborhoodPostAttribute_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `neighborhood_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_comment` ADD CONSTRAINT `NeighborhoodPostComment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `neighborhood_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_comment` ADD CONSTRAINT `NeighborhoodPostComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_comment` ADD CONSTRAINT `NeighborhoodPostComment_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_like` ADD CONSTRAINT `NeighborhoodPostLike_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `neighborhood_post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_like` ADD CONSTRAINT `NeighborhoodPostLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `neighborhood_post_like` ADD CONSTRAINT `NeighborhoodPostLike_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
