-- AlterTable: genişletilmiş katalog sıralama seçenekleri
ALTER TABLE `catalog` MODIFY COLUMN `sortOrder` ENUM(
    'BY_NAME',
    'BY_CATALOG_ORDER',
    'BY_SLUG',
    'BY_CATEGORY',
    'PRICE_ASC',
    'PRICE_DESC'
) NOT NULL DEFAULT 'BY_NAME';
