import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const BASE = path.join(process.cwd(), "src", "utils", "il-ilce-mahalle");
const MAHALLE_FILES = ["mahalleler-1.json", "mahalleler-2.json", "mahalleler-3.json", "mahalleler-4.json"];

/** İlçe id'ye göre mahalle listesi cache (process bazlı). */
let neighborhoodByIlceCache = null;

function loadAllNeighborhoods() {
  if (neighborhoodByIlceCache) return neighborhoodByIlceCache;
  const byIlce = {};
  for (const file of MAHALLE_FILES) {
    const filePath = path.join(BASE, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : [];
      list.forEach((m) => {
        const id = String(m.ilce_id);
        if (!byIlce[id]) byIlce[id] = [];
        byIlce[id].push({ mahalle_id: m.mahalle_id, mahalle_adi: m.mahalle_adi });
      });
    } catch (e) {
      console.warn("Neighborhood file read skip:", file, e.message);
    }
  }
  neighborhoodByIlceCache = byIlce;
  return byIlce;
}

/**
 * GET /api/locations/neighborhoods?ilce_id=1104 – Seçilen ilçeye ait mahalleleri döndürür.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ilceId = searchParams.get("ilce_id");
    if (!ilceId) {
      return NextResponse.json([]);
    }
    const byIlce = loadAllNeighborhoods();
    const list = byIlce[String(ilceId)] || [];
    return NextResponse.json(list);
  } catch (err) {
    console.error("Locations neighborhoods error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
