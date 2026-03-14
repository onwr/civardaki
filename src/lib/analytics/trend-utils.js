/**
 * Admin analytics: trend gösterimi için renk ve etiket.
 * İkonlar string olarak döner; component'te lucide-react ile eşleştirilir.
 */

/**
 * @param {number|null|undefined} value - Yüzde değişim (örn. 12, -5, 0)
 * @returns {{ label: string, colorClass: string, iconName: string }}
 */
export function getTrendMeta(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n === 0) {
    return { label: "%0", colorClass: "text-slate-500", iconName: "Minus" };
  }
  if (n > 0) {
    const label = `+${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n)}%`;
    return { label, colorClass: "text-emerald-600", iconName: "ArrowUpRight" };
  }
  const label = `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(n)}%`;
  return { label, colorClass: "text-rose-500", iconName: "ArrowDownRight" };
}
