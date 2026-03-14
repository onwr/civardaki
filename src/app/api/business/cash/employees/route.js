import { NextResponse } from "next/server";
import { mockEmployees } from "@/lib/mock-data/cash";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let employees = [...mockEmployees];

    if (search) {
      employees = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(search.toLowerCase()) ||
          emp.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Çalışanlar getirilemedi:", error);
    return NextResponse.json(
      { error: "Çalışanlar getirilemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newEmployee = {
      id: Date.now().toString(),
      ...body,
      status: "ACTIVE",
      startDate: new Date(),
    };
    return NextResponse.json({ employee: newEmployee });
  } catch (error) {
    console.error("Çalışan oluşturulamadı:", error);
    return NextResponse.json(
      { error: "Çalışan oluşturulamadı" },
      { status: 500 }
    );
  }
}

