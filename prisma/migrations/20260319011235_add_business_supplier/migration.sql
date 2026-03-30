-- AlterTable
ALTER TABLE `business_customer` MODIFY `email` TEXT NULL,
    MODIFY `otherAccess` TEXT NULL,
    MODIFY `address` TEXT NULL,
    MODIFY `bankInfo` TEXT NULL,
    MODIFY `otherNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `business_supplier` MODIFY `bankInfo` TEXT NULL,
    MODIFY `email` TEXT NULL,
    MODIFY `address` TEXT NULL,
    MODIFY `otherAccess` TEXT NULL,
    MODIFY `otherNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `product` ADD COLUMN `publishedOnMarketplace` BOOLEAN NOT NULL DEFAULT false;
