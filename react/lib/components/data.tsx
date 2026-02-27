import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react"
import { cn } from "../utilities/cn"

/* ------------------------------------------------------------------ */
/*  Table                                                              */
/* ------------------------------------------------------------------ */

export const Table = forwardRef<
  HTMLTableElement,
  TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="l-ui-container--table">
    <table ref={ref} className={cn("l-ui-table", className)} {...props} />
  </div>
))
Table.displayName = "Table"

/* ------------------------------------------------------------------ */
/*  TableHeader                                                        */
/* ------------------------------------------------------------------ */

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("l-ui-table__header", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

/* ------------------------------------------------------------------ */
/*  TableBody                                                          */
/* ------------------------------------------------------------------ */

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("l-ui-table__body", className)} {...props} />
))
TableBody.displayName = "TableBody"

/* ------------------------------------------------------------------ */
/*  TableRow                                                           */
/* ------------------------------------------------------------------ */

export const TableRow = forwardRef<
  HTMLTableRowElement,
  HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={className} {...props} />
))
TableRow.displayName = "TableRow"

/* ------------------------------------------------------------------ */
/*  TableHeaderCell                                                    */
/* ------------------------------------------------------------------ */

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  action?: boolean
}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  ({ action, className, ...props }, ref) => (
    <th
      ref={ref}
      scope="col"
      className={cn(
        action ? "l-ui-table__header-cell--action" : "l-ui-table__header-cell",
        className,
      )}
      {...props}
    />
  ),
)
TableHeaderCell.displayName = "TableHeaderCell"

/* ------------------------------------------------------------------ */
/*  TableCell                                                          */
/* ------------------------------------------------------------------ */

export type TableCellVariant = "default" | "primary" | "action"

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  variant?: TableCellVariant
  /** When variant is "primary", renders as <th scope="row"> instead of <td>. */
  asRowHeader?: boolean
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ variant = "default", asRowHeader, className, ...props }, ref) => {
    const cellClass =
      variant === "primary"
        ? "l-ui-table__cell--primary"
        : variant === "action"
          ? "l-ui-table__cell--action"
          : "l-ui-table__cell"

    if (asRowHeader || variant === "primary") {
      return (
        <th
          ref={ref}
          scope="row"
          className={cn(cellClass, className)}
          {...props}
        />
      )
    }

    return (
      <td ref={ref} className={cn(cellClass, className)} {...props} />
    )
  },
)
TableCell.displayName = "TableCell"

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageRange(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className={cn("l-ui-pagination", className)}>
      <button
        className={cn(
          "l-ui-pagination__item",
          currentPage === 1 && "l-ui-pagination__item--disabled",
        )}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &lsaquo;
      </button>

      {pages.map((page, i) =>
        page === "gap" ? (
          <span key={`gap-${i}`} className="l-ui-pagination__gap">
            &hellip;
          </span>
        ) : (
          <button
            key={page}
            className={cn(
              "l-ui-pagination__item",
              page === currentPage && "l-ui-pagination__item--active",
            )}
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </button>
        ),
      )}

      <button
        className={cn(
          "l-ui-pagination__item",
          currentPage === totalPages && "l-ui-pagination__item--disabled",
        )}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        &rsaquo;
      </button>
    </nav>
  )
}

function buildPageRange(
  current: number,
  total: number,
): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "gap")[] = [1]

  if (current > 3) pages.push("gap")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("gap")

  pages.push(total)
  return pages
}
