import { headers } from "next/headers";

// Public base URL for links in emails and share links. Set NEXT_PUBLIC_APP_URL
// in production (e.g. https://assessments.engrity.com); otherwise derived from
// the request host.
export async function getBaseUrl(): Promise<string> {
  const fixed = process.env.NEXT_PUBLIC_APP_URL;
  if (fixed) return fixed.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${protocol}://${host}`;
}
