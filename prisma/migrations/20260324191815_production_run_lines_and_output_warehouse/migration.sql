-- AlterTable
ALTER TABLE `asset` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `business_loan` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `production_run` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `outputWarehouseId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `production_run_line` (
    `id` VARCHAR(191) NOT NULL,
    `productionRunId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `warehouseId` VARCHAR(191) NOT NULL,
    `productVariantId` VARCHAR(191) NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `unitCost` DOUBLE NOT NULL DEFAULT 0,
    `lineCost` DOUBLE NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ProductionRunLine_productionRunId_idx`(`productionRunId`),
    INDEX `ProductionRunLine_productId_idx`(`productId`),
    INDEX `ProductionRunLine_warehouseId_idx`(`warehouseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ProductionRun_outputWarehouseId_idx` ON `production_run`(`outputWarehouseId`);

-- AddForeignKey
ALTER TABLE `production_run` ADD CONSTRAINT `ProductionRun_outputWarehouseId_fkey` FOREIGN KEY (`outputWarehouseId`) REFERENCES `warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_run_line` ADD CONSTRAINT `ProductionRunLine_productionRunId_fkey` FOREIGN KEY (`productionRunId`) REFERENCES `production_run`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_run_line` ADD CONSTRAINT `ProductionRunLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_run_line` ADD CONSTRAINT `ProductionRunLine_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_run_line` ADD CONSTRAINT `ProductionRunLine_productVariantId_fkey` FOREIGN KEY (`productVariantId`) REFERENCES `productvariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
