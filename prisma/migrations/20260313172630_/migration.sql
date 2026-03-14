-- CreateTable
CREATE TABLE `platform_setting` (
    `id` VARCHAR(191) NOT NULL,
    `general` JSON NOT NULL,
    `security` JSON NOT NULL,
    `notifications` JSON NOT NULL,
    `api` JSON NOT NULL,
    `design` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
