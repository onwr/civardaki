/**
 * Admin users: CSV dışa aktarım (BOM'lu UTF-8, ; ayırıcı)
 * @param {Array<{ name?: string, email?: string, phone?: string, role?: string, status?: string, emailVerified?: string|Date|null, business?: { name?: string }|null, createdAt?: string|Date|null, lastLoginAt?: string|Date|null }>} items
 * @param {string} [filename] Örn: users-export.csv
 */
import { formatDate } from "./formatters";
import { getRoleLabel, getStatusLabel } from "./status-config";

const SEP = ";";
const BOM = "\uFEFF";

function escapeCsv(value) {
  if (value == null) return "";
  const s = String(value).trim();
  if (s.includes(SEP) || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportUsersCsv(items, filename = "users-export.csv") {
  const headers = [
    "Ad",
    "E-posta",
    "Telefon",
    "Rol",
    "Durum",
    "E-posta doğrulandı",
    "İşletme adı",
    "Kayıt tarihi",
    "Son giriş",
  ];

  const rows = items.map((item) => [
    escapeCsv(item.name),
    escapeCsv(item.email),
    escapeCsv(item.phone ?? ""),
    escapeCsv(getRoleLabel(item.role)),
    escapeCsv(getStatusLabel(item.status)),
    escapeCsv(item.emailVerified ? "Evet" : "Hayır"),
    escapeCsv(item.business?.name ?? ""),
    escapeCsv(item.createdAt ? formatDate(item.createdAt) : ""),
    escapeCsv(item.lastLoginAt ? formatDate(item.lastLoginAt) : ""),
  ]);

  const headerLine = headers.join(SEP);
  const bodyLines = rows.map((r) => r.join(SEP));
  const csv = BOM + [headerLine, ...bodyLines].join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
