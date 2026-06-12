"use client"

/* eslint-disable @next/next/no-img-element -- Catalogue pages are generated JPEGs from the source PDFs. */

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Download, ExternalLink, Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { catalogues, type CatalogueId } from "@/lib/data/catalogues"
import { cn } from "@/lib/utils"

type Catalogue = (typeof catalogues)[number]

type FlipState = {
  direction: "next" | "previous"
  front?: string
  back?: string
}

const FLIP_DURATION_MS = 680
const SPREAD_SWAP_DELAY_MS = 540

export function CatalogueBook({ initialCatalogueId }: { initialCatalogueId: CatalogueId }) {
  const searchParams = useSearchParams()
  const [activeId, setActiveId] = React.useState<CatalogueId>(initialCatalogueId)
  const [spreadStart, setSpreadStart] = React.useState(0)
  const [flip, setFlip] = React.useState<FlipState | null>(null)
  const [zoom, setZoom] = React.useState(1)
  const [targetPage, setTargetPage] = React.useState(1)
  const [pageInput, setPageInput] = React.useState("1")
  const flipTimeoutRef = React.useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const spreadSwapTimeoutRef = React.useRef<ReturnType<typeof window.setTimeout> | null>(null)

  const activeCatalogue = catalogues.find((catalogue) => catalogue.id === activeId) ?? catalogues[0]
  const leftPage = spreadStart
  const rightPage = spreadStart + 1 < activeCatalogue.pageCount ? spreadStart + 1 : null
  const canGoPrevious = spreadStart > 0 && !flip
  const canGoNext = spreadStart + 2 < activeCatalogue.pageCount && !flip
  const pageLabel =
    rightPage !== null ? `Pages ${leftPage + 1} et ${rightPage + 1}` : `Page ${leftPage + 1}`

  const clearFlipTimers = React.useCallback(() => {
    if (flipTimeoutRef.current) {
      window.clearTimeout(flipTimeoutRef.current)
      flipTimeoutRef.current = null
    }

    if (spreadSwapTimeoutRef.current) {
      window.clearTimeout(spreadSwapTimeoutRef.current)
      spreadSwapTimeoutRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const visiblePages = [leftPage + 1, rightPage !== null ? rightPage + 1 : null]

    if (!visiblePages.includes(targetPage)) {
      const nextTargetPage = leftPage + 1

      setTargetPage(nextTargetPage)
      setPageInput(String(nextTargetPage))
    }
  }, [leftPage, rightPage, targetPage])

  React.useEffect(() => {
    return () => {
      if (flipTimeoutRef.current) {
        window.clearTimeout(flipTimeoutRef.current)
      }

      if (spreadSwapTimeoutRef.current) {
        window.clearTimeout(spreadSwapTimeoutRef.current)
      }
    }
  }, [])

  React.useEffect(() => {
    const catalogueParam = searchParams.get("catalogue")
    const nextCatalogue = catalogues.find((catalogue) => catalogue.id === catalogueParam)

    if (!nextCatalogue || nextCatalogue.id === activeId) {
      return
    }

    setActiveId(nextCatalogue.id)
    setSpreadStart(0)
    setFlip(null)
    clearFlipTimers()
    setTargetPage(1)
    setPageInput("1")
  }, [activeId, clearFlipTimers, searchParams])

  const selectCatalogue = (catalogueId: CatalogueId) => {
    setActiveId(catalogueId)
    setSpreadStart(0)
    setFlip(null)
    clearFlipTimers()
    setTargetPage(1)
    setPageInput("1")

    const params = new URLSearchParams(window.location.search)
    params.set("catalogue", catalogueId)
    window.history.replaceState(null, "", `/catalogues?${params.toString()}`)
  }

  const goToPage = (pageNumber: number) => {
    const clampedPage = Math.min(Math.max(pageNumber, 1), activeCatalogue.pageCount)
    const nextStart = getSpreadStartForPage(activeCatalogue, clampedPage)

    if (nextStart === spreadStart) {
      setTargetPage(clampedPage)
      setPageInput(String(clampedPage))
      return
    }

    if (flipTimeoutRef.current) {
      window.clearTimeout(flipTimeoutRef.current)
      flipTimeoutRef.current = null
    }

    if (spreadSwapTimeoutRef.current) {
      window.clearTimeout(spreadSwapTimeoutRef.current)
      spreadSwapTimeoutRef.current = null
    }

    setFlip(null)
    setTargetPage(clampedPage)
    setPageInput(String(clampedPage))
    setSpreadStart(nextStart)
  }

  const commitPageInput = () => {
    const parsedPage = Number.parseInt(pageInput, 10)

    if (Number.isNaN(parsedPage)) {
      setPageInput(String(leftPage + 1))
      return
    }

    goToPage(parsedPage)
  }

  const turnPage = (direction: "next" | "previous") => {
    if (direction === "next" && !canGoNext) {
      return
    }

    if (direction === "previous" && !canGoPrevious) {
      return
    }

    const nextStart = direction === "next" ? spreadStart + 2 : spreadStart - 2
    const frontPage = direction === "next" ? rightPage ?? leftPage : leftPage
    const backPage = direction === "next" ? nextStart : nextStart + 1

    setFlip({
      direction,
      front: getPageImage(activeCatalogue, frontPage),
      back: getPageImage(activeCatalogue, backPage),
    })
    setTargetPage(nextStart + 1)
    setPageInput(String(nextStart + 1))

    clearFlipTimers()

    spreadSwapTimeoutRef.current = window.setTimeout(() => {
      setSpreadStart(nextStart)
      spreadSwapTimeoutRef.current = null
    }, SPREAD_SWAP_DELAY_MS)

    flipTimeoutRef.current = window.setTimeout(() => {
      setFlip(null)
      flipTimeoutRef.current = null
    }, FLIP_DURATION_MS)
  }

  return (
    <section className="border-t border-border/70 bg-[#f7f8fa] py-6 lg:py-8">
      <div className="container mx-auto px-4">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Feuilleter
            </p>
            <h2 className="mt-2 text-2xl font-bold lg:text-3xl">{activeCatalogue.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {catalogues.map((catalogue) => {
              const Icon = catalogue.icon

              return (
                <Button
                  key={catalogue.id}
                  type="button"
                  variant={catalogue.id === activeId ? "default" : "outline"}
                  className="rounded-md"
                  onClick={() => selectCatalogue(catalogue.id)}
                >
                  <Icon className="size-4" />
                  {catalogue.title}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="catalogue-stage">
            <div className="catalogue-toolbar">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md"
                onClick={() => turnPage("previous")}
                disabled={!canGoPrevious}
              >
                <ArrowLeft className="size-4" />
                <span className="sr-only">Pages précédentes</span>
              </Button>
              <div className="min-w-0 text-center text-sm font-semibold">
                {pageLabel}
                <span className="ml-2 text-muted-foreground">
                  sur {activeCatalogue.pageCount}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md"
                onClick={() => turnPage("next")}
                disabled={!canGoNext}
              >
                <ArrowRight className="size-4" />
                <span className="sr-only">Pages suivantes</span>
              </Button>
            </div>

            <div className="catalogue-book-shell" style={{ "--book-zoom": zoom } as React.CSSProperties}>
              <div className="catalogue-book">
                <BookPage
                  image={getPageImage(activeCatalogue, leftPage)}
                  pageNumber={leftPage + 1}
                  side="left"
                  disabled={!canGoPrevious}
                  onTurn={() => turnPage("previous")}
                />
                <BookPage
                  image={rightPage !== null ? getPageImage(activeCatalogue, rightPage) : undefined}
                  pageNumber={rightPage !== null ? rightPage + 1 : undefined}
                  side="right"
                  disabled={!canGoNext || rightPage === null}
                  onTurn={() => turnPage("next")}
                />
                {flip ? <TurningPage flip={flip} /> : null}
              </div>
            </div>

            <div className="catalogue-page-picker" aria-label="Navigation dans le catalogue">
              <span className="catalogue-page-picker-label">Page</span>
              <input
                type="range"
                min={1}
                max={activeCatalogue.pageCount}
                value={targetPage}
                onChange={(event) => goToPage(Number(event.target.value))}
                aria-label="Choisir une page"
              />
              <div className="catalogue-page-picker-number">
                <input
                  type="number"
                  min={1}
                  max={activeCatalogue.pageCount}
                  value={pageInput}
                  onChange={(event) => setPageInput(event.target.value)}
                  onBlur={commitPageInput}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur()
                    }
                  }}
                  aria-label="Aller a la page"
                />
                <span>/ {activeCatalogue.pageCount}</span>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-border/70 bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {activeCatalogue.eyebrow}
            </p>
            <h3 className="mt-2 text-xl font-bold">{activeCatalogue.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{activeCatalogue.description}</p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md"
                onClick={() => setZoom((current) => Math.max(0.72, Number((current - 0.1).toFixed(2))))}
              >
                <Minus className="size-4" />
                <span className="sr-only">Réduire l&apos;affichage</span>
              </Button>
              <div className="flex h-10 items-center justify-center rounded-md border border-border/70 bg-background text-sm font-semibold">
                {Math.round(zoom * 100)}%
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-md"
                onClick={() => setZoom((current) => Math.min(1.22, Number((current + 0.1).toFixed(2))))}
              >
                <Plus className="size-4" />
                <span className="sr-only">Agrandir l&apos;affichage</span>
              </Button>
            </div>

            <div className="mt-5 grid gap-2">
              <Button asChild className="justify-between rounded-md">
                <a href={activeCatalogue.pdfUrl} target="_blank" rel="noreferrer">
                  Ouvrir le PDF
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between rounded-md">
                <a href={activeCatalogue.pdfUrl} download>
                  Télécharger le catalogue
                  <Download className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-between rounded-md">
                <Link href="/devis?source=catalogues">
                  Demander un devis
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function getPageImage(catalogue: Catalogue, pageIndex: number) {
  if (pageIndex < 0 || pageIndex >= catalogue.pageCount) {
    return undefined
  }

  return `${catalogue.pageBaseUrl}${String(pageIndex + 1).padStart(3, "0")}.jpg`
}

function getSpreadStartForPage(catalogue: Catalogue, pageNumber: number) {
  const pageIndex = Math.min(Math.max(pageNumber - 1, 0), catalogue.pageCount - 1)
  const spreadStart = Math.floor(pageIndex / 2) * 2

  return Math.min(spreadStart, Math.max(catalogue.pageCount - 1, 0))
}

function BookPage({
  image,
  pageNumber,
  side,
  disabled,
  onTurn,
}: {
  image?: string
  pageNumber?: number
  side: "left" | "right"
  disabled?: boolean
  onTurn?: () => void
}) {
  const canTurn = Boolean(onTurn && !disabled)

  return (
    <div
      className={cn(
        "catalogue-page",
        side === "left" ? "catalogue-page-left" : "catalogue-page-right",
        canTurn && "catalogue-page-clickable",
      )}
      role={canTurn ? "button" : undefined}
      tabIndex={canTurn ? 0 : undefined}
      aria-label={canTurn ? (side === "left" ? "Pages precedentes" : "Pages suivantes") : undefined}
      onClick={canTurn ? onTurn : undefined}
      onKeyDown={
        canTurn
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onTurn?.()
              }
            }
          : undefined
      }
    >
      {image ? (
        <img src={image} alt={pageNumber ? `Page ${pageNumber}` : "Page du catalogue"} />
      ) : (
        <div className="catalogue-page-placeholder" aria-hidden="true" />
      )}
      {pageNumber ? <span className="catalogue-page-number">{pageNumber}</span> : null}
    </div>
  )
}

function TurningPage({ flip }: { flip: FlipState }) {
  return (
    <div
      className={cn(
        "catalogue-turning-page",
        flip.direction === "next" ? "catalogue-turn-next" : "catalogue-turn-previous",
      )}
    >
      <div className="catalogue-turn-face catalogue-turn-front">
        {flip.front ? <img src={flip.front} alt="" /> : null}
      </div>
      <div className="catalogue-turn-face catalogue-turn-back">
        {flip.back ? <img src={flip.back} alt="" /> : null}
      </div>
    </div>
  )
}
