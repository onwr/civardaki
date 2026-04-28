import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";
import { slugifyTR } from "@/lib/formatters";
import { parseTrMoney } from "@/lib/tr-money";
import {
  parsePriceCurrencyCell,
  parseSalesUnitCell,
  parseActiveCell,
} from "@/lib/product-bulk-update-parse";

async function requireBusiness() {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return { err: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!["BUSINESS", "ADMIN"].includes(session.user.role))
    return { err: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  const businessId = session.user.businessId;
  if (!businessId)
    return { err: NextResponse.json({ message: "Business not found" }, { status: 404 }) };
  return { businessId };
}

function toStr(v) {
  return (v ?? "").toString().trim();
}

/** Şablon / içe aktarma başlıkları (ID yok — yalnızca yeni ürün) */
export const IMPORT_CREATE_HEADERS = [
  "Ürün/Hizmet Adı",
  "Ürün Kodu",
  "Barkodu",
  "Marka",
  "Kategori",
  "Liste Satış Fiyatı",
  "İndirimli Fiyat",
  "Para Birimi",
  "Satış Birimi",
  "Stok",
  "Aktif/Pasif",
  "Etiketler",
  "Açıklama",
];

function normHeader(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/i̇/g, "i");
}

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
    name: find("ürün/hizmet adı", "ürün adı", "ürün hizmet adı", "ad"),
    productCode: find("ürün kodu", "ürün kodu "),
    barcode: find("barkodu", "barkod"),
    brand: find("marka"),
    category: find("kategori"),
    price: find("liste satış fiyatı", "satış fiyatı", "liste fiyatı", "fiyat"),
    discount: find("indirimli fiyat"),
    currency: find("para birimi"),
    salesUnit: find("satış birimi"),
    stock: find("stok"),
    active: find("aktif/pasif", "aktif pasif"),
    tags: find("etiketler"),
    description: find("açıklama", "aciklama", "description"),
  };
}

function randomSlugSuffix() {
  return Math.floor(1000 + Math.random() * 9000);
}

/** GET — boş şablon xlsx */
export async function GET() {
  const auth = await requireBusiness();
  if (auth.err) return auth.err;

  const ws = XLSX.utils.aoa_to_sheet([IMPORT_CREATE_HEADERS]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ürünler");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="urun-yukleme-sablonu-${stamp}.xlsx"`,
    },
  });
}

/** POST — yeni ürün satırları oluştur */
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
  const col = buildColMap(header);

  if (col.name < 0) {
    return NextResponse.json(
      {
        message:
          "«Ürün/Hizmet Adı» sütunu bulunamadı. Şablonu indirip ilk satırı değiştirmeyin.",
      },
      { status: 400 },
    );
  }

  const categories = await prisma.productcategory.findMany({
    where: { businessId: auth.businessId },
    select: { id: true, name: true },
  });
  const catByName = new Map();
  for (const c of categories) {
    catByName.set(c.name.trim().toLowerCase(), c.id);
  }

  const errors = [];
  let created = 0;

  for (let r = 1; r < matrix.length; r++) {
    const row = matrix[r];
    const excelRow = r + 1;

    if (col.id >= 0 && toStr(row[col.id])) {
      errors.push({
        row: excelRow,
        message:
          "Yeni yüklemede ID sütunu dolu olmamalı (satır atlandı). Güncelleme için Toplu güncelleme kullanın.",
      });
      continue;
    }

    const name = col.name >= 0 ? toStr(row[col.name]) : "";
    if (!name || name.length < 2) {
      continue;
    }

    const productCode =
      col.productCode >= 0 ? toStr(row[col.productCode]).slice(0, 64) || null : null;
    const barcode =
      col.barcode >= 0 ? toStr(row[col.barcode]).slice(0, 32) || null : null;
    const brand = col.brand >= 0 ? toStr(row[col.brand]) || null : null;

    let categoryId = null;
    if (col.category >= 0) {
      const cn = toStr(row[col.category]);
      if (cn) {
        const found = catByName.get(cn.toLowerCase());
        if (!found) {
          errors.push({
            row: excelRow,
            message: `Kategori bulunamadı: «${cn}» (ürün kategorileriyle aynı yazın).`,
          });
          continue;
        }
        categoryId = found;
      }
    }

    const priceRaw = col.price >= 0 ? row[col.price] : "";
    const discRaw = col.discount >= 0 ? row[col.discount] : "";
    let price = parseTrMoney(priceRaw);
    let discountPrice = parseTrMoney(discRaw);

    const curCell = col.currency >= 0 ? row[col.currency] : "";
    const pc = parsePriceCurrencyCell(curCell);
    if (toStr(curCell) && pc === null) {
      errors.push({
        row: excelRow,
        message: "Para birimi yalnızca TL, USD veya EUR olabilir.",
      });
      continue;
    }
    const priceCurrency = pc ?? "TL";

    const suCell = col.salesUnit >= 0 ? row[col.salesUnit] : "";
    const salesUnitParsed = parseSalesUnitCell(suCell);
    if (toStr(suCell) && !salesUnitParsed) {
      errors.push({
        row: excelRow,
        message: "Satış birimi tanınmadı (ör. ADET, KG).",
      });
      continue;
    }
    const salesUnit = salesUnitParsed;

    let stock = null;
    if (col.stock >= 0 && toStr(row[col.stock]) !== "") {
      const sn = parseInt(String(row[col.stock]).replace(/\s/g, ""), 10);
      stock = Number.isFinite(sn) ? Math.max(0, sn) : null;
    }

    const isActive =
      col.active >= 0 ? parseActiveCell(row[col.active]) : true;

    const tagsString = col.tags >= 0 ? toStr(row[col.tags]) || null : null;
    const description = col.description >= 0 ? toStr(row[col.description]) || null : null;

    if (price !== null && price < 0) {
      errors.push({ row: excelRow, message: "Fiyat negatif olamaz." });
      continue;
    }
    if (discountPrice !== null && price !== null && discountPrice > price) {
      errors.push({
        row: excelRow,
        message: "İndirimli fiyat, liste fiyatından büyük olamaz.",
      });
      continue;
    }
    if (discountPrice !== null && discountPrice < 0) {
      errors.push({ row: excelRow, message: "İndirimli fiyat geçersiz." });
      continue;
    }

    const baseSlug = slugifyTR(name) || "urun";
    let slug = `${baseSlug}-${randomSlugSuffix()}`;
    let attempts = 0;
    while (attempts < 8) {
      const clash = await prisma.product.findFirst({
        where: { businessId: auth.businessId, slug },
        select: { id: true },
      });
      if (!clash) break;
      slug = `${baseSlug}-${randomSlugSuffix()}`;
      attempts++;
    }

    try {
      await prisma.product.create({
        data: {
          businessId: auth.businessId,
          categoryId,
          brand,
          name,
          slug,
          description,
          price,
          discountPrice,
          priceCurrency,
          salesUnit,
          tagsString,
          imageUrl: null,
          imageGallery: null,
          order: 0,
          stock,
          maxOrderQty: null,
          barcode,
          productCode,
          gtip: null,
          gtin: null,
          countryCode: null,
          shelfLocation: null,
          stockTracking: "NORMAL",
          serialInvoiceMode: null,
          isActive,
          publishedOnMarketplace: false,
        },
      });
      created++;
    } catch (e) {
      console.error("import-create row", excelRow, e);
      errors.push({
        row: excelRow,
        message: e?.code === "P2002" ? "Benzersiz alan çakışması (barkod/slug)." : "Kayıt oluşturulamadı.",
      });
    }
  }

  const msg =
    created > 0
      ? `${created} ürün eklendi.${errors.length ? ` ${errors.length} satırda uyarı/hata.` : ""}`
      : errors.length
        ? "Hiç ürün eklenemedi."
        : "İşlenecek satır yoktu (ürün adı dolu satır gerekir).";

  return NextResponse.json({
    created,
    errors,
    message: msg,
  });
}
