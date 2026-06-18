import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { getDocument, updateDocument, shareDocument, deleteDocument } from '../api/api';
import Navbar from '../components/Navbar';
import EditorToolbar from '../components/EditorToolbar'; // adjust path to match where you place this file

/* Toolbar now lives in EditorToolbar.jsx — removed the duplicate copy that used to be here */

/* ─── Share modal ─────────────────────────────────────────────── */
function ShareModal({ docId, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [sharing, setSharing] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleShare(e) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setSharing(true);
      setStatus(null);
      await shareDocument(docId, email.trim());
      setStatus({ type: 'success', message: `Shared with ${email.trim()}` });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4 animate-[fadeIn_0.15s_ease-out]">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 p-7 relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <svg className="h-4.5 w-4.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Share document</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6 pl-12">Enter an email address to grant access.</p>

        <form onSubmit={handleShare} className="flex gap-2">
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={sharing || !email.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {sharing ? 'Sharing…' : 'Share'}
          </button>
        </form>

        {status && (
          <p className={`mt-3.5 text-sm flex items-center gap-1.5 ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {status.type === 'success' ? (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Editor page ─────────────────────────────────────────────── */
export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error'
  const [showShare, setShowShare] = useState(false);
  const titleInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }), // avoid clashing with the explicit Underline below if your StarterKit version already bundles it
      Underline,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[60vh] py-10 ' +
          'prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900 ' +
          'prose-h1:text-3xl prose-h1:mb-4 prose-h2:text-2xl prose-h2:mb-3 prose-h3:text-xl prose-h3:mb-2 ' +
          'prose-p:text-[15px] prose-p:leading-7 prose-p:text-slate-700 prose-p:my-3 ' +
          'prose-strong:text-slate-900 prose-strong:font-semibold ' +
          'prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline ' +
          'prose-blockquote:border-l-4 prose-blockquote:border-indigo-200 prose-blockquote:text-slate-500 prose-blockquote:font-normal prose-blockquote:not-italic ' +
          'prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none ' +
          'prose-pre:bg-slate-900 prose-pre:rounded-xl ' +
          'prose-hr:border-slate-200 prose-img:rounded-xl prose-img:shadow-sm ' +
          '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:my-1.5 [&_li]:text-[15px] [&_li]:leading-7 [&_li]:text-slate-700',
      },
    },
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const doc = await getDocument(id);
        setTitle(doc.title || 'Untitled Document');
        if (editor && doc.content) {
          editor.commands.setContent(doc.content);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (editor) load();
  }, [id, editor]);

  async function handleDelete() {
  const confirmed = window.confirm(
    'Are you sure you want to delete this document?'
  );

  if (!confirmed) return;

  try {
    await deleteDocument(id);
    navigate('/dashboard');
  } catch (err) {
    alert(err.message || 'Failed to delete document');
  }
}
const handleSave = useCallback(async () => {
  if (!editor) return;

  try {
    setSaving(true);
    setSaveStatus(null);

    await updateDocument(id, {
      title,
      content: editor.getHTML(),
    });

    setSaveStatus('saved');

    setTimeout(() => {
      setSaveStatus(null);
    }, 2000);
  } catch (err) {
    console.error(err);
    setSaveStatus('error');
  } finally {
    setSaving(false);
  }
}, [editor, id, title]);

  // Ctrl/Cmd+S to save
  useEffect(() => {
    function onKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  function startEditingTitle() {
    setDraftTitle(title);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  }

  function commitTitle() {
    const trimmed = draftTitle.trim();
    if (trimmed) setTitle(trimmed);
    setEditingTitle(false);
  }

  function onTitleKeyDown(e) {
    if (e.key === 'Enter') commitTitle();
    if (e.key === 'Escape') setEditingTitle(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <svg className="animate-spin h-7 w-7 text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => navigate('/')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">← Back to documents</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Sticky sub-header: breadcrumb + actions */}
      <div className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 shrink-0 font-medium"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Documents
          </button>

          <div className="flex items-center gap-3">
            {/* Save status */}
            <div className="hidden sm:flex items-center min-w-[72px] justify-end">
              {saveStatus === 'saved' && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium animate-[fadeIn_0.15s_ease-out]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-500 font-medium">Save failed</span>
              )}
            </div>

            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              Share
            </button>
            <button
  onClick={handleDelete}
  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-300 bg-white text-xs font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm"
>
  Delete
</button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 shadow-sm"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Editor chrome */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 gap-5">

        {/* Title */}
        <div className="group">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={onTitleKeyDown}
              className="w-full text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight bg-transparent border-b-2 border-indigo-400 focus:outline-none pb-1.5"
            />
          ) : (
            <button
              onClick={startEditingTitle}
              title="Click to rename"
              className="flex items-center gap-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight hover:text-indigo-700 transition-colors text-left -ml-1 px-1 rounded-md hover:bg-slate-100/70"
            >
              {title}
              <svg className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          )}
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-500">⌘S</kbd>
            to save
          </p>
        </div>

        {/* Editor card */}
        <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ring-1 ring-slate-900/[0.02]">
          <div className="sticky top-[57px] z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
            <EditorToolbar editor={editor} />
          </div>
          <div className="flex-1 px-6 sm:px-12 pt-6 overflow-y-auto">
  <EditorContent editor={editor} />
</div>
        </div>
      </div>

      {showShare && <ShareModal docId={id} onClose={() => setShowShare(false)} />}
    </div>
  );
}