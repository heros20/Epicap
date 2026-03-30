"use client"

import * as React from "react"
import { ArrowRight, Search } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  type: "product" | "category" | "subcategory" | "service"
  title: string
  description: string
  href: string
  badge: string
}

interface HeaderSearchBoxProps {
  mobile?: boolean
  className?: string
}

export function HeaderSearchBox({ mobile = false, className }: HeaderSearchBoxProps) {
  const router = useRouter()
  const pathname = usePathname()
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  const [searchValue, setSearchValue] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([])
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const deferredSearchValue = React.useDeferredValue(searchValue)
  const trimmedSearchValue = searchValue.trim()
  const trimmedDeferredSearchValue = deferredSearchValue.trim()
  const shouldShowSuggestions = isFocused && trimmedSearchValue.length >= 2

  const syncSearchValueWithLocation = React.useCallback(() => {
    if (typeof window === "undefined") {
      return
    }

    const params = new URLSearchParams(window.location.search)
    setSearchValue(params.get("query") ?? "")
  }, [])

  React.useEffect(() => {
    syncSearchValueWithLocation()
  }, [pathname, syncSearchValueWithLocation])

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.addEventListener("popstate", syncSearchValueWithLocation)

    return () => window.removeEventListener("popstate", syncSearchValueWithLocation)
  }, [syncSearchValueWithLocation])

  React.useEffect(() => {
    if (trimmedDeferredSearchValue.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      setActiveIndex(-1)
      return
    }

    const abortController = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedDeferredSearchValue)}`,
          {
            signal: abortController.signal,
            cache: "no-store",
          },
        )

        if (!response.ok) {
          throw new Error("Search request failed")
        }

        const payload = (await response.json()) as { suggestions: SearchSuggestion[] }
        React.startTransition(() => {
          setSuggestions(payload.suggestions)
          setActiveIndex(-1)
        })
      } catch {
        if (!abortController.signal.aborted) {
          React.startTransition(() => {
            setSuggestions([])
            setActiveIndex(-1)
          })
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 120)

    return () => {
      abortController.abort()
      window.clearTimeout(timeoutId)
    }
  }, [trimmedDeferredSearchValue])

  const navigateToSearchResults = React.useCallback(
    (query: string) => {
      const trimmedQuery = query.trim()
      const params = new URLSearchParams()

      if (trimmedQuery) {
        params.set("query", trimmedQuery)
      }

      setIsFocused(false)
      setActiveIndex(-1)
      router.push(`/boutique${params.toString() ? `?${params.toString()}` : ""}`)
    },
    [router],
  )

  const navigateToSuggestion = React.useCallback(
    (suggestion: SearchSuggestion) => {
      setSearchValue(suggestion.title)
      setIsFocused(false)
      setActiveIndex(-1)
      router.push(suggestion.href)
    },
    [router],
  )

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (activeIndex >= 0 && suggestions[activeIndex]) {
        navigateToSuggestion(suggestions[activeIndex])
        return
      }

      navigateToSearchResults(searchValue)
    },
    [activeIndex, navigateToSearchResults, navigateToSuggestion, searchValue, suggestions],
  )

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!shouldShowSuggestions) {
        return
      }

      if (event.key === "ArrowDown") {
        event.preventDefault()
        setActiveIndex((currentIndex) =>
          Math.min(currentIndex + 1, Math.max(suggestions.length - 1, 0)),
        )
        return
      }

      if (event.key === "ArrowUp") {
        event.preventDefault()
        setActiveIndex((currentIndex) => Math.max(currentIndex - 1, -1))
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setIsFocused(false)
        setActiveIndex(-1)
      }
    },
    [shouldShowSuggestions, suggestions.length],
  )

  const handleBlurCapture = React.useCallback(() => {
    window.setTimeout(() => {
      if (wrapperRef.current?.contains(document.activeElement)) {
        return
      }

      setIsFocused(false)
      setActiveIndex(-1)
    }, 0)
  }, [])

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={handleBlurCapture}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex h-11 w-full items-center rounded-2xl border border-border/70 bg-card px-4 text-sm shadow-[0_14px_28px_-24px_rgba(15,16,18,0.16)] transition-all focus-within:border-primary/45",
          mobile && "shadow-none",
        )}
        role="search"
      >
        <Search className="mr-3 size-4 text-muted-foreground" />
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={mobile ? "Rechercher dans le catalogue" : "Rechercher dans le catalogue Epicap"}
          aria-label="Rechercher dans le catalogue Epicap"
          aria-expanded={shouldShowSuggestions}
          className="h-full border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
        />
        {!mobile && (
          <Button type="submit" size="sm" className="ml-3 rounded-full px-4">
            Rechercher
          </Button>
        )}
      </form>

      {shouldShowSuggestions && (
        <div className="absolute inset-x-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-[1.4rem] border border-border/80 bg-popover text-popover-foreground shadow-[0_26px_60px_-34px_rgba(15,16,18,0.32)]">
          <div className="max-h-[380px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="px-3 py-6 text-sm text-muted-foreground">
                Recherche en cours...
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={`${suggestion.type}-${suggestion.href}`}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateToSuggestion(suggestion)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                        activeIndex === index
                          ? "bg-accent/75 text-foreground"
                          : "hover:bg-accent/55",
                      )}
                    >
                      <Badge variant="secondary" className="mt-0.5 shrink-0 rounded-full">
                        {suggestion.badge}
                      </Badge>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          <HighlightMatch text={suggestion.title} query={trimmedSearchValue} />
                        </p>
                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-6 text-sm text-muted-foreground">
                Aucun résultat direct pour cette saisie.
              </div>
            )}
          </div>

          <div className="border-t border-border/70 p-2">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => navigateToSearchResults(searchValue)}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-accent/55"
            >
              <span>
                Voir tous les résultats pour{" "}
                <span className="text-foreground">&quot;{trimmedSearchValue}&quot;</span>
              </span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  const normalizedQuery = query.trim()
  if (!normalizedQuery) {
    return text
  }

  const pattern = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "ig")
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === normalizedQuery.toLowerCase() ? (
          <span key={`${part}-${index}`} className="text-primary">
            {part}
          </span>
        ) : (
          <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
        ),
      )}
    </>
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
