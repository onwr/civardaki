import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

export async function GET() {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const departments = await prisma.employee_department.findMany({
      where: { businessId, isActive: true },
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    return NextResponse.json({
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        employeeCount: d._count.employees,
      })),
    });
  } catch (error) {
    console.error("Departments GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Departman adı zorunludur." }, { status: 400 });

    const exists = await prisma.employee_department.findFirst({
      where: { businessId, name, isActive: true },
      select: { id: true },
    });
    if (exists) return NextResponse.json({ error: "Bu departman zaten mevcut." }, { status: 409 });

    const department = await prisma.employee_department.create({
      data: { businessId, name },
      select: { id: true, name: true },
    });

    return NextResponse.json({ department, message: "Departman oluşturuldu." }, { status: 201 });
  } catch (error) {
    console.error("Departments POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
