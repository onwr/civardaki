-- AlterTable
ALTER TABLE `user_address`
ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `user_favorite_business` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserFavoriteBusiness_userId_businessId_key`(`userId`, `businessId`),
    INDEX `UserFavoriteBusiness_userId_idx`(`userId`),
    INDEX `UserFavoriteBusiness_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profile_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'tr-TR',
    `campaignNotifications` BOOLEAN NOT NULL DEFAULT true,
    `smsOrderNotifications` BOOLEAN NOT NULL DEFAULT true,
    `newsletterNotifications` BOOLEAN NOT NULL DEFAULT true,
    `profileVisibility` VARCHAR(191) NOT NULL DEFAULT 'PRIVATE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UserProfileSettings_userId_key`(`userId`),
    INDEX `UserProfileSettings_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_favorite_business`
ADD CONSTRAINT `UserFavoriteBusiness_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_business`
ADD CONSTRAINT `UserFavoriteBusiness_businessId_fkey`
FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profile_settings`
ADD CONSTRAINT `UserProfileSettings_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
