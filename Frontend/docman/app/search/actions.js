"use server";

import { buildApiUrl } from "@/lib/api";
import { requireAuthHeader } from "@/lib/auth";

function normalizeSearchResults(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  if (Array.isArray(result?.documents)) {
    return result.documents;
  }

  return [];
}

export async function searchDocumentsAction(query) {
  const trimmedQuery = query?.trim?.() ?? "";

  if (!trimmedQuery) {
    return { ok: true, data: [] };
  }

  try {
    const response = await fetch(buildApiUrl("/api/v1/documents", { q: trimmedQuery }), {
      headers: await requireAuthHeader(),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, error: "Search failed" };
    }

    const data = await response.json();

    return { ok: true, data: normalizeSearchResults(data) };
  } catch {
    return { ok: false, error: "Backend error" };
  }
}
