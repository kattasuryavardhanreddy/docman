"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { uploadAction } from "./actions";

function formatFileSize(sizeInBytes) {
  if (!Number.isFinite(sizeInBytes) || sizeInBytes <= 0) {
    return "Unknown size";
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadPage() {
  const formRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resultData, setResultData] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError("");
    setSuccessMessage("");
    setResultData(null);
  }

  async function handleUpload(e) {
    e.preventDefault();

    if (!selectedFile) {
      setError("Choose a PDF file before starting the upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setResultData(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await uploadAction(formData);

      if (!result.ok) {
        setError(result.error || "Upload failed");
        return;
      }

      setSuccessMessage("Upload accepted. The document is now available in your repository.");
      setResultData({
        ...result.data,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });
      setSelectedFile(null);
      formRef.current?.reset();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Repository
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Upload PDF</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Add a new document to the repository and send it into the processing pipeline.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/documents"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            Documents
          </Link>
          <Link
            href="/search"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Search
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">Choose a PDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select one file from your device and submit it for processing.
            </p>
          </div>

          <form ref={formRef} onSubmit={handleUpload} className="p-6">
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              required
              className="sr-only"
              onChange={handleFileChange}
            />

            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center transition-colors hover:border-slate-400 hover:bg-slate-100"
            >
              <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Browse Files
              </span>
              <span className="mt-5 text-lg font-semibold text-slate-900">
                {selectedFile ? selectedFile.name : "Select a PDF document"}
              </span>
              <span className="mt-2 text-sm text-slate-500">
                {selectedFile
                  ? `${formatFileSize(selectedFile.size)} ready to upload`
                  : "PDF only. The file will be sent directly to the document API."}
              </span>
            </label>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedFile
                      ? `${formatFileSize(selectedFile.size)} - PDF document`
                      : "Pick a file to enable the upload button."}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedFile
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {selectedFile ? "Ready" : "Waiting"}
                </span>
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Uploading..." : "Start Upload"}
              </button>

              <Link
                href="/documents"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
              >
                Back to Documents
              </Link>
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Upload flow</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">1. Pick a file</p>
                <p className="mt-1">Choose a PDF from your device.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">2. Submit to the API</p>
                <p className="mt-1">The file is posted directly to the backend using your auth token.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">3. Review processing</p>
                <p className="mt-1">Open the created document record to inspect status and metadata.</p>
              </div>
            </div>
          </aside>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Current result</h2>

            {resultData ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    File
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{resultData.fileName}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatFileSize(resultData.fileSize)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {resultData.status || "Pending"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Document ID
                  </p>
                  <code className="mt-1 block break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
                    {resultData.documentId}
                  </code>
                </div>

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/documents/${resultData.documentId}`}
                    className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Open Document
                  </Link>
                  <Link
                    href="/documents"
                    className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                  >
                    View Repository
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                After a successful upload, the new document record will appear here.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
