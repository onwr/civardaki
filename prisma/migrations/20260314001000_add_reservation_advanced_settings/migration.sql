-- CreateTable
CREATE TABLE `business_reservation_settings` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Europe/Istanbul',
    `slotDurationMin` INTEGER NOT NULL DEFAULT 60,
    `minNoticeMinutes` INTEGER NOT NULL DEFAULT 60,
    `maxAdvanceDays` INTEGER NOT NULL DEFAULT 60,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BusinessReservationSettings_businessId_key`(`businessId`),
    INDEX `BusinessReservationSettings_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_reservation_availability` (
    `id` VARCHAR(191) NOT NULL,
    `settingsId` VARCHAR(191) NOT NULL,
    `dayOfWeek` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessReservationAvailability_settingsId_idx`(`settingsId`),
    INDEX `BusinessReservationAvailability_settingsId_dayOfWeek_idx`(`settingsId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_reservation_question` (
    `id` VARCHAR(191) NOT NULL,
    `settingsId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `type` ENUM('TEXT', 'SHORT_ANSWER', 'SINGLE_CHOICE', 'MULTI_CHOICE') NOT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessReservationQuestion_settingsId_idx`(`settingsId`),
    INDEX `BusinessReservationQuestion_settingsId_sortOrder_idx`(`settingsId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `business_reservation_question_option` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessReservationQuestionOption_questionId_idx`(`questionId`),
    INDEX `BusinessReservationQuestionOption_questionId_sortOrder_idx`(`questionId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation_answer` (
    `id` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `valueText` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ReservationAnswer_reservationId_idx`(`reservationId`),
    INDEX `ReservationAnswer_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `business_reservation_settings`
ADD CONSTRAINT `BusinessReservationSettings_businessId_fkey`
FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_reservation_availability`
ADD CONSTRAINT `BusinessReservationAvailability_settingsId_fkey`
FOREIGN KEY (`settingsId`) REFERENCES `business_reservation_settings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_reservation_question`
ADD CONSTRAINT `BusinessReservationQuestion_settingsId_fkey`
FOREIGN KEY (`settingsId`) REFERENCES `business_reservation_settings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `business_reservation_question_option`
ADD CONSTRAINT `BusinessReservationQuestionOption_questionId_fkey`
FOREIGN KEY (`questionId`) REFERENCES `business_reservation_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation_answer`
ADD CONSTRAINT `ReservationAnswer_reservationId_fkey`
FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservation_answer`
ADD CONSTRAINT `ReservationAnswer_questionId_fkey`
FOREIGN KEY (`questionId`) REFERENCES `business_reservation_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
