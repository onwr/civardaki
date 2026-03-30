import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TAG_COLORS = ["white", "green", "sky", "yellow", "slate", "red"];

/** Görsellerdeki varsayılan masraf yapısı — işletme için hiç kategori yoksa bir kez oluşturulur */
const DEFAULT_STRUCTURE = [
  { name: "ARAÇ GİDERLERİ", items: ["Bakım/Onarım", "Ceza", "Kasko/Sigorta", "Kiralama", "Muayene", "Vergi", "Yakıt"] },
  { name: "İŞLETME GİDERLERİ", items: ["Aidat", "Demirbaş", "Elektrik", "Isınma", "İletişim", "Kargo", "Kırtasiye", "Kira", "Makine Servis", "Pazaryeri Komisyon", "Su", "Temizlik"] },
  { name: "HAMMADDE", items: ["Kağıt-İlaç-Mürekkep", "Mdf-Sunta", "Tutkal-Yapıştırıcı"] },
  { name: "MALİ GİDERLER", items: ["Banka Masrafları", "Faiz", "KDV", "Kur Farkı", "Kurumlar Vergisi", "Mali Müşavir", "Noter", "Stopaj"] },
  { name: "PERSONEL GİDERLERİ", items: ["Maaş", "Prim", "Tazminat", "Ulaşım", "Vergi/SSK", "Yemek"] },
];

async function ensureSeedCategories(businessId) {
  const count = await prisma.expense_category.count({ where: { businessId } });
  if (count > 0) return;

  let order = 0;
  for (const block of DEFAULT_STRUCTURE) {
    const cat = await prisma.expense_category.create({
      data: {
        id: crypto.randomUUID(),
        businessId,
        name: block.name,
        sortOrder: order++,
      },
    });
    let i = 0;
    for (const itemName of block.items) {
      await prisma.expense_item.create({
        data: {
          id: crypto.randomUUID(),
          businessId,
          categoryId: cat.id,
          name: itemName,
          tagColor: TAG_COLORS[i % TAG_COLORS.length],
        },
      });
      i += 1;
    }
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const businessId = session.user.businessId;
    await ensureSeedCategories(businessId);

    const categories = await prisma.expense_category.findMany({
      where: { businessId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        items: {
          orderBy: { name: "asc" },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("expense-categories GET:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Ana masraf kalemi adı gerekli" }, { status: 400 });
    }

    const maxOrder = await prisma.expense_category.aggregate({
      where: { businessId: session.user.businessId },
      _max: { sortOrder: true },
    });

    const category = await prisma.expense_category.create({
      data: {
        id: crypto.randomUUID(),
        businessId: session.user.businessId,
        name,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("expense-categories POST:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
