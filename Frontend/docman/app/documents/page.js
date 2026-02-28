import Link from "next/link";
import { fetchDocuments } from "./actions";

function normalizeDocuments(result) {
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
  return status === "Processed"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700";
}

export default async function DocumentsPage() {
  const result = await fetchDocuments();
  const error = result?.error;
  const documents = error ? [] : normalizeDocuments(result);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Repository
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Documents</h1>
          <p className="mt-2 text-slate-600">
            Review uploaded files and continue into search or upload.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/search"
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            Search
          </Link>
          <Link
            href="/upload"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Upload
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">No documents yet</h2>
          <p className="mt-2 text-slate-600">
            Upload your first PDF to start building the repository.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm text-slate-500">
                <th className="px-6 py-4 font-semibold">File</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Uploaded</th>
                <th className="px-6 py-4 font-semibold">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {documents.map((document) => (
                <tr key={document.documentId}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {document.originalFileName || "Untitled document"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(document.status)}`}
                    >
                      {document.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(document.uploadedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/documents/${document.documentId}`}
                      className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
