"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { buildApiProxyPath } from "@/lib/api";
import { deleteDocument, fetchDocumentDetails } from "./actions";

function formatFileSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "Unknown size";
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}

function getStatusClasses(status) {
  if (status === "Processed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Failed") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getStatusCopy(status) {
  if (status === "Processed") {
    return "Hash and metadata are available.";
  }

  if (status === "Failed") {
    return "Processing stopped before completion.";
  }

  return "Processing is still running in the background.";
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="animate-pulse">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-4 h-10 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-2 h-5 w-[32rem] max-w-full rounded bg-slate-100" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-6 space-y-4">
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-32 rounded bg-slate-200" />
              <div className="mt-6 h-28 rounded-xl bg-slate-100" />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="h-6 w-36 rounded bg-slate-200" />
              <div className="mt-6 h-36 rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.documentId;
  const downloadUrl = buildApiProxyPath(`/api/v1/documents/${id}/download`);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const result = await fetchDocumentDetails(id);

      if (cancelled) {
        return;
      }

      if (result.error) {
        setError(result.error);
        setDoc(null);
      } else {
        setDoc(result);
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this document?")) {
      return;
    }

    setDeleting(true);
    setError("");

    const result = await deleteDocument(id);

    if (result.success) {
      router.replace("/documents");
      return;
    }

    setError(result.error || "Failed to delete document");
    setDeleting(false);
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Repository
          </p>
          <h1 className="mt-2 break-all text-3xl font-bold text-slate-900">
            {doc?.originalFileName || "Document details"}
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Inspect the stored metadata, current processing status, and available actions for this file.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/documents"
            className="rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            Back to Documents
          </Link>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700"
          >
            Download Original
          </a>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!doc ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Document not available</h2>
          <p className="mt-2 text-slate-600">
            The record could not be loaded. Return to the repository and try again.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">Document overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Metadata captured when the file entered the repository.
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Document ID
                </p>
                <code className="mt-3 block break-all rounded-lg bg-white p-3 text-sm text-slate-700">
                  {doc.documentId}
                </code>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Created At
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {formatDate(doc.uploadedAt)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  File Size
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900">
                  {formatFileSize(doc.sizeBytes)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Current Status
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(doc.status)}`}
                >
                  {doc.status || "Pending"}
                </span>
                <p className="mt-3 text-sm text-slate-500">
                  {getStatusCopy(doc.status)}
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Integrity</h2>
              <p className="mt-1 text-sm text-slate-500">
                Stored hash information for this document.
              </p>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  SHA-256
                </p>
                <code className="mt-3 block break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
                  {doc.sha256 || "Waiting for worker processing..."}
                </code>
              </div>
            </aside>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Actions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage the repository record for this file.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Download Original
                </a>
                <Link
                  href="/documents"
                  className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                >
                  Back to Repository
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {deleting ? "Deleting..." : "Delete File"}
                </button>
              </div>
            </aside>

            {doc.failureReason ? (
              <aside className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-red-700">Failure Reason</h2>
                <p className="mt-3 text-sm text-red-700">{doc.failureReason}</p>
              </aside>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
