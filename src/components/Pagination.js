// src/components/Pagination.jsx
import React, { useMemo } from "react";

/**
 * Reusable Pagination component (accessible + ellipsis)
 * Props:
 * - totalItems: number (required)
 * - pageSize: number (required)
 * - currentPage: number (1-based) (required)
 * - onPageChange: (page:number) => void (required)
 * - showPageSizeSelect?: boolean (default false)
 * - pageSizeOptions?: number[] (default [10, 20, 50, 100])
 * - onPageSizeChange?: (size:number) => void
 * - className?: string
 */
export default function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  showPageSizeSelect = false,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== currentPage) onPageChange(next);
  };

  const pages = useMemo(() => {
    const range = (s, e) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
    if (totalPages <= 7) return range(1, totalPages);
    const c = currentPage;
    if (c <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (c >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", c - 1, c, c + 1, "…", totalPages];
  }, [currentPage, totalPages]);

  const baseBtn =
    "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-xl border text-sm select-none focus:outline-none focus:ring-2 focus:ring-offset-1 transition";
  const active =
    "bg-gradient-to-r from-[#0096c7] via-[#8e44ad] to-[#b11226] text-white border-transparent shadow";
  const inactive =
    "bg-white/70 border-gray-300 hover:border-transparent hover:shadow focus:ring-[#0096c7]";

  return (
    <div className={`flex items-center justify-between gap-3 flex-wrap ${className}`}>
      {showPageSizeSelect && onPageSizeChange && (
        <label className="text-sm text-gray-700">
          Items per page:&nbsp;
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
            className="border rounded-md px-2 py-1"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
      )}

      <nav role="navigation" aria-label="Pagination" className="flex items-center gap-2 flex-wrap">
        <button className={`${baseBtn} ${inactive}`} onClick={() => go(1)} disabled={currentPage === 1} aria-label="First page">«</button>
        <button className={`${baseBtn} ${inactive}`} onClick={() => go(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page">‹</button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`dots-${i}`} className="px-2 text-gray-500 select-none">…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${baseBtn} ${p === currentPage ? active : inactive}`}
              aria-current={p === currentPage ? "page" : undefined}
              onClick={() => go(p)}
            >
              {p}
            </button>
          )
        )}

        <button className={`${baseBtn} ${inactive}`} onClick={() => go(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page">›</button>
        <button className={`${baseBtn} ${inactive}`} onClick={() => go(Infinity)} disabled={currentPage === totalPages} aria-label="Last page">»</button>

        <span className="ml-1 text-sm text-gray-600">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </nav>
    </div>
  );
}
