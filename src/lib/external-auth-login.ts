import { API_BASE_URL } from "@/lib/api-base";

const LOGIN_URL = `${API_BASE_URL}/api/auth/login`;

/** Which JSON key carries the identifier (email or username string). */
function loginIdentifierKey(): "username" | "email" {
  const v = process.env.NEXT_PUBLIC_AUTH_LOGIN_IDENTIFIER_KEY?.trim().toLowerCase();
  return v === "email" ? "email" : "username";
}

export function buildLoginRequestBody(identifier: string, password: string): Record<string, string> {
  const key = loginIdentifierKey();
  return {
    [key]: identifier,
    password,
  };
}

function parseJsonSafe(text: string): unknown {
  if (!text.trim()) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { _nonJsonBody: text };
  }
}

function extractBackendMessage(parsed: unknown, rawText: string, httpStatus: number): string {
  if (parsed && typeof parsed === "object") {
    const o = parsed as Record<string, unknown>;
    const payload = o.payload;
    const fromPayload =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>).message ?? (payload as Record<string, unknown>).error
        : undefined;
    const msg = o.message ?? o.error ?? fromPayload;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
    if (Array.isArray(msg) && msg.length) return msg.map(String).join("; ");
  }
  if (rawText.trim()) return rawText.trim().slice(0, 500);
  return `Login failed (HTTP ${httpStatus})`;
}

/** Pull bearer/JWT token from common API response shapes. */
export function extractAccessTokenFromLoginResponse(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  const root = parsed as Record<string, unknown>;

  const fromNested = (node: unknown): string | null => {
    if (!node || typeof node !== "object") return null;
    const o = node as Record<string, unknown>;
    const candidates = [o.token, o.accessToken, o.access_token, o.jwt, o.idToken];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim()) return c.trim();
    }
    return null;
  };

  const direct =
    fromNested(root) ??
    (root.data && typeof root.data === "object" ? fromNested(root.data) : null) ??
    (root.payload && typeof root.payload === "object" ? fromNested(root.payload) : null);

  if (direct) return direct;

  const payload = root.payload;
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.token === "string" && p.token.trim()) return p.token.trim();
  }
  return null;
}

/** True if HTTP 200 but API signals business failure (not authenticated). */
function isLogicalLoginFailure(parsed: unknown): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const o = parsed as Record<string, unknown>;
  if (o.success === false || o.ok === false || o.authenticated === false) return true;
  if (typeof o.statusCode === "number" && o.statusCode >= 400) return true;
  return false;
}

export type ExternalLoginResult =
  | { ok: true; token: string }
  | { ok: false; message: string; httpStatus: number; parsed: unknown; rawText: string };

/**
 * Single place for external login HTTP semantics (used by NextAuth authorize).
 */
export async function attemptExternalLogin(input: {
  identifier: string;
  password: string;
}): Promise<ExternalLoginResult> {
  const { identifier, password } = input;
  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildLoginRequestBody(identifier, password)),
    });

    const rawText = await res.text();
    const parsed = parseJsonSafe(rawText);

    if (!res.ok) {
      console.error("[external-auth-login] HTTP error", {
        url: LOGIN_URL,
        httpStatus: res.status,
        responseBodyRaw: rawText,
        responseBodyParsed: parsed,
      });
      return {
        ok: false,
        message: extractBackendMessage(parsed, rawText, res.status),
        httpStatus: res.status,
        parsed,
        rawText,
      };
    }

    if (isLogicalLoginFailure(parsed)) {
      console.error("[external-auth-login] HTTP 200 but logical failure", {
        url: LOGIN_URL,
        responseBodyParsed: parsed,
        responseBodyRaw: rawText,
      });
      return {
        ok: false,
        message: extractBackendMessage(parsed, rawText, res.status),
        httpStatus: res.status,
        parsed,
        rawText,
      };
    }

    const token = extractAccessTokenFromLoginResponse(parsed);
    if (!token) {
      console.error("[external-auth-login] missing token in success body", {
        url: LOGIN_URL,
        responseBodyParsed: parsed,
        responseBodyRaw: rawText,
      });
      return {
        ok: false,
        message:
          "Login response did not include a recognizable token. Check server logs for the response shape.",
        httpStatus: res.status,
        parsed,
        rawText,
      };
    }

    return { ok: true, token };
  } catch (err) {
    console.error("[external-auth-login] network failure", err);
    const msg =
      err instanceof TypeError && err.message === "Failed to fetch"
        ? "Could not reach the login API (network / CORS)."
        : err instanceof Error
          ? err.message
          : "Unexpected error";
    return { ok: false, message: msg, httpStatus: 0, parsed: null, rawText: "" };
  }
}
