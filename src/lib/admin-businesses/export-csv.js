const BOM = "\uFEFF";
const SEP = ";";

function escapeCsv(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(SEP) || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatExpiry(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("tr-TR");
}

/**
 * @param {Array<object>} items - Liste API'den dönen işletmeler
 */
export function exportBusinessesToCsv(items) {
  if (!Array.isArray(items) || items.length === 0) return;

  const headers = [
    "name",
    "slug",
    "category",
    "city",
    "email",
    "phone",
    "isActive",
    "verified",
    "subscriptionPlan",
    "subscriptionStatus",
    "expiresAt",
    "leadCount",
    "reviewCount",
    "createdAt",
  ];

  const rows = [
    headers.join(SEP),
    ...items.map((b) => {
      const cat = b.primaryCategory?.name ?? b.category ?? "";
      const sub = b.subscription;
      const count = b._count || {};
      return [
        escapeCsv(b.name),
        escapeCsv(b.slug),
        escapeCsv(cat),
        escapeCsv(b.city),
        escapeCsv(b.email),
        escapeCsv(b.phone),
        b.isActive ? "Evet" : "Hayır",
        b.isVerified ? "Evet" : "Hayır",
        escapeCsv(sub?.plan ?? ""),
        escapeCsv(sub?.status ?? ""),
        escapeCsv(formatExpiry(sub?.expiresAt)),
        String(count.leads ?? 0),
        String(count.reviews ?? 0),
        escapeCsv(b.createdAt ? new Date(b.createdAt).toLocaleString("tr-TR") : ""),
      ].join(SEP);
    }),
  ];

  const csv = BOM + rows.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `isletmeler-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
