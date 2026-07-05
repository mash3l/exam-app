import { API_BASE_URL } from "@/lib/api-base";
import { getServerAccessToken } from "@/lib/server-auth";

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export async function serverFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getServerAccessToken();
  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(resolveUrl(path), {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });
}
