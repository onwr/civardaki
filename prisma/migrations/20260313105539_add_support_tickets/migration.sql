-- CreateTable
CREATE TABLE `support_ticket` (
    `id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `creatorType` ENUM('USER', 'BUSINESS') NOT NULL,
    `userId` VARCHAR(191) NULL,
    `businessId` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING_REPLY', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    `category` ENUM('GENERAL', 'BILLING', 'TECHNICAL', 'ACCOUNT', 'OTHER') NOT NULL DEFAULT 'GENERAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SupportTicket_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `SupportTicket_userId_idx`(`userId`),
    INDEX `SupportTicket_businessId_idx`(`businessId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `support_ticket_message` (
    `id` VARCHAR(191) NOT NULL,
    `supportTicketId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `authorType` ENUM('USER', 'BUSINESS', 'ADMIN') NOT NULL,
    `authorUserId` VARCHAR(191) NULL,
    `authorBusinessId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportTicketMessage_supportTicketId_idx`(`supportTicketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `support_ticket` ADD CONSTRAINT `SupportTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket` ADD CONSTRAINT `SupportTicket_businessId_fkey` FOREIGN KEY (`businessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket_message` ADD CONSTRAINT `SupportTicketMessage_supportTicketId_fkey` FOREIGN KEY (`supportTicketId`) REFERENCES `support_ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket_message` ADD CONSTRAINT `SupportTicketMessage_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_ticket_message` ADD CONSTRAINT `SupportTicketMessage_authorBusinessId_fkey` FOREIGN KEY (`authorBusinessId`) REFERENCES `business`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
