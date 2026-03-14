import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireBusinessSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) return null;
    return session;
}

export async function GET() {
    try {
        const session = await requireBusinessSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businessId = session.user.businessId;

        const employees = await prisma.employee.findMany({
            where: { businessId },
            orderBy: { createdAt: "desc" },
            include: {
                departmentRef: { select: { id: true, name: true } },
                leaveRequests: {
                    where: { status: "PENDING" },
                    select: { id: true },
                },
            },
        });

        const stats = {
            total: employees.length,
            totalSalary: employees.reduce((acc, e) => acc + e.salary, 0),
            avgPerformance: employees.length > 0
                ? Math.round(employees.reduce((acc, e) => acc + e.performance, 0) / employees.length)
                : 0,
            onLeave: employees.filter(e => e.status === "ON_LEAVE").length
        };

        return NextResponse.json({
            employees: employees.map((e) => ({
                ...e,
                department: e.departmentRef?.name || e.department || null,
                pendingLeaveCount: e.leaveRequests?.length || 0,
            })),
            stats
        });
    } catch (error) {
        console.error("Employees GET Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await requireBusinessSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, position, email, phone, salary, departmentId } = body;

        if (!name || !position) {
            return NextResponse.json({ error: "Ad soyad ve pozisyon zorunludur." }, { status: 400 });
        }
        if (!departmentId) {
            return NextResponse.json({ error: "Departman seçimi zorunludur." }, { status: 400 });
        }

        const department = await prisma.employee_department.findFirst({
            where: { id: departmentId, businessId: session.user.businessId, isActive: true },
            select: { id: true, name: true },
        });
        if (!department) {
            return NextResponse.json({ error: "Departman bulunamadı." }, { status: 404 });
        }

        const employee = await prisma.employee.create({
            data: {
                businessId: session.user.businessId,
                name,
                position,
                email,
                phone,
                salary: parseFloat(salary) || 0,
                departmentId: department.id,
                department: department.name,
                status: "ACTIVE",
                performance: 100,
                avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`
            }
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Employees POST Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await requireBusinessSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, departmentId, ...updateData } = body;
        if (!id) {
            return NextResponse.json({ error: "Çalışan kimliği gerekli." }, { status: 400 });
        }

        if (updateData.salary) updateData.salary = parseFloat(updateData.salary);
        delete updateData.tcNo;

        if (departmentId !== undefined) {
            if (!departmentId) {
                updateData.departmentId = null;
                updateData.department = null;
            } else {
                const department = await prisma.employee_department.findFirst({
                    where: { id: departmentId, businessId: session.user.businessId, isActive: true },
                    select: { id: true, name: true },
                });
                if (!department) {
                    return NextResponse.json({ error: "Departman bulunamadı." }, { status: 404 });
                }
                updateData.departmentId = department.id;
                updateData.department = department.name;
            }
        }

        const exists = await prisma.employee.findFirst({
            where: { id, businessId: session.user.businessId },
            select: { id: true },
        });
        if (!exists) {
            return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
        }

        const employee = await prisma.employee.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error("Employees PATCH Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await requireBusinessSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ error: "Çalışan kimliği gerekli." }, { status: 400 });
        }

        const exists = await prisma.employee.findFirst({
            where: { id, businessId: session.user.businessId },
            select: { id: true },
        });
        if (!exists) {
            return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });
        }

        await prisma.employee.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Employees DELETE Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
