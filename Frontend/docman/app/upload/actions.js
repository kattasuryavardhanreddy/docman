"use server";

import { buildApiUrl } from "@/lib/api";
import { requireAuthHeader } from "@/lib/auth";

export async function uploadAction(formData) {
  try {
    const response = await fetch(buildApiUrl("/api/v1/documents"), {
      method: "POST",
      headers: await requireAuthHeader(),
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json();
      return { ok: false, error: errData.error?.message || "Upload failed" };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: "Network error during upload" };
  }
}
