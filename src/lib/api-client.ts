/**
 * Authenticated fetch wrapper for internal API calls.
 * Automatically attaches the Authorization header using NEXT_PUBLIC_SITE_PASSWORD.
 */
export function apiFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const password = process.env.NEXT_PUBLIC_SITE_PASSWORD || "";
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${password}`);

  return fetch(input, { ...init, headers });
}
