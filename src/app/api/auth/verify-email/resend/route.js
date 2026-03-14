import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/mailer";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const email = session.user.email;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ error: "E-posta adresi zaten doğrulanmış" }, { status: 400 });
        }

        // 1. Generate new token
        const token = crypto.randomUUID();
        const expires = new Date();
        expires.setHours(expires.getHours() + 24);

        // 2. Clear old tokens and save new one
        await prisma.$transaction(async (tx) => {
            await tx.verificationtoken.deleteMany({
                where: { identifier: email },
            });

            await tx.verificationtoken.create({
                data: {
                    identifier: email,
                    token,
                    expires
                }
            });
        });

        // 3. Send email attached to background
        await sendVerificationEmail({ email, token });

        return NextResponse.json({ status: "success", message: "Doğrulama e-postası tekrar gönderildi." });

    } catch (error) {
        console.error("Resend Verification Email Error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
