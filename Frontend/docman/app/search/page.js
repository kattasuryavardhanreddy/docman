"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { searchDocumentsAction } from "./actions";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    setQuery("");
    setActiveQuery("");
    setResults([]);
    setError("");
    setHasSearched(false);
  }

  function handleSearch(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a title or filename before searching.");
      setActiveQuery("");
      setResults([]);
      setHasSearched(false);
      return;
    }

    setError("");

    startTransition(async () => {
      setHasSearched(true);
      setActiveQuery(trimmedQuery);
      setResults([]);

      const result = await searchDocumentsAction(trimmedQuery);

      if (!result.ok) {
        setError(result.error || "Search failed");
        return;
      }

      setResults(Array.isArray(result.data) ? result.data : []);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Repository
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Search documents
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Search by title or original filename and jump directly into a
            document record.
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
            href="/upload"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Upload
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-900">Find a document</h2>
            <p className="mt-1 text-sm text-slate-500">
              The current search uses the existing server action and fetches fresh
              repository results on every query.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="search-query">
                Search query
              </label>
              <input
                id="search-query"
                name="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try an original filename or document title"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isPending ? "Searching..." : "Search"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={isPending}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                >
                  Clear
                </button>
              </div>
            </form>

            {error ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!hasSearched ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  Start with a specific query
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Search works best with part of a filename or the exact title
                  stored in the repository.
                </p>
              </div>
            ) : isPending ? (
              <div className="mt-6 animate-pulse space-y-3">
                <div className="h-16 rounded-xl bg-slate-100" />
                <div className="h-16 rounded-xl bg-slate-100" />
                <div className="h-16 rounded-xl bg-slate-100" />
              </div>
            ) : error ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  Search unavailable
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  The repository could not be searched for
                  {activeQuery ? ` "${activeQuery}"` : " that query"}. Try again.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  No matching documents
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  No repository records matched
                  {activeQuery ? ` "${activeQuery}"` : " that query"}.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
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
                      {results.map((document) => (
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
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Search summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              Quick feedback from the latest repository query.
            </p>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Latest query
                </p>
                <p className="mt-2 break-words text-base font-semibold text-slate-900">
                  {activeQuery || "None yet"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Matches
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {results.length}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasSearched
                    ? "Documents returned by the current search."
                    : "Run a search to populate this panel."}
                </p>
              </div>
            </div>
          </aside>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Search tips</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Use filename fragments</p>
                <p className="mt-1">
                  Partial file names usually work better than long free-text phrases.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Open records directly</p>
                <p className="mt-1">
                  Each result links into the full document detail page for review and download.
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Need everything?</p>
                <p className="mt-1">
                  Use the repository page when you want the full document list instead of a filtered search.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
