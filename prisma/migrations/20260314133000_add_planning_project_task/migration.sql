-- CreateTable
CREATE TABLE `planning_project` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlanningProject_businessId_status_idx`(`businessId`, `status`),
    INDEX `PlanningProject_businessId_createdAt_idx`(`businessId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planning_task` (
    `id` VARCHAR(191) NOT NULL,
    `businessId` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `taskType` ENUM('TASK', 'PROJECT', 'SHIFT') NOT NULL DEFAULT 'TASK',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('TODO', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'TODO',
    `progress` INTEGER NOT NULL DEFAULT 0,
    `assignedTo` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `budget` DOUBLE NOT NULL DEFAULT 0,
    `estimatedHours` INTEGER NULL,
    `spentHours` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PlanningTask_businessId_status_idx`(`businessId`, `status`),
    INDEX `PlanningTask_businessId_dueDate_idx`(`businessId`, `dueDate`),
    INDEX `PlanningTask_businessId_taskType_idx`(`businessId`, `taskType`),
    INDEX `PlanningTask_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `planning_project` ADD CONSTRAINT `PlanningProject_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_task` ADD CONSTRAINT `PlanningTask_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `planning_task` ADD CONSTRAINT `PlanningTask_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `planning_project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
