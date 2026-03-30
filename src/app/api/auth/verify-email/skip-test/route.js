import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Canlıya alınmadan önce kapatılacak: yalnızca geliştirme veya ALLOW_SKIP_EMAIL_VERIFICATION=true */
function isSkipAllowed() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_SKIP_EMAIL_VERIFICATION === "true"
  );
}

/** GET — butonun görünürlüğü için (tek kaynak) */
export async function GET() {
  return NextResponse.json({
    allowed: isSkipAllowed(),
  });
}

export async function POST() {
  try {
    if (!isSkipAllowed()) {
      return NextResponse.json(
        { error: "Bu işlem devre dışı." },
        { status: 403 },
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "E-posta zaten doğrulanmış" },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
      if (user.email) {
        await tx.verificationtoken.deleteMany({
          where: { identifier: user.email },
        });
      }
    });

    return NextResponse.json({
      status: "success",
      message: "E-posta doğrulaması atlandı (test).",
    });
  } catch (error) {
    console.error("skip-test verify-email:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
