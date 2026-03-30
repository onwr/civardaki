import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (session.user.role !== "BUSINESS")
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId)
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

const HEADERS_FULL = [
  "ID",
  "İsim",
  "Telefon 1",
  "Telefon 2",
  "E-Posta",
  "Sınıf 1",
  "Sınıf 2",
  "Yetkili Kişi",
  "Adres",
  "Not",
];

const HEADERS_TEMPLATE = [
  "İsim",
  "Telefon 1",
  "Telefon 2",
  "E-Posta",
  "Sınıf 1",
  "Sınıf 2",
  "Yetkili Kişi",
  "Adres",
  "Not",
];

/** GET ?template=1 — yalnızca başlık (9 sütun). Aksi halde tüm kayıtlar (10 sütun, A=ID). */
export async function GET(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const { searchParams } = new URL(req.url);
  const templateOnly = searchParams.get("template") === "1";

  if (templateOnly) {
    const ws = XLSX.utils.aoa_to_sheet([HEADERS_TEMPLATE]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fihrist");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="fihrist-sablon-${stamp}.xlsx"`,
      },
    });
  }

  const rows = await prisma.business_fihrist_entry.findMany({
    where: { businessId: auth.businessId },
    orderBy: [{ name: "asc" }, { createdAt: "desc" }],
    include: {
      class1: { select: { name: true } },
      class2: { select: { name: true } },
    },
  });

  const aoa = [HEADERS_FULL];
  for (const r of rows) {
    aoa.push([
      r.id,
      r.name,
      r.phone1 ?? "",
      r.phone2 ?? "",
      r.email ?? "",
      r.class1?.name ?? "",
      r.class2?.name ?? "",
      r.authorizedPerson ?? "",
      r.address ?? "",
      r.note ?? "",
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fihrist");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fihrist-${stamp}.xlsx"`,
    },
  });
}
