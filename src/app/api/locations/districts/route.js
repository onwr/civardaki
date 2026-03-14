import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const DISTRICTS_PATH = path.join(process.cwd(), "src", "utils", "il-ilce-mahalle", "ilceler.json");

/**
 * GET /api/locations/districts?sehir_id=34 – Seçilen ile ait ilçeleri döndürür.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sehirId = searchParams.get("sehir_id");
    if (!sehirId) {
      return NextResponse.json([]);
    }
    const raw = fs.readFileSync(DISTRICTS_PATH, "utf-8");
    const data = JSON.parse(raw);
    const list = Array.isArray(data) ? data : [];
    const filtered = list.filter((d) => String(d.sehir_id) === String(sehirId));
    return NextResponse.json(filtered);
  } catch (err) {
    console.error("Locations districts error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
