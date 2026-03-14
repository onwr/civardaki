import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "Token eksik" }, { status: 400 });
        }

        // Validate Token
        const verificationToken = await prisma.verificationtoken.findFirst({
            where: {
                token: token,
                expires: { gt: new Date() } // not expired
            }
        });

        if (!verificationToken) {
            return NextResponse.json({ error: "Geçersiz veya süresi dolmuş token. Lütfen yeni bir link isteyin." }, { status: 400 });
        }

        // Find User
        const user = await prisma.user.findUnique({
            where: { email: verificationToken.identifier }
        });

        if (!user) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        // Verify matches session user
        if (user.id !== session.user.id) {
            return NextResponse.json({ error: "Geçersiz istek oturumu" }, { status: 400 });
        }

        // Process Update
        await prisma.$transaction(async (tx) => {
            // 1. Mark as verified
            await tx.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            });

            // 2. Delete the token
            await tx.verificationtoken.deleteMany({
                where: { identifier: user.email }
            });
        });

        // SPRINT 11C: Check if this user was referred by someone, and notify referrer
        // 1. Get the business that just verified
        const newlyVerifiedBusiness = await prisma.business.findFirst({
            where: { email: user.email },
            select: { id: true, name: true }
        });

        if (newlyVerifiedBusiness) {
            // 2. Check if there's a referral record for them
            const referralRecord = await prisma.referral.findFirst({
                where: { invitedBizId: newlyVerifiedBusiness.id },
                include: {
                    business: {
                        select: { id: true, name: true, email: true }
                    }
                }
            });

            if (referralRecord && referralRecord.business && referralRecord.business.email) {
                // Determine total referrals for that referrer
                const totalRefs = await prisma.referral.count({
                    where: { referrerId: referralRecord.referrerId }
                });

                // Trigger Send
                try {
                    const { sendReferralSuccessEmail } = await import("@/lib/mails/send-referral-success");
                    sendReferralSuccessEmail({
                        email: referralRecord.business.email,
                        businessName: referralRecord.business.name,
                        businessId: referralRecord.business.id,
                        referralId: referralRecord.id,
                        invitedBizName: newlyVerifiedBusiness.name,
                        totalReferrals: totalRefs
                    }).catch(e => console.error("Logged Referral Success Email Failed:", e));
                } catch (e) {
                    console.error("Referral emailer failed to import:", e);
                }
            }
        }

        return NextResponse.json({ status: "success", message: "E-mail doğrulandı" });

    } catch (error) {
        console.error("Email Confirm Error:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}
