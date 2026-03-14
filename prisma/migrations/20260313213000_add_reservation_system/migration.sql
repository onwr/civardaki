-- AlterTable
ALTER TABLE `business`
ADD COLUMN `reservationEnabled` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `reservation` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `customerEmail` VARCHAR(191) NULL,
    `serviceName` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `source` ENUM('PUBLIC_LISTING', 'BUSINESS_PANEL') NOT NULL DEFAULT 'PUBLIC_LISTING',
    `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reservation_businessId_startAt_idx`(`businessId`, `startAt`),
    INDEX `Reservation_businessId_status_idx`(`businessId`, `status`),
    INDEX `Reservation_userId_startAt_idx`(`userId`, `startAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservation`
ADD CONSTRAINT `Reservation_businessId_fkey`
FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation`
ADD CONSTRAINT `Reservation_userId_fkey`
FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
