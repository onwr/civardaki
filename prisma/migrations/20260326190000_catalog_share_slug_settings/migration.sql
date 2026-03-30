-- AlterTable
ALTER TABLE `catalog` ADD COLUMN `shareSlug` VARCHAR(191) NULL,
    ADD COLUMN `priceListId` VARCHAR(191) NULL,
    ADD COLUMN `priceDisplay` ENUM('SHOW_SALES', 'HIDE') NOT NULL DEFAULT 'SHOW_SALES',
    ADD COLUMN `brandDisplay` ENUM('SHOW', 'HIDE') NOT NULL DEFAULT 'HIDE',
    ADD COLUMN `stockQtyDisplay` ENUM('SHOW', 'HIDE') NOT NULL DEFAULT 'HIDE',
    ADD COLUMN `stockFilter` ENUM('ALL', 'IN_STOCK_ONLY') NOT NULL DEFAULT 'ALL',
    ADD COLUMN `sortOrder` ENUM('BY_NAME', 'BY_CATALOG_ORDER') NOT NULL DEFAULT 'BY_NAME';

-- CreateIndex
CREATE UNIQUE INDEX `Catalog_shareSlug_key` ON `catalog`(`shareSlug`);

-- CreateIndex
CREATE INDEX `Catalog_priceListId_idx` ON `catalog`(`priceListId`);

-- AddForeignKey
ALTER TABLE `catalog` ADD CONSTRAINT `Catalog_priceListId_fkey` FOREIGN KEY (`priceListId`) REFERENCES `pricelist`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill shareSlug (UUID() evaluated per row in MySQL)
UPDATE `catalog` SET `shareSlug` = SUBSTRING(REPLACE(UUID(), '-', ''), 1, 8) WHERE `shareSlug` IS NULL;
