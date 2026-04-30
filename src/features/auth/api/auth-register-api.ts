import { API_BASE_URL } from "@/lib/api-base";

/**
 * Do not use `credentials: "include"` here: many APIs respond with
 * `Access-Control-Allow-Origin: *`, which browsers reject when credentials are
 * sent. Email verification is keyed by email on the server, not cookies.
 */

/** Some backends expect `otp` instead of `code` in the confirm body. */
function confirmOtpPayload(email: string, code: string): Record<string, string> {
  const key = process.env.NEXT_PUBLIC_AUTH_CONFIRM_OTP_KEY?.trim() || "code";
  return { email, [key]: code };
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const payload = o.payload as Record<string, unknown> | undefined;
    const m =
      (typeof o.message === "string" && o.message) ||
      (typeof o.error === "string" && o.error) ||
      (payload && typeof payload.message === "string" && payload.message);
    if (m && String(m).trim()) return String(m).trim();
  }
  return fallback;
}

/** Normalize backend validation shapes for logging + UI. */
export function extractRegisterValidationDetails(data: unknown): {
  summaryMessage: string;
  fieldFailures: Record<string, string[]>;
} {
  const fieldFailures: Record<string, string[]> = {};
  let summaryMessage = "";

  const ingestErrorsObject = (obj: Record<string, unknown>) => {
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        fieldFailures[key] = val.map((v) => String(v));
      } else if (typeof val === "string" && val.trim()) {
        fieldFailures[key] = [val];
      } else if (val && typeof val === "object") {
        const v = val as Record<string, unknown>;
        if (typeof v.message === "string") fieldFailures[key] = [v.message];
      }
    }
  };

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;

    const msg = o.message;
    if (typeof msg === "string" && msg.trim()) {
      summaryMessage = msg.trim();
    } else if (Array.isArray(msg) && msg.length) {
      summaryMessage = msg.map(String).join("; ");
    }

    const nested =
      o.errors ??
      o.validationErrors ??
      o.fieldErrors ??
      (typeof o.data === "object" && o.data !== null ? (o.data as Record<string, unknown>).errors : undefined);
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      ingestErrorsObject(nested as Record<string, unknown>);
    }

    const payload = o.payload;
    if (payload && typeof payload === "object") {
      visit(payload);
    }
  };

  visit(data);

  let composed = summaryMessage;
  const fieldKeys = Object.keys(fieldFailures);
  if (fieldKeys.length > 0) {
    const lines = fieldKeys.map((k) => `${k}: ${fieldFailures[k].join(", ")}`);
    composed = [composed, ...lines].filter(Boolean).join(" — ");
  }
  if (!composed) composed = "Validation failed";

  return { summaryMessage: composed, fieldFailures };
}

function networkFailureMessage(err: unknown): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Could not reach the server. Check your connection. If this persists, the API may be blocking the browser (CORS).";
  }
  if (err instanceof Error && err.message) return err.message;
  return "Request failed";
}

export async function sendEmailVerification(email: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/send-email-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, message: errorMessage(data, `Could not send code (${res.status})`) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, message: networkFailureMessage(err) };
  }
}

export async function confirmEmailVerification(input: {
  email: string;
  code: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/confirm-email-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmOtpPayload(input.email, input.code.trim())),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, message: errorMessage(data, `Invalid or expired code (${res.status})`) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, message: networkFailureMessage(err) };
  }
}

export type RegisterApiBody = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type RegisterAccountResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      data: unknown;
      message: string;
      fieldFailures: Record<string, string[]>;
    };

export async function registerAccount(body: RegisterApiBody): Promise<RegisterAccountResult> {
  const payload = {
    username: body.username,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword,
    firstName: body.firstName,
    lastName: body.lastName,
    phone: body.phone.trim(),
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const { summaryMessage, fieldFailures } = extractRegisterValidationDetails(data);
      const fallback = errorMessage(data, summaryMessage || `Registration failed (${res.status})`);
      const message =
        Object.keys(fieldFailures).length > 0 ? summaryMessage : fallback || summaryMessage;
      return {
        ok: false,
        status: res.status,
        data,
        message,
        fieldFailures,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: networkFailureMessage(err),
      fieldFailures: {},
    };
  }
}
