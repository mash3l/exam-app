import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { resolveNextAuthSecret } from "@/lib/auth-secret";

export async function getServerAccessTokenFromRequest(
  req: NextRequest
): Promise<string | null> {
  const token = await getToken({ req, secret: resolveNextAuthSecret() });
  return typeof token?.accessToken === "string" ? token.accessToken : null;
}

async function getTokenFromCookieHeader(cookieHeader: string) {
  return getToken({
    req: { headers: { cookie: cookieHeader } } as unknown as NextRequest,
    secret: resolveNextAuthSecret(),
  });
}

export async function getServerAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const token = await getTokenFromCookieHeader(cookieHeader);

  return typeof token?.accessToken === "string" ? token.accessToken : null;
}
