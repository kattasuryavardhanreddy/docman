"use server";
import { buildApiUrl } from "@/lib/api";
import { requireAuthHeader } from "@/lib/auth";

export async function fetchDocumentDetails(documentId) {
  try {
    const response = await fetch(buildApiUrl(`/api/v1/documents/${documentId}`), {
      headers: await requireAuthHeader(),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to load document details");
    }

    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function deleteDocument(documentId) {
  try {
    const response = await fetch(buildApiUrl(`/api/v1/documents/${documentId}`), {
      method: "DELETE",
      headers: await requireAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to delete document");
    }

    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}
