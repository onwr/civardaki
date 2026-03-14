import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

export async function PATCH(request, context) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "Departman adı zorunludur." }, { status: 400 });

    const exists = await prisma.employee_department.findFirst({
      where: { id, businessId, isActive: true },
      select: { id: true },
    });
    if (!exists) return NextResponse.json({ error: "Departman bulunamadı." }, { status: 404 });

    await prisma.employee_department.update({
      where: { id },
      data: { name },
    });

    await prisma.employee.updateMany({
      where: { businessId, departmentId: id },
      data: { department: name },
    });

    return NextResponse.json({ message: "Departman güncellendi." });
  } catch (error) {
    console.error("Departments PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const exists = await prisma.employee_department.findFirst({
      where: { id, businessId, isActive: true },
      select: { id: true, _count: { select: { employees: true } } },
    });
    if (!exists) return NextResponse.json({ error: "Departman bulunamadı." }, { status: 404 });
    if (exists._count.employees > 0) {
      return NextResponse.json({ error: "Bu departmanda çalışanlar varken silinemez." }, { status: 400 });
    }

    await prisma.employee_department.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Departman kaldırıldı." });
  } catch (error) {
    console.error("Departments DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
