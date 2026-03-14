/**
 * Sipariş tarih ve para formatları.
 */

export function formatCurrency(value) {
  const n = Number(value);
  if (n !== n) return "0 ₺";
  return `${n.toLocaleString("tr-TR")} ₺`;
}

export function formatOrderTime(dateStr) {
  if (dateStr == null || dateStr === "") return "—";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export function formatOrderDate(dateStr) {
  if (dateStr == null || dateStr === "") return "";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export function formatOrderDateTime(dateStr) {
  if (dateStr == null || dateStr === "") return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}
