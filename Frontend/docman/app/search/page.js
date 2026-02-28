"use client";

import { useState } from "react";
import Link from "next/link";
import { searchDocumentsAction } from "./actions";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const res = await searchDocumentsAction(query);
    if (res.ok) setResults(res.data);
    setLoading(false);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Search Documents</h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by title or filename..." style={{ flex: 1, padding: '0.5rem' }} />
        <button type="submit" style={{ padding: '0.5rem 1.5rem' }}>Search</button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        {loading ? <p>Searching...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th>Filename</th>
                  <th>Status</th>
                  <th>Link</th>
                </tr>
             </thead>
             <tbody>
                {results.map(doc => (
                  <tr key={doc.documentId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem 0' }}>{doc.originalFileName}</td>
                    <td>{doc.status}</td>
                    <td><Link href={`/documents/${doc.documentId}`} style={{ color: '#2563eb' }}>View</Link></td>
                  </tr>
                ))}
             </tbody>
          </table>
        )}
      </div>
    </div>
  );
}