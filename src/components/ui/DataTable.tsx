"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { Button } from "./button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

/**
 * Column definition for {@link DataTable}.
 *
 * `cell` is a render function so it can express any cell variant used in the
 * shop pages: nested fields, formatted dates, currency, truncation, null
 * fallbacks, and action buttons.
 */
export interface Column<T> {
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** className forwarded to the cell's <td> (e.g. "text-right", "max-w-xs truncate") */
  className?: string;
  /** className forwarded to the header's <th> */
  headerClassName?: string;
}

export interface DataTableProps<T extends { id: string }> {
  /** All rows (already pre-filtered by the caller for any page-level concerns). */
  rows: T[];
  columns: Column<T>[];

  /** Omit to render no search input. */
  search?: {
    placeholder?: string;
    /** Receives the raw (trimmed) non-empty term; lowercase/etc. is the caller's job. */
    predicate: (row: T, term: string) => boolean;
  };

  /** Show a spinner row instead of the body. */
  loading?: boolean;
  /** Shown when there is no data at all. Defaults to "No data found." */
  emptyMessage?: string;
  /** Shown when a search yields zero rows. Defaults to "No results found." */
  emptySearchMessage?: string;

  /** Omit to show all rows (current behavior). */
  pagination?: {
    pageSize: number;
  };
}

/**
 * Deep module consolidating the search + filter + table + states + pagination
 * pattern that was duplicated across 7 tables (customers, sales, repairs,
 * stock ×4). See `docs/c8-datatable-design.md`.
 *
 * Responsibilities (deep): search term state + empty short-circuit + filter +
 * table render + loading/empty states + pagination slice & controls.
 * Left to the caller: Card/title/"Add New" (page-level dialog state), column
 * defs, predicate, rows, and any pre-filter applied before search.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  search,
  loading = false,
  emptyMessage = "No data found.",
  emptySearchMessage = "No results found.",
  pagination,
}: DataTableProps<T>) {
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);

  const trimmed = term.trim();

  const predicate = search?.predicate;

  const filtered = useMemo(() => {
    // empty term short-circuit: show everything, never call predicate
    if (!trimmed) return rows;
    return predicate ? rows.filter((row) => predicate(row, trimmed)) : rows;
  }, [rows, trimmed, predicate]);

  // reset to first page whenever the search term changes
  useEffect(() => {
    setPage(1);
  }, [trimmed]);

  const pageSize = pagination?.pageSize;
  const totalPages = pageSize
    ? Math.max(1, Math.ceil(filtered.length / pageSize))
    : 1;
  // clamp: if rows shrank (e.g. refetch / pre-filter), don't point past the end
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const showPagination = !!pageSize && filtered.length > pageSize;

  const visible = showPagination
    ? filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filtered;

  const colSpan = columns.length;

  return (
    <div>
      {search && (
        <div className="mb-4">
          <SearchInput
            placeholder={search.placeholder}
            value={term}
            onChange={setTerm}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => (
                <TableHead key={i} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-center text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : visible.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-center text-muted-foreground"
                >
                  {trimmed ? emptySearchMessage : emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col, i) => (
                    <TableCell key={i} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-end space-x-2 py-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
