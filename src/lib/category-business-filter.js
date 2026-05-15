/** Kategori ağacına göre aktif işletme where koşulu */
export function businessWhereForCategoryIds(categoryIds) {
  const ids = (categoryIds || []).filter(Boolean);
  if (!ids.length) return { isActive: true };

  return {
    isActive: true,
    OR: [
      { primaryCategoryId: { in: ids } },
      { businesscategory: { some: { categoryId: { in: ids } } } },
    ],
  };
}
