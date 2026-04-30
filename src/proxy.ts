import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { resolveNextAuthSecret } from "@/lib/auth-secret";

const GUEST_ROUTES = new Set(["/login", "/register", "/forgot-password"]);

function isProtectedRoute(pathname: string) {
  return (
    pathname === "/diplomas" ||
    pathname.startsWith("/diplomas/") ||
    pathname === "/exams" ||
    pathname.startsWith("/exams/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
}

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth.token;
    const isProd = process.env.NODE_ENV === "production";

    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(isAuthenticated ? "/diplomas" : "/login", req.url)
      );
    }

    if (GUEST_ROUTES.has(pathname) && isAuthenticated && isProd) {
      return NextResponse.redirect(new URL("/diplomas", req.url));
    }

    if (isProtectedRoute(pathname) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    secret: resolveNextAuthSecret(),
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/diplomas/:path*",
    "/exams/:path*",
    "/account/:path*",
  ],
};
