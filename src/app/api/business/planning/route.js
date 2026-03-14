import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return n;
}

async function requireBusinessId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.businessId) return null;
  return session.user.businessId;
}

function buildWhere(businessId, q, type, status) {
  const where = { businessId };
  if (q) {
    where.OR = [{ title: { contains: q } }, { description: { contains: q } }, { assignedTo: { contains: q } }];
  }
  if (type && type !== "ALL") where.taskType = type;
  if (status && status !== "ALL") where.status = status;
  return where;
}

export async function GET(request) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const q = String(searchParams.get("q") || "").trim();
    const type = String(searchParams.get("type") || "ALL").trim().toUpperCase();
    const status = String(searchParams.get("status") || "ALL").trim().toUpperCase();
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const where = buildWhere(businessId, q, type, status);

    const [tasks, total, allTasks, projects] = await Promise.all([
      prisma.planning_task.findMany({
        where,
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          taskType: true,
          priority: true,
          status: true,
          progress: true,
          assignedTo: true,
          dueDate: true,
          budget: true,
          estimatedHours: true,
          spentHours: true,
          createdAt: true,
          updatedAt: true,
          projectId: true,
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.planning_task.count({ where }),
      prisma.planning_task.findMany({
        where: { businessId },
        select: { status: true, progress: true, dueDate: true },
      }),
      prisma.planning_project.findMany({
        where: { businessId, status: "ACTIVE" },
        orderBy: [{ createdAt: "desc" }],
        select: { id: true, name: true },
      }),
    ]);

    const now = new Date();
    const totalCount = allTasks.length;
    const doneCount = allTasks.filter((item) => item.status === "DONE").length;
    const inProgressCount = allTasks.filter((item) => item.status === "IN_PROGRESS").length;
    const overdueCount = allTasks.filter((item) => item.dueDate && new Date(item.dueDate) < now && item.status !== "DONE").length;
    const avgProgress = Math.round(
      allTasks.reduce((sum, item) => sum + toNumber(item.progress), 0) / Math.max(totalCount, 1)
    );

    return NextResponse.json({
      tasks,
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalCount,
        doneCount,
        inProgressCount,
        overdueCount,
        avgProgress,
      },
    });
  } catch (error) {
    console.error("Planning GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const businessId = await requireBusinessId();
    if (!businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    const description = String(body.description || "").trim() || null;
    const taskType = String(body.taskType || "TASK").trim().toUpperCase();
    const priority = String(body.priority || "MEDIUM").trim().toUpperCase();
    const status = String(body.status || "TODO").trim().toUpperCase();
    const progress = Math.max(0, Math.min(100, parseInt(body.progress ?? "0", 10) || 0));
    const assignedTo = String(body.assignedTo || "").trim() || null;
    const dueDate = body.dueDate ? new Date(body.dueDate) : null;
    const budget = toNumber(body.budget, 0);
    const estimatedHours = body.estimatedHours === "" || body.estimatedHours === null || body.estimatedHours === undefined
      ? null
      : Math.max(0, parseInt(body.estimatedHours, 10) || 0);
    const spentHours = body.spentHours === "" || body.spentHours === null || body.spentHours === undefined
      ? null
      : Math.max(0, parseInt(body.spentHours, 10) || 0);

    if (!title) return NextResponse.json({ error: "Başlık zorunludur." }, { status: 400 });
    if (!["TASK", "PROJECT", "SHIFT"].includes(taskType)) return NextResponse.json({ error: "Geçersiz görev tipi." }, { status: 400 });
    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) return NextResponse.json({ error: "Geçersiz öncelik." }, { status: 400 });
    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) return NextResponse.json({ error: "Geçersiz durum." }, { status: 400 });

    let projectId = body.projectId ? String(body.projectId).trim() : null;
    const projectName = String(body.projectName || "").trim();

    if (!projectId && projectName) {
      const createdProject = await prisma.planning_project.create({
        data: {
          businessId,
          name: projectName,
        },
        select: { id: true },
      });
      projectId = createdProject.id;
    }

    if (projectId) {
      const exists = await prisma.planning_project.findFirst({
        where: { id: projectId, businessId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: "Proje bulunamadı." }, { status: 404 });
      }
    }

    const created = await prisma.planning_task.create({
      data: {
        businessId,
        projectId,
        title,
        description,
        taskType,
        priority,
        status,
        progress,
        assignedTo,
        dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
        budget,
        estimatedHours,
        spentHours,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: created.id, message: "Görev oluşturuldu." }, { status: 201 });
  } catch (error) {
    console.error("Planning POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
