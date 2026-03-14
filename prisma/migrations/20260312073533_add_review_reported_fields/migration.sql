-- AlterTable
ALTER TABLE `review` ADD COLUMN `reportedAt` DATETIME(3) NULL,
    ADD COLUMN `reportedByBusinessId` VARCHAR(191) NULL;
