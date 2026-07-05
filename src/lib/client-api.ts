export const CLIENT_API_BASE = "/api/backend";

export function clientApiUrl(
  path: string,
  searchParams?: URLSearchParams | string
): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  const base = `${CLIENT_API_BASE}/${normalized}`;

  if (!searchParams) return base;
  const query =
    typeof searchParams === "string" ? searchParams : searchParams.toString();

  return query ? `${base}?${query}` : base;
}
