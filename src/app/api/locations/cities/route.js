import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const CITIES_PATH = path.join(process.cwd(), "src", "utils", "il-ilce-mahalle", "sehirler.json");

/**
 * GET /api/locations/cities – Tüm illeri döndürür (sehirler.json).
 */
export async function GET() {
  try {
    const raw = fs.readFileSync(CITIES_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Locations cities error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
