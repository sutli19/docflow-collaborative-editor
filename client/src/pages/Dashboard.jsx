import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, createDocument, uploadDocument } from '../api/api';
import DocumentCard from '../components/DocumentCard';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      setCreating(true);
      const doc = await createDocument({ title: 'Untitled Document', content: '' });
      navigate(`/editor/${doc._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const doc = await uploadDocument(file);
      navigate(`/editor/${doc._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const myDocs = documents.filter(doc => !doc.isShared);
  const sharedDocs = documents.filter(doc => doc.isShared);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Page header */}
        <div className="flex items-start justify-between mb-10 gap-4">
          <div>
            <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight leading-none">Documents</h1>
            <p className="text-[13px] text-slate-400 mt-1.5 font-normal">Your workspace</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx"
              className="hidden"
              onChange={handleUpload}
            />

            {/* Import button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                border border-slate-200 bg-white
                text-[13px] font-medium text-slate-600
                hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800
                shadow-sm hover:shadow
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              "
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Importing…</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
                  </svg>
                  <span>Import</span>
                </>
              )}
            </button>

            {/* New Document button */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
                text-[13px] font-medium text-white
                shadow-sm hover:shadow-md hover:shadow-indigo-200
                transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed
                focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
              "
            >
              {creating ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600 font-medium">
            <svg className="h-4 w-4 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-[13px] text-slate-400">Loading your documents…</span>
          </div>
        ) : (
          <div className="space-y-10">

            {/* My Documents */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  My Documents
                </h2>
                {myDocs.length > 0 && (
                  <span className="text-[11px] font-semibold tabular-nums text-slate-300">
                    {myDocs.length}
                  </span>
                )}
              </div>

              {myDocs.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  }
                  title="No documents yet"
                  description="Create a new document or import a .txt or .md file to get started."
                  tall
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {myDocs.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      onOpen={() => navigate(`/editor/${doc._id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Shared with Me */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Shared with Me
                </h2>
                {sharedDocs.length > 0 && (
                  <span className="text-[11px] font-semibold tabular-nums text-slate-300">
                    {sharedDocs.length}
                  </span>
                )}
              </div>

              {sharedDocs.length === 0 ? (
                <EmptyState
                  icon={
                    <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  }
                  title="Nothing shared yet"
                  description="Documents that teammates share with you will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {sharedDocs.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      onOpen={() => navigate(`/editor/${doc._id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

// Extracted empty state to avoid repetition
function EmptyState({ icon, title, description, tall }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center bg-white/50 ${tall ? 'py-16' : 'py-12'}`}>
      <div className="mb-3 opacity-70">{icon}</div>
      <p className="text-[13px] font-medium text-slate-500">{title}</p>
      <p className="text-[12px] text-slate-400 mt-1 max-w-[220px] leading-relaxed">{description}</p>
    </div>
  );
}