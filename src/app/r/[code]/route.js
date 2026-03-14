import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, context) {
  const { code } = await context.params;
  const normalizedCode = String(code || "").trim().toUpperCase();

  if (!normalizedCode) {
    return NextResponse.redirect(new URL("/business/register", req.url));
  }

  const referrer = await prisma.business.findUnique({
    where: { referralCode: normalizedCode },
    select: { id: true, name: true },
  });

  const registerUrl = new URL("/business/register", req.url);
  registerUrl.searchParams.set("ref", normalizedCode);
  registerUrl.searchParams.set("via", "referral");
  const response = NextResponse.redirect(registerUrl);

  if (referrer) {
    response.cookies.set("referralCode", normalizedCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    console.log(`[Referral Link Visit] Code: ${normalizedCode} from ${referrer.name}`);
  }

  return response;
}
