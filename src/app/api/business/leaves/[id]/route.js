import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return {
    businessId: session.user.businessId,
    userId: session.user.id || null,
  };
}

async function syncEmployeeOnLeaveStatus(employeeId, businessId) {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, businessId },
    select: { id: true, status: true },
  });
  if (!employee) return;
  if (employee.status === "TERMINATED") return;

  const now = new Date();
  const activeLeave = await prisma.employee_leave_request.findFirst({
    where: {
      businessId,
      employeeId,
      status: "APPROVED",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: { id: true },
  });

  if (activeLeave && employee.status !== "ON_LEAVE") {
    await prisma.employee.update({ where: { id: employeeId }, data: { status: "ON_LEAVE" } });
  } else if (!activeLeave && employee.status === "ON_LEAVE") {
    await prisma.employee.update({ where: { id: employeeId }, data: { status: "ACTIVE" } });
  }
}

export async function PATCH(request, context) {
  try {
    const sessionContext = await requireContext();
    if (!sessionContext) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || "").trim().toLowerCase();
    const rejectionReason = String(body.rejectionReason || "").trim() || null;

    const leave = await prisma.employee_leave_request.findFirst({
      where: { id, businessId: sessionContext.businessId },
      select: { id: true, employeeId: true, status: true, days: true },
    });
    if (!leave) return NextResponse.json({ error: "İzin talebi bulunamadı." }, { status: 404 });

    const now = new Date();
    const updateData = {};
    let nextStatus = leave.status;

    if (action === "approve") {
      nextStatus = "APPROVED";
      updateData.status = "APPROVED";
      updateData.approvedAt = now;
      updateData.approvedByUserId = sessionContext.userId;
      updateData.rejectedAt = null;
      updateData.rejectionReason = null;
    } else if (action === "reject") {
      nextStatus = "REJECTED";
      updateData.status = "REJECTED";
      updateData.rejectedAt = now;
      updateData.rejectionReason = rejectionReason;
      updateData.approvedAt = null;
      updateData.approvedByUserId = sessionContext.userId;
    } else if (action === "cancel") {
      nextStatus = "CANCELLED";
      updateData.status = "CANCELLED";
      updateData.approvedAt = null;
      updateData.rejectedAt = null;
    } else {
      return NextResponse.json({ error: "Geçersiz işlem." }, { status: 400 });
    }

    await prisma.employee_leave_request.update({
      where: { id: leave.id },
      data: updateData,
    });

    if (leave.status !== "APPROVED" && nextStatus === "APPROVED") {
      await prisma.employee.update({
        where: { id: leave.employeeId },
        data: { leaves: { increment: leave.days } },
      });
    } else if (leave.status === "APPROVED" && nextStatus !== "APPROVED") {
      await prisma.employee.update({
        where: { id: leave.employeeId },
        data: { leaves: { decrement: leave.days } },
      });
    }

    await syncEmployeeOnLeaveStatus(leave.employeeId, sessionContext.businessId);

    return NextResponse.json({ message: "İzin talebi güncellendi." });
  } catch (error) {
    console.error("Leaves PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
