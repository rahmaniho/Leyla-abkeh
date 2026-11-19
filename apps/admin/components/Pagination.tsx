"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** صفحه‌بندی عددی جمع‌وجور (RTL: «بعدی» سمت چپ) */
export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <div className="pagination" role="navigation" aria-label="صفحه‌بندی جدول">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="صفحهٔ قبل">
        <ChevronRight size={14} strokeWidth={2} />
      </button>
      {pages.map((value) => (
        <button
          key={value}
          type="button"
          className={value === page ? "active" : ""}
          aria-current={value === page ? "page" : undefined}
          onClick={() => onChange(value)}
        >
          {value.toLocaleString("fa-IR")}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="صفحهٔ بعد">
        <ChevronLeft size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
