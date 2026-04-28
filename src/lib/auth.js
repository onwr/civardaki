import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ornek@email.com",
        },
        password: {
          label: "Şifre",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toLowerCase().trim();
        const password = credentials?.password || "";

        if (!email || !password) {
          throw new Error("Lütfen tüm alanları doldurun.");
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            ownedbusiness: {
              select: {
                isPrimary: true,
                businessId: true,
                business: {
                  select: {
                    slug: true,
                    name: true,
                    isOpen: true,
                  },
                },
              },
              orderBy: [{ isPrimary: "desc" }],
              take: 10,
            },
          },
        });

        if (!user || !user.password) {
          throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("Hatalı şifre girdiniz.");
        }

        const primaryBusiness =
          user.ownedbusiness?.find((item) => item.isPrimary) ||
          user.ownedbusiness?.[0] ||
          null;
        const hasBusiness = user.ownedbusiness?.length > 0;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
          phone: user.phone || null,
          role: user.role,
          hasBusiness,
          businessId: primaryBusiness?.businessId || null,
          businessSlug: primaryBusiness?.business?.slug || null,
          businessName: primaryBusiness?.business?.name || null,
          businessIsOpen: primaryBusiness?.business?.isOpen ?? true,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.image = user.image || null;
        token.hasBusiness = !!user.hasBusiness;
        token.businessId = user.businessId ?? null;
        token.businessSlug = user.businessSlug ?? null;
        token.businessName = user.businessName ?? null;
        token.businessIsOpen = user.businessIsOpen ?? true;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: {
            id: true,
            name: true,
            image: true,
            phone: true,
            role: true,
            ownedbusiness: {
              select: {
                isPrimary: true,
                businessId: true,
                business: {
                  select: {
                    slug: true,
                    name: true,
                    isOpen: true,
                  },
                },
              },
              orderBy: [{ isPrimary: "desc" }],
              take: 10,
            },
          },
        });

        if (dbUser) {
          const primaryBusiness =
            dbUser.ownedbusiness?.find((item) => item.isPrimary) ||
            dbUser.ownedbusiness?.[0] ||
            null;

          token.id = dbUser.id;
          token.name = dbUser.name || token.name;
          token.image = dbUser.image || null;
          token.phone = dbUser.phone || null;
          token.role = dbUser.role || "USER";
          token.hasBusiness = dbUser.ownedbusiness.length > 0;
          token.businessId = primaryBusiness?.businessId || null;
          token.businessSlug = primaryBusiness?.business?.slug || null;
          token.businessName = primaryBusiness?.business?.name || null;
          token.businessIsOpen = primaryBusiness?.business?.isOpen ?? true;
        }
      }

      if (trigger === "update") {
        if (session?.name) token.name = session.name;
        if (session?.image !== undefined) token.image = session.image || null;
        if (session?.phone !== undefined) token.phone = session.phone || null;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name || session.user.name;
        session.user.email = token.email || session.user.email;
        session.user.image = token.image || null;
        session.user.phone = token.phone || null;
        session.user.role = token.role || "USER";
        session.user.hasBusiness = !!token.hasBusiness;
        session.user.businessId = token.businessId || null;
        session.user.businessSlug = token.businessSlug || null;
        session.user.businessName = token.businessName || null;
        session.user.businessIsOpen = token.businessIsOpen ?? true;
      }

      return session;
    },
  },

  pages: {
    signIn: "/user/login",
    error: "/user/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};