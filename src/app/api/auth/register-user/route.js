import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Lütfen tüm gerekli alanları doldurun." }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: "Bu e-posta adresi zaten kullanımda." }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                // Phone would go somewhere if we had a phone field on User, but let's just create User for now.
            },
        });

        return NextResponse.json({ message: "Kayıt başarılı", user: { id: newUser.id, email: newUser.email, name: newUser.name } }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Bir hata oluştu. Lütfen tekrar deneyin." }, { status: 500 });
    }
}
