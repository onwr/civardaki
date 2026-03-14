import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { slugifyTR, normalizeLocation } from "@/lib/formatters";
import { cookies } from "next/headers";
import crypto from "crypto";

function toStr(v) {
  return (v ?? "").toString().trim();
}

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function generateUniqueBusinessSlug(tx, businessName) {
  const baseSlug = slugifyTR(businessName) || "isletme";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await tx.business.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) return slug;
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

async function generateUniqueReferralCode(tx) {
  while (true) {
    const referralCode = `CIV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const existing = await tx.business.findUnique({
      where: { referralCode },
      select: { id: true },
    });

    if (!existing) return referralCode;
  }
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const cookieStore = await cookies();

    const email = toStr(form.get("email")).toLowerCase();
    const password = toStr(form.get("password"));
    const businessName = toStr(form.get("businessName"));

    const registrationMode = toStr(form.get("registrationMode")) || "detailed";
    const accountType =
      registrationMode === "quick"
        ? "individual"
        : toStr(form.get("accountType"));

    const phone = toStr(form.get("phone"));
    const address = toStr(form.get("address"));
    const city = normalizeLocation(toStr(form.get("city")));
    const district = normalizeLocation(toStr(form.get("district")));
    const description = toStr(form.get("description"));
    const website = toStr(form.get("website"));
    const foundationYear = toStr(form.get("foundationYear"));

    const ownerName =
      registrationMode === "quick"
        ? toStr(form.get("ownerName")) || businessName
        : toStr(form.get("ownerName"));

    const ownerRole =
      registrationMode === "quick"
        ? "İşletme Sahibi"
        : toStr(form.get("ownerRole"));

    const companyTitle = toStr(form.get("companyTitle"));
    const taxId = toStr(form.get("taxId"));
    const taxOffice = toStr(form.get("taxOffice"));
    const mersisNo = toStr(form.get("mersisNo"));

    const primaryCategoryId = toStr(form.get("primaryCategoryId"));
    const secondaryCategoryIds = parseJsonArray(
      toStr(form.get("secondaryCategoryIds"))
    );

    const latitude = form.get("latitude")
      ? parseFloat(form.get("latitude"))
      : null;
    const longitude = form.get("longitude")
      ? parseFloat(form.get("longitude"))
      : null;

    const logo = form.get("logo");

    if (registrationMode === "quick") {
      if (!email || !password || !businessName || !phone) {
        return NextResponse.json(
          {
            message:
              "Lütfen e-posta, şifre, işletme adı ve telefon bilgilerini doldurun.",
          },
          { status: 400 }
        );
      }
    } else {
      if (!email || !password || !ownerName || !businessName || !accountType) {
        return NextResponse.json(
          { message: "Lütfen temel bilgileri eksiksiz doldurun." },
          { status: 400 }
        );
      }

      if (!["individual", "corporate"].includes(accountType)) {
        return NextResponse.json(
          { message: "Hesap türü geçersiz." },
          { status: 400 }
        );
      }

      if (accountType === "corporate" && (!companyTitle || !taxOffice || !taxId)) {
        return NextResponse.json(
          {
            message:
              "Kurumsal hesap için şirket unvanı, vergi dairesi ve vergi no zorunludur.",
          },
          { status: 400 }
        );
      }
    }

    if (!primaryCategoryId) {
      return NextResponse.json(
        { message: "Lütfen bir ana kategori seçin." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Şifre en az 6 karakter olmalıdır." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kayıtlı." },
        { status: 409 }
      );
    }

    const primaryCategory = await prisma.category.findFirst({
      where: {
        id: primaryCategoryId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });

    if (!primaryCategory) {
      return NextResponse.json(
        { message: "Seçilen ana kategori geçersiz." },
        { status: 400 }
      );
    }

    const validSecondaryCategories = secondaryCategoryIds.length
      ? await prisma.category.findMany({
          where: {
            id: { in: secondaryCategoryIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

    const hashedPassword = await bcrypt.hash(password, 10);
    const capturedReferral = cookieStore.get("referralCode")?.value || null;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: ownerName,
          email,
          password: hashedPassword,
          role: "BUSINESS",
        },
      });

      const slug = await generateUniqueBusinessSlug(tx, businessName);
      const referralCode = await generateUniqueReferralCode(tx);

      const business = await tx.business.create({
        data: {
          slug,
          name: businessName,
          type: accountType === "corporate" ? "CORPORATE" : "INDIVIDUAL",
          description: description || null,
          phone: phone || null,
          email,
          website: website || null,
          address: address || null,
          city: city || null,
          district: district || null,
          latitude,
          longitude,
          referralCode,
          primaryCategoryId: primaryCategory.id,
          category: primaryCategory.name, // legacy alan, geçiş için dolu tutuyoruz
          officialName: companyTitle || null,
          taxId: taxId || null,
          taxOffice: taxOffice || null,
          representativeName: ownerName || null,
        },
      });

      const verificationTokenStr = crypto.randomUUID();
      const tokenExpires = new Date();
      tokenExpires.setHours(tokenExpires.getHours() + 24);

      await tx.verificationtoken.create({
        data: {
          identifier: email,
          token: verificationTokenStr,
          expires: tokenExpires,
        },
      });

      await tx.ownedbusiness.create({
        data: {
          userId: user.id,
          businessId: business.id,
          isPrimary: true,
        },
      });

      await tx.businesscategory.create({
        data: {
          businessId: business.id,
          categoryId: primaryCategory.id,
          isPrimary: true,
        },
      });

      if (validSecondaryCategories.length > 0) {
        await tx.businesscategory.createMany({
          data: validSecondaryCategories
            .filter((cat) => cat.id !== primaryCategory.id)
            .map((cat) => ({
              businessId: business.id,
              categoryId: cat.id,
              isPrimary: false,
            })),
          skipDuplicates: true,
        });
      }

      await tx.businessevent.create({
        data: {
          type:
            registrationMode === "quick"
              ? "QUICK_REGISTER_SUCCESS"
              : "SUBMIT_QUICK_REGISTER",
          businessId: business.id,
        },
      });

      const now = new Date();
      const expires = new Date();
      expires.setDate(now.getDate() + 14);

      await tx.businesssubscription.create({
        data: {
          businessId: business.id,
          status: "TRIAL",
          plan: "BASIC",
          startedAt: now,
          expiresAt: expires,
        },
      });

      if (capturedReferral) {
        const referrer = await tx.business.findUnique({
          where: { referralCode: capturedReferral },
          select: { id: true },
        });

        if (referrer && referrer.id !== business.id) {
          await tx.referral.create({
            data: {
              referrerId: referrer.id,
              invitedBizId: business.id,
              invitedEmail: user.email,
              referralCode: capturedReferral,
            },
          });
        }
      }

      return {
        userId: user.id,
        businessId: business.id,
        businessSlug: business.slug,
        email,
        token: verificationTokenStr,
      };
    });

    if (logo && typeof logo === "object" && typeof logo.arrayBuffer === "function") {
      try {
        const { processAndSaveMedia } = await import("@/lib/media");
        await processAndSaveMedia(
          logo,
          "LOGO",
          result.businessId,
          result.businessSlug
        );
      } catch (e) {
        console.error("Logo upload error:", e);
      }
    }

    try {
      const { sendVerificationEmail } = await import("@/lib/mailer");

      sendVerificationEmail({
        email: result.email,
        token: result.token,
      }).catch((e) => {
        console.error("[mailer] Failed to send verification email:", e);
      });

      await prisma.businessevent.create({
        data: {
          type: "EMAIL_VERIFICATION_SENT",
          businessId: result.businessId,
        },
      });
    } catch (e) {
      console.error("Verification email trigger error:", e);
    }

    return NextResponse.json(
      {
        message: "İşletme kaydı başarılı",
        result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Business Registration err:", error);
    return NextResponse.json(
      { message: "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}