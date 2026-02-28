"use server";

import { buildApiUrl } from "@/lib/api";
import { requireAuthHeader } from "@/lib/auth";

export async function searchDocumentsAction(query) {
  try {
    const response = await fetch(buildApiUrl("/api/v1/documents", { q: query }), {
      headers: await requireAuthHeader(),
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, error: "Search failed" };
    const data = await response.json();
    return { ok: true, data: data.items };
  } catch (e) {
    return { ok: false, error: "Backend error" };
  }
}
