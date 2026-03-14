const BOM = "\uFEFF";
const SEP = ";";

/**
 * @param {object} stats - API stats: { summary, growthSeries, categoryDistribution }
 * @param {string} range - "7d" | "30d" | "1y"
 */
export function exportStatsToCsv(stats, range) {
  if (!stats) return;

  const rows = [];

  const summary = stats.summary || {};
  rows.push("Özet");
  rows.push(`Toplam Kullanıcı${SEP}${summary.totalUsers ?? ""}`);
  rows.push(`Toplam İşletme${SEP}${summary.totalBusinesses ?? ""}`);
  rows.push(`Aktif Abonelik${SEP}${summary.activeSubscriptions ?? ""}`);
  rows.push(`Toplam Gelir${SEP}${summary.totalRevenue ?? ""}`);
  rows.push(`Kullanıcı Artış Oranı (%)${SEP}${summary.userGrowthRate ?? ""}`);
  rows.push(`İşletme Artış Oranı (%)${SEP}${summary.businessGrowthRate ?? ""}`);
  rows.push(`Gelir Artış Oranı (%)${SEP}${summary.revenueGrowthRate ?? ""}`);
  rows.push(`Abonelik Artış Oranı (%)${SEP}${summary.subscriptionGrowthRate ?? ""}`);
  rows.push("");

  const series = stats.growthSeries || [];
  if (series.length > 0) {
    rows.push("Büyüme Serisi");
    rows.push(`Dönem${SEP}Kullanıcı${SEP}İşletme${SEP}Gelir`);
    series.forEach((s) => {
      rows.push([s.name ?? "", s.users ?? 0, s.business ?? 0, s.revenue ?? 0].join(SEP));
    });
    rows.push("");
  }

  const cats = stats.categoryDistribution || [];
  if (cats.length > 0) {
    rows.push("Kategori Dağılımı");
    rows.push(`Kategori${SEP}Adet${SEP}Yüzde`);
    cats.forEach((c) => {
      rows.push([c.name ?? "", c.value ?? 0, c.percent ?? 0].join(SEP));
    });
  }

  const csv = BOM + rows.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `admin-stats-${range || "30d"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
