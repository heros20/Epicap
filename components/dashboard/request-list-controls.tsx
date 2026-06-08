import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import type { DashboardListSort } from "@/lib/auth/dashboard"
import { cn } from "@/lib/utils"

interface RequestListControlsProps {
  basePath: string
  itemLabel: string
  totalCount: number
  page: number
  pageCount: number
  sort: DashboardListSort
  year?: number
  years: number[]
  status?: string
  statusQueryValue?: string
  statusCounts?: Array<{ status: string; count: number }>
  statusLabels?: Record<string, string>
}

function buildHref(
  basePath: string,
  values: { page?: number; sort?: DashboardListSort; year?: number; status?: string },
) {
  const params = new URLSearchParams()

  if (values.sort && values.sort !== "recent") {
    params.set("sort", values.sort)
  }

  if (values.year) {
    params.set("year", String(values.year))
  }

  if (values.page && values.page > 1) {
    params.set("page", String(values.page))
  }

  if (values.status) {
    params.set("status", values.status)
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

function getVisiblePages(page: number, pageCount: number) {
  const start = Math.max(1, page - 2)
  const end = Math.min(pageCount, page + 2)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

function pluralizeLabel(label: string, count: number) {
  if (count <= 1 || label.endsWith("s")) {
    return label
  }

  return `${label}s`
}

export function RequestListControls({
  basePath,
  itemLabel,
  totalCount,
  page,
  pageCount,
  sort,
  year,
  years,
  status,
  statusQueryValue,
  statusCounts = [],
  statusLabels = {},
}: RequestListControlsProps) {
  const visiblePages = getVisiblePages(page, pageCount)
  const persistedStatus = statusQueryValue ?? status
  const previousHref = buildHref(basePath, {
    page: Math.max(1, page - 1),
    sort,
    year,
    status: persistedStatus,
  })
  const nextHref = buildHref(basePath, {
    page: Math.min(pageCount, page + 1),
    sort,
    year,
    status: persistedStatus,
  })
  const resultLabel = pluralizeLabel(itemLabel, totalCount)
  const statusOrder = Object.keys(statusLabels)
  const visibleStatusCounts = statusCounts
    .filter((item) => item.count > 0)
    .sort((first, second) => {
      const firstIndex = statusOrder.indexOf(first.status)
      const secondIndex = statusOrder.indexOf(second.status)

      if (firstIndex === -1 && secondIndex === -1) {
        return first.status.localeCompare(second.status)
      }

      if (firstIndex === -1) return 1
      if (secondIndex === -1) return -1
      return firstIndex - secondIndex
    })
  const allStatusCount = visibleStatusCounts.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-4 rounded-[1.15rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.92))] p-4 shadow-[0_18px_48px_-42px_rgba(23,19,18,0.38)]">
      {visibleStatusCounts.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            variant={status ? "outline" : "default"}
            size="sm"
            className="rounded-full"
          >
            <Link href={buildHref(basePath, { sort, year, status: "all" })}>
              Tous
              <span className="rounded-full bg-background/50 px-2 py-0.5 text-xs">
                {allStatusCount}
              </span>
            </Link>
          </Button>
          {visibleStatusCounts.map((item) => (
            <Button
              key={item.status}
              asChild
              variant={status === item.status ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              <Link href={buildHref(basePath, { sort, year, status: item.status })}>
                {statusLabels[item.status] ?? item.status}
                <span className="rounded-full bg-background/50 px-2 py-0.5 text-xs">
                  {item.count}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      ) : null}

      <form
        action={basePath}
        className="grid gap-3 lg:grid-cols-[minmax(180px,0.8fr)_minmax(160px,0.55fr)_auto] lg:items-end"
      >
        {persistedStatus ? <input type="hidden" name="status" value={persistedStatus} /> : null}
        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Ordre
          <select
            name="sort"
            defaultValue={sort}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm font-medium normal-case tracking-normal text-foreground"
          >
            <option value="recent">Plus récents en premier</option>
            <option value="oldest">Plus anciens en premier</option>
          </select>
        </label>

        <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Année
          <select
            name="year"
            defaultValue={year ? String(year) : ""}
            className="border-input bg-background h-10 rounded-md border px-3 text-sm font-medium normal-case tracking-normal text-foreground"
          >
            <option value="">Toutes les années</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button type="submit" className="h-10">
            Appliquer
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href={basePath}>Réinitialiser</Link>
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-4 md:flex-row md:items-center md:justify-between">
        <p className="rounded-full bg-muted/45 px-3 py-1.5 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount}</span> {resultLabel} trouvé
          {totalCount > 1 ? "s" : ""} · page {page} sur {pageCount}
        </p>

        {pageCount > 1 ? (
          <Pagination className="mx-0 w-auto justify-start md:justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationLink
                  href={previousHref}
                  size="default"
                  aria-disabled={page <= 1}
                  className={cn("h-9", page <= 1 ? "pointer-events-none opacity-50" : undefined)}
                >
                  Précédent
                </PaginationLink>
              </PaginationItem>

              {visiblePages.map((item) => (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={buildHref(basePath, { page: item, sort, year, status: persistedStatus })}
                    isActive={item === page}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationLink
                  href={nextHref}
                  size="default"
                  aria-disabled={page >= pageCount}
                  className={cn("h-9", page >= pageCount ? "pointer-events-none opacity-50" : undefined)}
                >
                  Suivant
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </div>
    </div>
  )
}
