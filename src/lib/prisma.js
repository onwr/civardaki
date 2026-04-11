import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

function createClient() {
  return new PrismaClient({
    log: ["query"],
  });
}

let prisma = globalForPrisma.prisma || createClient();

/**
 * Şema güncellemesinden sonra `npx prisma generate` çalıştırıldığında,
 * dev sunucusu yeniden başlatılmadan global singleton eski client kalır;
 * yeni model delegate'leri (ör. cash_project) undefined olur.
 */
if (
  process.env.NODE_ENV !== "production" &&
  prisma &&
  (
    typeof prisma.cash_project === "undefined" ||
    typeof prisma.cash_check === "undefined" ||
    typeof prisma.cash_promissory_note === "undefined" ||
    typeof prisma.warehouse_product_stock === "undefined" ||
    typeof prisma.production_run_line === "undefined" ||
    typeof prisma.productvariantdimension === "undefined" ||
    typeof prisma.productvariantdimensionvalue === "undefined" ||
    typeof prisma.business_masterdata_entry === "undefined" ||
    typeof prisma.business_proposal_template === "undefined" ||
    typeof prisma.business_label_template === "undefined" ||
    typeof prisma.business_fihrist_entry === "undefined" ||
    typeof prisma.lead_business_state === "undefined"
  )
) {
  prisma.$disconnect().catch(() => {});
  prisma = createClient();
  globalForPrisma.prisma = prisma;
  prisma.$connect().catch(() => {});
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// İlk importta motoru başlat; ilk paralel isteklerde "Engine is not yet connected" riskini azaltır.
prisma.$connect().catch((err) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("[prisma] $connect:", err?.message || err);
  }
});

export { prisma };
export default prisma;
