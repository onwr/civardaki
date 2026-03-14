import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

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
    const data = {};

    if (body.title !== undefined) {
      const title = String(body.title || "").trim();
      if (!title) return NextResponse.json({ error: "Başlık boş olamaz." }, { status: 400 });
      data.title = title;
    }
    if (body.description !== undefined) data.description = String(body.description || "").trim() || null;
    if (body.taskType !== undefined) {
      const taskType = String(body.taskType || "").trim().toUpperCase();
      if (!["TASK", "PROJECT", "SHIFT"].includes(taskType)) {
        return NextResponse.json({ error: "Geçersiz görev tipi." }, { status: 400 });
      }
      data.taskType = taskType;
    }
    if (body.priority !== undefined) {
      const priority = String(body.priority || "").trim().toUpperCase();
      if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
        return NextResponse.json({ error: "Geçersiz öncelik." }, { status: 400 });
      }
      data.priority = priority;
    }
    if (body.status !== undefined) {
      const status = String(body.status || "").trim().toUpperCase();
      if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });
      }
      data.status = status;
      if (status === "DONE") data.progress = 100;
      if (status === "TODO" && body.progress === undefined) data.progress = 0;
    }
    if (body.progress !== undefined) {
      data.progress = Math.max(0, Math.min(100, parseInt(body.progress, 10) || 0));
    }
    if (body.assignedTo !== undefined) data.assignedTo = String(body.assignedTo || "").trim() || null;
    if (body.dueDate !== undefined) {
      if (!body.dueDate) {
        data.dueDate = null;
      } else {
        const dueDate = new Date(body.dueDate);
        data.dueDate = Number.isNaN(dueDate.getTime()) ? null : dueDate;
      }
    }
    if (body.budget !== undefined) {
      const budget = toNumber(body.budget);
      data.budget = budget === null ? 0 : budget;
    }
    if (body.estimatedHours !== undefined) {
      const estimatedHours = toNumber(body.estimatedHours);
      data.estimatedHours = estimatedHours === null ? null : Math.max(0, Math.floor(estimatedHours));
    }
    if (body.spentHours !== undefined) {
      const spentHours = toNumber(body.spentHours);
      data.spentHours = spentHours === null ? null : Math.max(0, Math.floor(spentHours));
    }

    if (!Object.keys(data).length) {
      return NextResponse.json({ error: "Güncellenecek alan yok." }, { status: 400 });
    }

    const current = await prisma.planning_task.findFirst({
      where: { id, businessId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Görev bulunamadı." }, { status: 404 });
    }

    await prisma.planning_task.update({
      where: { id },
      data,
    });

    return NextResponse.json({ message: "Görev güncellendi." });
  } catch (error) {
    console.error("Planning PATCH Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const current = await prisma.planning_task.findFirst({
      where: { id, businessId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Görev bulunamadı." }, { status: 404 });
    }

    await prisma.planning_task.delete({ where: { id } });
    return NextResponse.json({ message: "Görev silindi." });
  } catch (error) {
    console.error("Planning DELETE Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
