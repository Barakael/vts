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
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page === 1}
        className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`min-w-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition ${
                current_page === page
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-indigo-200 bg-white text-gray-700 hover:bg-indigo-50'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === last_page}
        className="rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
