import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isBusinessAdminRoute = req.nextUrl.pathname.startsWith("/business/dashboard");

        if (isBusinessAdminRoute) {
            // Allow unauthenticated access to login and register pages
            if (req.nextUrl.pathname.startsWith("/business/login") || req.nextUrl.pathname.startsWith("/business/register")) {
                return NextResponse.next();
            }

            if (!isAuth) {
                return NextResponse.redirect(new URL("/user/login", req.url));
            }

            // If we strictly want to ensure only BUSINESS or ADMIN roles can access /business routes:
            // if (token.role !== "BUSINESS" && token.role !== "ADMIN") {
            //   return NextResponse.redirect(new URL("/unauthorized", req.url));
            // }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Must return true to enter the middleware body above
            authorized: ({ token }) => true,
        },
    }
);

export const config = {
    matcher: ["/business/:path*"],
};
