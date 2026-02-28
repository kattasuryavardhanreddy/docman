"use server";
import { buildApiUrl } from "@/lib/api";
import { requireAuthHeader } from "@/lib/auth";

export async function fetchDocuments() {
  try {
    const response = await fetch(buildApiUrl("/api/v1/documents"), {
      headers: await requireAuthHeader(),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to load documents");
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function uploadDocument(formData) {
  try {
    const response = await fetch(buildApiUrl("/api/v1/documents"), {
      method: "POST",
      headers: await requireAuthHeader(),
      body: formData,
    });
    if (!response.ok) throw new Error("Upload failed");
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}
