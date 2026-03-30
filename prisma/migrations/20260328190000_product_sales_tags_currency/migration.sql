-- AlterTable
ALTER TABLE `product` ADD COLUMN `salesUnit` VARCHAR(32) NULL,
    ADD COLUMN `tagsString` TEXT NULL,
    ADD COLUMN `priceCurrency` VARCHAR(8) NULL;
