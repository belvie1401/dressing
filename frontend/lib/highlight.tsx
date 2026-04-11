import type { ReactNode } from 'react';

/**
 * Splits `text` on case-insensitive matches of `query` and wraps each match
 * in a <mark> element. Returns the original string when there's no query or
 * no match. Safe for arbitrary user input — escapes the query for the
 * underlying RegExp.
 */
export function highlight(text: string | null | undefined, query: string): ReactNode {
  if (!text) return text ?? '';
  const q = query.trim();
  if (!q) return text;

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-[#C6A47E]/20 px-0.5 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
