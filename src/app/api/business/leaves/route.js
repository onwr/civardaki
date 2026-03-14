import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const LEAVE_TYPE_LABELS = {
  ANNUAL: "Yıllık İzin",
  SICK: "Hastalık İzni",
  UNPAID: "Ücretsiz İzin",
  MATERNITY: "Doğum İzni",
  PATERNITY: "Babalık İzni",
  OTHER: "Diğer",
};

async function requireContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return {
    businessId: session.user.businessId,
    userId: session.user.id || null,
  };
}

function normalizeLeaveType(value) {
  const type = String(value || "").trim().toUpperCase();
  if (["ANNUAL", "SICK", "UNPAID", "MATERNITY", "PATERNITY", "OTHER"].includes(type)) return type;
  return "OTHER";
}

function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export async function GET(request) {
  try {
    const context = await requireContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim().toLowerCase();
    const status = String(searchParams.get("status") || "all").trim().toUpperCase();
    const type = String(searchParams.get("type") || "all").trim().toUpperCase();

    const where = { businessId: context.businessId };
    if (status && status !== "ALL") where.status = status;
    if (type && type !== "ALL") where.leaveType = type;

    const rows = await prisma.employee_leave_request.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: {
        employee: { select: { id: true, name: true, department: true } },
        requestedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
    });

    const leaves = rows
      .map((item) => ({
        id: item.id,
        employeeId: item.employeeId,
        employeeName: item.employee?.name || "-",
        department: item.employee?.department || null,
        leaveType: item.leaveType.toLowerCase(),
        leaveTypeLabel: LEAVE_TYPE_LABELS[item.leaveType] || item.leaveType,
        startDate: item.startDate,
        endDate: item.endDate,
        days: item.days,
        reason: item.reason,
        notes: item.notes,
        status: item.status.toLowerCase(),
        submittedDate: item.createdAt,
        approvedBy: item.approvedBy?.name || null,
        approvedDate: item.approvedAt,
        rejectionReason: item.rejectionReason,
      }))
      .filter((item) => {
        if (!q) return true;
        return item.employeeName.toLowerCase().includes(q) || String(item.reason || "").toLowerCase().includes(q);
      });

    return NextResponse.json({
      leaves,
      stats: {
        total: leaves.length,
        pending: leaves.filter((l) => l.status === "pending").length,
        approved: leaves.filter((l) => l.status === "approved").length,
        rejected: leaves.filter((l) => l.status === "rejected").length,
        totalDays: leaves.filter((l) => l.status === "approved").reduce((sum, l) => sum + Number(l.days || 0), 0),
      },
    });
  } catch (error) {
    console.error("Leaves GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const context = await requireContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const employeeId = String(body.employeeId || "").trim();
    const leaveType = normalizeLeaveType(body.leaveType);
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;
    const reason = String(body.reason || "").trim();
    const notes = String(body.notes || "").trim() || null;

    if (!employeeId) return NextResponse.json({ error: "Çalışan seçimi zorunludur." }, { status: 400 });
    if (!startDate || Number.isNaN(startDate.getTime()) || !endDate || Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: "Başlangıç ve bitiş tarihi zorunludur." }, { status: 400 });
    }
    if (endDate < startDate) return NextResponse.json({ error: "Bitiş tarihi başlangıçtan önce olamaz." }, { status: 400 });
    if (!reason) return NextResponse.json({ error: "İzin nedeni zorunludur." }, { status: 400 });

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, businessId: context.businessId },
      select: { id: true },
    });
    if (!employee) return NextResponse.json({ error: "Çalışan bulunamadı." }, { status: 404 });

    const days = calculateDays(startDate, endDate);
    const created = await prisma.employee_leave_request.create({
      data: {
        businessId: context.businessId,
        employeeId,
        leaveType,
        startDate,
        endDate,
        days,
        reason,
        notes,
        status: "PENDING",
        requestedByUserId: context.userId,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "İzin talebi oluşturuldu." }, { status: 201 });
  } catch (error) {
    console.error("Leaves POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
