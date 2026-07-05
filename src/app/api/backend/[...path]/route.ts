import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-base";
import { getServerAccessTokenFromRequest } from "@/lib/server-auth";

const PUBLIC_PATHS = new Set([
  "api/auth/send-email-verification",
  "api/auth/confirm-email-verification",
  "api/auth/register",
  "api/auth/forgot-password",
  "api/auth/reset-password",
]);

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path);
}

async function proxyRequest(
  req: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const path = pathSegments.join("/");
  const requestUrl = new URL(req.url);
  const targetUrl = `${API_BASE_URL}/${path}${requestUrl.search}`;

  const accessToken = await getServerAccessTokenFromRequest(req);

  if (!isPublicPath(path) && !accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const response = await fetch(targetUrl, init);
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Upstream request failed" },
      { status: 502 }
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { path } = await context.params;
  return proxyRequest(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
