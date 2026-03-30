import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

/** parentId null olanları önce, sonra derinlik öncelikli düz liste */
function flattenTree(rows) {
  const byParent = new Map();
  for (const r of rows) {
    const key = r.parentId ?? "__root__";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(r);
  }
  const sort = (a, b) => a.name.localeCompare(b.name, "tr");
  for (const [, arr] of byParent) arr.sort(sort);

  const out = [];
  function walk(parentKey, depth) {
    const kids = byParent.get(parentKey) || [];
    for (const p of kids) {
      out.push({
        id: p.id,
        name: p.name,
        description: p.description,
        parentId: p.parentId,
        status: p.status,
        depth,
        createdAt: p.createdAt,
      });
      walk(p.id, depth + 1);
    }
  }
  walk("__root__", 0);
  return out;
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const { searchParams } = new URL(req.url || "", "http://localhost");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const rows = await prisma.cash_project.findMany({
      where: { businessId },
      orderBy: [{ createdAt: "desc" }],
      take: 500,
    });

    let flat = flattenTree(rows);
    if (!includeInactive) {
      flat = flat.filter((p) => p.status === "ACTIVE");
    }

    return NextResponse.json({ projects: flat });
  } catch (e) {
    console.error("cash projects GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const businessId = session.user.businessId;
    const body = await req.json();
    const name = (body.name || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Proje adı gerekli" }, { status: 400 });
    }

    let parentId = null;
    if (body.parentId) {
      const parent = await prisma.cash_project.findFirst({
        where: { id: body.parentId, businessId },
      });
      if (!parent) return NextResponse.json({ error: "Üst proje bulunamadı" }, { status: 400 });
      parentId = parent.id;
    }

    const project = await prisma.cash_project.create({
      data: {
        businessId,
        parentId,
        name,
        description: body.description?.trim() || null,
        notes: body.notes?.trim() || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      parentId: project.parentId,
      status: project.status,
    });
  } catch (e) {
    console.error("cash projects POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
