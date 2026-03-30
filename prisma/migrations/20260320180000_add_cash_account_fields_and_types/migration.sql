-- AlterTable: account_type enum - add POS, CREDIT_CARD, PARTNER, CREDIT
ALTER TABLE `cash_account` MODIFY COLUMN `type` ENUM('CASH', 'BANK', 'ESCROW', 'POS', 'CREDIT_CARD', 'PARTNER', 'CREDIT') NOT NULL DEFAULT 'CASH';

-- AlterTable: add optional accountNo and labelColor
ALTER TABLE `cash_account` ADD COLUMN `accountNo` VARCHAR(191) NULL,
    ADD COLUMN `labelColor` VARCHAR(191) NULL;
