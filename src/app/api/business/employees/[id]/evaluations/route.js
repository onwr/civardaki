import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function getEmployeeEvaluationDelegate() {
  return prisma.employee_evaluation || prisma.employeeEvaluation || null;
}

async function getContext(params) {
  const session = await getServerSession(authOptions);
  const businessId = session?.user?.businessId;
  if (!businessId) return { error: "Unauthorized", status: 401 };

  const resolved = await params;
  const employeeId = resolved?.id;
  if (!employeeId) return { error: "Çalışan bulunamadı.", status: 400 };

  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, businessId },
    select: { id: true },
  });
  if (!employee) return { error: "Çalışan bulunamadı.", status: 404 };

  return { businessId, employeeId };
}

export async function GET(_req, { params }) {
  try {
    const delegate = getEmployeeEvaluationDelegate();
    if (!delegate) {
      return NextResponse.json(
        { error: "Değerlendirme modeli hazır değil. Sunucuyu yeniden başlatın ve prisma generate çalıştırın." },
        { status: 500 },
      );
    }

    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const items = await delegate.findMany({
      where: { businessId: ctx.businessId, employeeId: ctx.employeeId },
      orderBy: { reviewDate: "desc" },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error("Employee evaluations GET Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const delegate = getEmployeeEvaluationDelegate();
    if (!delegate) {
      return NextResponse.json(
        { error: "Değerlendirme modeli hazır değil. Sunucuyu yeniden başlatın ve prisma generate çalıştırın." },
        { status: 500 },
      );
    }

    const ctx = await getContext(params);
    if (ctx.error) {
      return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    }

    const body = await req.json().catch(() => ({}));
    const periodLabel = body?.periodLabel != null ? String(body.periodLabel).trim() || null : null;
    const strengths = body?.strengths != null ? String(body.strengths).trim() || null : null;
    const improvements = body?.improvements != null ? String(body.improvements).trim() || null : null;

    let reviewDate = new Date();
    if (body?.reviewDate) {
      const d = new Date(body.reviewDate);
      if (!Number.isNaN(d.getTime())) reviewDate = d;
    }

    let overallScore = 0;
    if (body?.overallScore != null) {
      const n = parseInt(String(body.overallScore), 10);
      if (Number.isFinite(n)) overallScore = Math.min(100, Math.max(0, n));
    }

    let criteriaJson = null;
    if (body?.criteriaJson != null && typeof body.criteriaJson === "object" && !Array.isArray(body.criteriaJson)) {
      criteriaJson = body.criteriaJson;
    }

    const created = await delegate.create({
      data: {
        businessId: ctx.businessId,
        employeeId: ctx.employeeId,
        reviewDate,
        periodLabel,
        overallScore,
        criteriaJson,
        strengths,
        improvements,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Employee evaluations POST Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
