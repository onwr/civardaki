import { NextResponse } from "next/server";
import { getPublicBusinessCatalogBySlug } from "@/lib/business/getPublicBusinessCatalogBySlug";

export const revalidate = 60; // ISR cache for catalog views

export async function GET(_req, { params }) {
  try {
    const resolved = typeof params?.then === "function" ? await params : params;
    const slug = resolved?.slug;
    if (!slug) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const payload = await getPublicBusinessCatalogBySlug(slug);
    if (!payload) {
      return NextResponse.json({ message: "İşletme bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (e) {
    console.error("CATALOG API ERROR:", e);
    return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
  }
}
