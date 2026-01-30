import type { PaginationMeta } from '../../api/telemetry';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { current_page, last_page } = meta;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2;

    for (let i = 1; i <= last_page; i++) {
      if (i === 1 || i === last_page || (i >= current_page - delta && i <= current_page + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    return pages;
  };

  if (last_page <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
      <button
        type="button"
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page === 1}
        aria-label="Previous page"
        className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2 font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-white disabled:cursor-not-allowed disabled:border-slate-900 disabled:text-slate-600"
      >
        Previous
      </button>

      <div className="flex flex-wrap gap-1">
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-slate-600">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page as number)}
              className={`min-w-[42px] rounded-2xl border px-3 py-2 font-semibold transition ${
                current_page === page
                  ? 'border-emerald-500 bg-emerald-500 text-slate-950 shadow-[0_8px_30px_rgba(16,185,129,0.45)]'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-emerald-500/40 hover:text-white'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === last_page}
        aria-label="Next page"
        className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-2 font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-white disabled:cursor-not-allowed disabled:border-slate-900 disabled:text-slate-600"
      >
        Next
      </button>
    </div>
  );
}
