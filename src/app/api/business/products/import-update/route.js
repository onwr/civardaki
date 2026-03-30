import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { parseTrMoney } from "@/lib/tr-money";
import {
  normProductName,
  parsePriceCurrencyCell,
  parseSalesUnitCell,
  parseActiveCell,
} from "@/lib/product-bulk-update-parse";

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

export async function POST(req) {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size) {
    return NextResponse.json({ message: "Excel dosyası gerekli." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  let workbook;
  try {
    workbook = XLSX.read(buf, { type: "buffer" });
  } catch {
    return NextResponse.json({ message: "Excel okunamadı." }, { status: 400 });
  }

  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  if (!ws) {
    return NextResponse.json({ message: "Sayfa bulunamadı." }, { status: 400 });
  }

  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!matrix.length || matrix.length < 2) {
    return NextResponse.json({ message: "Dosyada veri yok." }, { status: 400 });
  }

  const header = matrix[0].map((h) => String(h ?? "").trim());
  const idCol = header.findIndex((h) => /^id$/i.test(h));
  if (idCol < 0) {
    return NextResponse.json(
      { message: "ID sütunu bulunamadı. İlk satırı değiştirmeyin." },
      { status: 400 },
    );
  }

  const nameCol = header.findIndex((h) =>
    /ürün.*hizmet.*ad/i.test(h),
  );
  const idx = (label) => header.findIndex((h) => h === label);

  let cPrice = idx("Liste Satış Fiyatı");
  if (cPrice < 0) cPrice = idCol + 2;
  let cDisc = idx("İndirimli Fiyat");
  if (cDisc < 0) cDisc = idCol + 3;
  let cCur = idx("Para Birimi");
  let cUnit = idx("Satış Birimi");
  let cStock = idx("Stok");
  let cAct = idx("Aktif/Pasif");
  let cTags = idx("Etiketler");

  if (header.length >= 9) {
    if (cCur < 0) cCur = idCol + 4;
    if (cUnit < 0) cUnit = idCol + 5;
    if (cStock < 0) cStock = idCol + 6;
    if (cAct < 0) cAct = idCol + 7;
    if (cTags < 0) cTags = idCol + 8;
  }

  const nameColResolved = nameCol >= 0 ? nameCol : idCol + 1;

  const errors = [];
  let updated = 0;

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const excelRow = r + 1;
    const id = String(row[idCol] ?? "").trim();
    if (!id) continue;

    const nameCell = String(row[nameColResolved] ?? "").trim();

    const existing = await prisma.product.findFirst({
      where: { id, businessId: auth.businessId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existing) {
      errors.push({
        row: excelRow,
        message: "Bu ID bu işletmeye ait değil veya yok (yeni satır eklemeyin).",
      });
      continue;
    }

    if (nameCell && normProductName(nameCell) !== normProductName(existing.name)) {
      errors.push({
        row: excelRow,
        message: "Ürün adı değiştirilmemelidir; dosyadaki ad sistemle eşleşmiyor.",
      });
      continue;
    }

    const priceRaw = row[cPrice];
    const discRaw = row[cDisc];
    const price =
      priceRaw === "" || priceRaw === undefined || priceRaw === null
        ? undefined
        : parseTrMoney(priceRaw);
    const discountPrice =
      discRaw === "" || discRaw === undefined || discRaw === null
        ? undefined
        : parseTrMoney(discRaw);

    if (
      String(priceRaw ?? "").trim() && (price === null || price === undefined)
    ) {
      errors.push({ row: excelRow, message: "Liste fiyatı sayı olarak okunamadı." });
      continue;
    }
    if (
      String(discRaw ?? "").trim() &&
      (discountPrice === null || discountPrice === undefined)
    ) {
      errors.push({ row: excelRow, message: "İndirimli fiyat sayı olarak okunamadı." });
      continue;
    }

    if (price !== undefined && price !== null && price < 0) {
      errors.push({ row: excelRow, message: "Liste fiyatı geçersiz." });
      continue;
    }
    if (
      discountPrice !== undefined &&
      discountPrice !== null &&
      price !== undefined &&
      price !== null &&
      discountPrice > price
    ) {
      errors.push({
        row: excelRow,
        message: "İndirimli fiyat, liste fiyatından büyük olamaz.",
      });
      continue;
    }

    const curRaw = cCur >= 0 ? row[cCur] : "";
    const curParsed = parsePriceCurrencyCell(curRaw);
    if (curParsed === null) {
      errors.push({ row: excelRow, message: "Para birimi: yalnızca TL, USD veya EUR." });
      continue;
    }

    const unitTrim = String(cUnit >= 0 ? row[cUnit] ?? "" : "").trim();
    let salesUnitUpdate = undefined;
    if (unitTrim) {
      const unitParsed = parseSalesUnitCell(unitTrim);
      if (unitParsed === null) {
        errors.push({
          row: excelRow,
          message: "Satış birimi tanınmadı (ör. Adet, KG, ADET).",
        });
        continue;
      }
      salesUnitUpdate = unitParsed;
    }

    let stockVal = undefined;
    if (cStock >= 0) {
      const st = String(row[cStock] ?? "").trim();
      if (st === "") stockVal = null;
      else {
        const n = parseInt(st, 10);
        if (!Number.isFinite(n)) {
          errors.push({ row: excelRow, message: "Stok sayı olarak okunamadı." });
          continue;
        }
        stockVal = n;
      }
    }

    const isActive = cAct >= 0 ? parseActiveCell(row[cAct]) : undefined;

    let tagsString = undefined;
    if (cTags >= 0) {
      const t = String(row[cTags] ?? "").trim();
      tagsString = t === "" ? null : t.slice(0, 8000);
    }

    await prisma.product.update({
      where: { id },
      data: {
        ...(price !== undefined ? { price } : {}),
        ...(discountPrice !== undefined ? { discountPrice } : {}),
        priceCurrency: curParsed,
        ...(salesUnitUpdate !== undefined ? { salesUnit: salesUnitUpdate } : {}),
        ...(stockVal !== undefined ? { stock: stockVal } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(tagsString !== undefined ? { tagsString } : {}),
      },
    });
    updated++;
  }

  return NextResponse.json({
    updated,
    errors,
    message:
      errors.length === 0
        ? `${updated} ürün güncellendi.`
        : `${updated} ürün güncellendi, ${errors.length} satır atlandı/hata.`,
  });
}
