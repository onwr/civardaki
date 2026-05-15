import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canAccessBusinessPanel,
  getPanelHrefForUser,
  isBusinessPanelUser,
  userHasOwnedBusiness,
} from "@/lib/session-business-access";

export async function GET() {
  const allowProd = process.env.ALLOW_PANEL_DEBUG === "1";
  if (process.env.NODE_ENV === "production" && !allowProd) {
    return NextResponse.json({ error: "Disabled in production" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;

  let dbOwned = [];
  let dbUserByEmail = null;

  if (sessionUser?.id) {
    dbOwned = await prisma.ownedbusiness.findMany({
      where: { userId: sessionUser.id },
      select: {
        businessId: true,
        isPrimary: true,
        business: { select: { id: true, slug: true, name: true } },
      },
      orderBy: [{ isPrimary: "desc" }],
    });
  }

  if (sessionUser?.email) {
    dbUserByEmail = await prisma.user.findUnique({
      where: { email: sessionUser.email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        role: true,
        _count: { select: { ownedbusiness: true } },
      },
    });
  }

  const sessionSnapshot = sessionUser
    ? {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
        hasBusiness: sessionUser.hasBusiness,
        businessId: sessionUser.businessId,
        businessSlug: sessionUser.businessSlug,
      }
    : null;

  const flags = {
    userHasOwnedBusiness: userHasOwnedBusiness(sessionUser),
    canAccessBusinessPanel: canAccessBusinessPanel(sessionUser),
    isBusinessPanelUser: isBusinessPanelUser(sessionUser),
    panelHrefWouldBe: getPanelHrefForUser(sessionUser),
  };

  let diagnosis = "OK — işletme paneli beklenir";
  if (!sessionUser) diagnosis = "Oturum yok (giriş yapılmamış)";
  else if (dbOwned.length === 0 && dbUserByEmail?._count?.ownedbusiness === 0) {
    diagnosis = "DB'de bu userId için ownedbusiness kaydı YOK";
  } else if (dbOwned.length === 0 && (dbUserByEmail?._count?.ownedbusiness ?? 0) > 0) {
    diagnosis =
      "ownedbusiness var ama session.user.id ile eşleşmiyor (yanlış hesap veya id uyuşmazlığı)";
  } else if (!sessionUser.businessId && !sessionUser.hasBusiness) {
    diagnosis =
      "DB'de kayıt var ama JWT/session'da businessId ve hasBusiness boş — çıkış/giriş veya refreshBusiness gerekir";
  } else if (sessionUser?.role === "ADMIN" && !userHasOwnedBusiness(sessionUser)) {
    diagnosis = "ADMIN (işletmesiz): Panel /user, Admin Paneli menüden /admin";
  }

  return NextResponse.json({
    at: new Date().toISOString(),
    session: sessionSnapshot,
    db: {
      ownedbusinessForSessionUserId: dbOwned,
      userRowBySessionEmail: dbUserByEmail,
    },
    flags,
    diagnosis,
  });
}
