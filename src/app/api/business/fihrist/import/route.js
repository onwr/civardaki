import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { validateFihristClassIds } from "@/lib/fihrist-validate";

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

function toStr(v) {
  return (v ?? "").toString().trim();
}

function normHeader(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/i̇/g, "i");
}

/** @param {string[]} headers */
function buildColMap(headers) {
  const n = headers.map((h) => normHeader(h));
  const find = (...labels) => {
    for (const lab of labels) {
      const j = n.indexOf(normHeader(lab));
      if (j >= 0) return j;
    }
    return -1;
  };

  return {
    id: find("id"),
    name: find("isim", "isim / unvan", "ad"),
    phone1: find("telefon 1", "telefon1"),
    phone2: find("telefon 2", "telefon2"),
    email: find("e-posta", "eposta", "email", "e posta"),
    class1: find("sınıf 1", "sinif 1", "sınıf1"),
    class2: find("sınıf 2", "sinif 2", "sınıf2"),
    authorized: find("yetkili kişi", "yetkili kisi", "yetkili"),
    address: find("adres"),
    note: find("not"),
  };
}

async function ensureMasterName(businessId, kind, rawName) {
  const name = toStr(rawName);
  if (!name) return null;
  const found = await prisma.business_masterdata_entry.findFirst({
    where: { businessId, kind, name },
  });
  if (found) return found.id;
  try {
    const last = await prisma.business_masterdata_entry.findFirst({
      where: { businessId, kind },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const order = (last?.order ?? -1) + 1;
    const created = await prisma.business_masterdata_entry.create({
      data: { businessId, kind, name, order },
    });
    return created.id;
  } catch (e) {
    if (e?.code === "P2002") {
      const again = await prisma.business_masterdata_entry.findFirst({
        where: { businessId, kind, name },
      });
      return again?.id ?? null;
    }
    throw e;
  }
}

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  let buf;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ message: "Excel dosyası gerekli." }, { status: 400 });
    }
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ message: "Dosya okunamadı." }, { status: 400 });
  }

  let wb;
  try {
    wb = XLSX.read(buf, { type: "buffer" });
  } catch {
    return NextResponse.json({ message: "Geçersiz Excel dosyası." }, { status: 400 });
  }

  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) {
    return NextResponse.json({ message: "Sayfa bulunamadı." }, { status: 400 });
  }

  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });

  if (!matrix.length || !matrix[0]?.length) {
    return NextResponse.json({ message: "Boş dosya." }, { status: 400 });
  }

  const headers = matrix[0].map((c) => String(c ?? ""));
  const col = buildColMap(headers);

  if (col.name < 0) {
    return NextResponse.json(
      { message: "Excel’de «İsim» sütunu bulunamadı." },
      { status: 400 },
    );
  }

  const errors = [];
  let created = 0;
  let updated = 0;

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const excelRow = r + 1;
    const name = col.name >= 0 ? toStr(row[col.name]) : "";
    if (!name) continue;

    const idVal = col.id >= 0 ? toStr(row[col.id]) : "";
    const phone1 = col.phone1 >= 0 ? toStr(row[col.phone1]) : "";
    const phone2 = col.phone2 >= 0 ? toStr(row[col.phone2]) : "";
    const email = col.email >= 0 ? toStr(row[col.email]) : "";
    const authorizedPerson = col.authorized >= 0 ? toStr(row[col.authorized]) : "";
    const address = col.address >= 0 ? toStr(row[col.address]) : "";
    const note = col.note >= 0 ? toStr(row[col.note]) : "";

    let class1Id = null;
    let class2Id = null;
    try {
      if (col.class1 >= 0 && toStr(row[col.class1])) {
        class1Id = await ensureMasterName(auth.businessId, "FIHRIST_1", row[col.class1]);
      }
      if (col.class2 >= 0 && toStr(row[col.class2])) {
        class2Id = await ensureMasterName(auth.businessId, "FIHRIST_2", row[col.class2]);
      }
    } catch (e) {
      errors.push({ row: excelRow, message: String(e?.message || "Sınıf oluşturulamadı.") });
      continue;
    }

    const v = await validateFihristClassIds(auth.businessId, class1Id, class2Id);
    if (v.error) {
      errors.push({ row: excelRow, message: v.error });
      continue;
    }

    const payload = {
      name,
      phone1: phone1 || null,
      phone2: phone2 || null,
      email: email || null,
      authorizedPerson: authorizedPerson || null,
      address: address || null,
      note: note || null,
      class1Id: v.class1Id,
      class2Id: v.class2Id,
    };

    if (idVal) {
      const existing = await prisma.business_fihrist_entry.findFirst({
        where: { id: idVal, businessId: auth.businessId },
        select: { id: true },
      });
      if (!existing) {
        errors.push({
          row: excelRow,
          message: "Bu ID bu işletmeye ait değil veya yok.",
        });
        continue;
      }
      try {
        await prisma.business_fihrist_entry.update({
          where: { id: idVal },
          data: payload,
        });
        updated++;
      } catch (e) {
        errors.push({ row: excelRow, message: String(e?.message || "Güncellenemedi.") });
      }
    } else {
      try {
        await prisma.business_fihrist_entry.create({
          data: { businessId: auth.businessId, ...payload },
        });
        created++;
      } catch (e) {
        errors.push({ row: excelRow, message: String(e?.message || "Oluşturulamadı.") });
      }
    }
  }

  const parts = [];
  if (created) parts.push(`${created} yeni kayıt`);
  if (updated) parts.push(`${updated} güncellendi`);
  const message =
    parts.length > 0 ? parts.join(", ") + "." : "İşlenecek satır yoktu.";

  return NextResponse.json({
    created,
    updated,
    errors,
    message:
      errors.length > 0
        ? `${message} ${errors.length} satırda uyarı/hata.`
        : message,
  });
}
