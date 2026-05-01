import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { resolveNextAuthSecret } from "@/lib/auth-secret";

const GUEST_ROUTES = new Set(["/login", "/register", "/forgot-password"]);
const ADMIN_ROUTES = new Set(["/admin", "/admin/"]);

function resolvePostLoginPath(role: unknown) {
  const normalizedRole = String(role ?? "").toUpperCase();
  return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN"
    ? "/admin/diplomas"
    : "/diplomas";
}

function isAdminRole(role: unknown) {
  const normalizedRole = String(role ?? "").toUpperCase();
  return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN";
}

function hasNextAuthSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
      req.cookies.get("next-auth.session-token")?.value
  );
}

function isProtectedRoute(pathname: string) {
  return (
    pathname === "/diplomas" ||
    pathname.startsWith("/diplomas/") ||
    pathname === "/exams" ||
    pathname.startsWith("/exams/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth.token || hasNextAuthSessionCookie(req);
    const role = req.nextauth.token?.role;
    const postLoginPath = resolvePostLoginPath(req.nextauth.token?.role);

    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(isAuthenticated ? postLoginPath : "/login", req.url)
      );
    }

    if (GUEST_ROUTES.has(pathname) && isAuthenticated) {
      return NextResponse.redirect(new URL(postLoginPath, req.url));
    }

    if (isProtectedRoute(pathname) && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if ((ADMIN_ROUTES.has(pathname) || pathname.startsWith("/admin/")) && !isAdminRole(role)) {
      return NextResponse.redirect(new URL("/diplomas", req.url));
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
    "/admin/:path*",
  ],
};
