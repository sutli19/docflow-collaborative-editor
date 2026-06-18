function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
    }
    return diffHrs === 1 ? '1h ago' : `${diffHrs}h ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function DocumentCard({ document, onOpen }) {
  const { title, updatedAt, owner, isShared } = document;

  return (
    <button
      onClick={onOpen}
      className="
        group relative flex flex-col text-left w-full
        rounded-xl border border-slate-200/80 bg-white
        p-5 shadow-sm
        hover:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.14),0_1px_6px_-1px_rgba(0,0,0,0.06)]
        hover:border-indigo-200
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
        overflow-hidden
      "
    >
      {/* Subtle hover gradient wash — the signature micro-interaction */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl bg-gradient-to-br from-indigo-50/60 via-transparent to-violet-50/40" />

      {/* Shared badge */}
      {isShared && (
        <span className="absolute top-3.5 right-3.5 z-10 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-500 border border-violet-100 select-none">
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Shared
        </span>
      )}

      {/* Doc icon */}
      <div className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-200">
        <svg className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200" style={{ height: '18px', width: '18px' }} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>

      {/* Title */}
      <p className="relative z-10 text-[13.5px] font-semibold text-slate-800 leading-snug line-clamp-2 mb-auto group-hover:text-indigo-700 transition-colors duration-200 pr-8">
        {title || 'Untitled Document'}
      </p>

      {/* Divider */}
      <div className="relative z-10 my-3 h-px bg-slate-100 group-hover:bg-indigo-100/80 transition-colors duration-200" />

      {/* Meta */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <p className="text-[11px] text-slate-400 tabular-nums">
          {formatDate(updatedAt)}
        </p>
        {isShared && owner && (
          <p className="text-[11px] text-slate-400 truncate max-w-[120px] text-right">
            <span className="font-medium text-slate-500">{owner.name || owner.email}</span>
          </p>
        )}
      </div>
    </button>
  );
}