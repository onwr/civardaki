import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireBusinessSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session;
}

export async function GET(_req, { params }) {
  try {
    const session = await requireBusinessSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const row = await prisma.employee.findFirst({
      where: { id, businessId: session.user.businessId },
      include: {
        departmentRef: { select: { id: true, name: true } },
      },
    });
    if (!row) {
      return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
    }

    const { departmentRef, ...rest } = row;
    return NextResponse.json({
      ...rest,
      department: departmentRef?.name || row.department || null,
      departmentRefId: departmentRef?.id || row.departmentId || null,
    });
  } catch (error) {
    console.error("Employee GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

const STATUS_VALUES = new Set(["ACTIVE", "ON_LEAVE", "REMOTE", "TERMINATED"]);

export async function PATCH(req, { params }) {
  try {
    const session = await requireBusinessSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await params;
    const id = resolved?.id;
    if (!id) {
      return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const exists = await prisma.employee.findFirst({
      where: { id, businessId: session.user.businessId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { departmentId, ...updateData } = body;
    const data = {};

    if (departmentId !== undefined) {
      if (!departmentId) {
        data.departmentId = null;
        data.department = null;
      } else {
        const department = await prisma.employee_department.findFirst({
          where: { id: departmentId, businessId: session.user.businessId, isActive: true },
          select: { id: true, name: true },
        });
        if (!department) {
          return NextResponse.json({ error: "Departman bulunamadı." }, { status: 404 });
        }
        data.departmentId = department.id;
        data.department = department.name;
      }
    }

    const allowedKeys = new Set([
      "name",
      "position",
      "email",
      "phone",
      "salary",
      "status",
      "performance",
      "leaves",
      "avatar",
      "tcNo",
      "performanceNotes",
      "kpiTargets",
      "startDate",
    ]);

    for (const key of allowedKeys) {
      if (updateData[key] === undefined) continue;
      if (key === "salary") {
        const n = parseFloat(String(updateData.salary).replace(",", "."));
        data.salary = Number.isFinite(n) ? n : 0;
      } else if (key === "performance" || key === "leaves") {
        const n = parseInt(String(updateData[key]), 10);
        if (Number.isFinite(n)) data[key] = n;
      } else if (key === "startDate") {
        if (updateData.startDate === null || updateData.startDate === "") {
          data.startDate = new Date();
        } else {
          const d = new Date(updateData.startDate);
          if (!Number.isNaN(d.getTime())) data.startDate = d;
        }
      } else if (key === "status") {
        const s = String(updateData.status).trim();
        if (STATUS_VALUES.has(s)) data.status = s;
      } else if (key === "performanceNotes" || key === "kpiTargets") {
        const s = updateData[key] == null ? "" : String(updateData[key]);
        data[key] = s.trim().length ? s : null;
      } else if (typeof updateData[key] === "string") {
        const s = String(updateData[key]).trim();
        if (key === "email" || key === "phone" || key === "avatar" || key === "tcNo") {
          data[key] = s.length ? s : null;
        } else {
          data[key] = s;
        }
      } else {
        data[key] = updateData[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: {
        departmentRef: { select: { id: true, name: true } },
      },
    });

    const { departmentRef, ...rest } = employee;
    return NextResponse.json({
      ...rest,
      department: departmentRef?.name || employee.department || null,
      departmentRefId: departmentRef?.id || employee.departmentId || null,
    });
  } catch (error) {
    console.error("Employee PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
