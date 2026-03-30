-- AlterTable: optional purchase date, notes
ALTER TABLE `asset` MODIFY COLUMN `purchaseDate` DATETIME(3) NULL;
ALTER TABLE `asset` ADD COLUMN `notes` LONGTEXT NULL;
