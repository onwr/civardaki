import { NextResponse } from "next/server";
import { getPublicBusinessBySlug } from "@/lib/business/getPublicBusinessBySlug";

export async function GET(_req, { params }) {
  try {
    const resolved = params != null && typeof params.then === "function" ? await params : params || {};
    const slug = resolved?.slug?.toString?.()?.trim();
    if (!slug) return NextResponse.json({ message: "Bad request" }, { status: 400 });

    const payload = await getPublicBusinessBySlug(slug);
    if (!payload) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (e) {
    console.error("PUBLIC BUSINESS DETAIL ERROR:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
