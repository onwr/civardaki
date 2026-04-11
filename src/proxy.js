import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isBusinessAdminRoute = req.nextUrl.pathname.startsWith("/business/dashboard");

    if (isBusinessAdminRoute) {
      if (
        req.nextUrl.pathname.startsWith("/business/login") ||
        req.nextUrl.pathname.startsWith("/business/register")
      ) {
        return NextResponse.next();
      }

      if (!isAuth) {
        return NextResponse.redirect(new URL("/user/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/business/:path*"],
};
