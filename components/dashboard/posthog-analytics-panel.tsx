"use client"

import * as React from "react"
import { AlertTriangle, BarChart3, ExternalLink, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { PostHogRange, PostHogSummaryResult } from "@/lib/posthog/analytics"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("fr-FR")

const rangeOptions: Array<{ value: PostHogRange; label: string }> = [
  { value: "24h", label: "24 h" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
]

function formatDate(value: string | undefined) {
  if (!value) return "Date inconnue"

  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date inconnue"
    : new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date)
}

function StatTile({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper: string
}) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-muted/25 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{numberFormatter.format(value)}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{helper}</p>
    </div>
  )
}

function RankingList({
  title,
  description,
  empty,
  rows,
  collapsible = false,
}: {
  title: string
  description: string
  empty: string
  rows: Array<{ label: string; value: number }>
  collapsible?: boolean
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const visibleLimit = 5
  const hasHiddenRows = collapsible && rows.length > visibleLimit
  const visibleRows = hasHiddenRows && !isExpanded ? rows.slice(0, visibleLimit) : rows

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {rows.length > 0 ? (
          <>
            {visibleRows.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <p className="mt-2 truncate text-sm font-medium" title={row.label}>
                    {row.label}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{numberFormatter.format(row.value)}</p>
              </div>
            ))}
            {hasHiddenRows ? (
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setIsExpanded((current) => !current)}
              >
                {isExpanded ? "Voir moins" : `Voir plus (${rows.length - visibleLimit})`}
              </Button>
            ) : null}
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
            {empty}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function PostHogAnalyticsPanel() {
  const [range, setRange] = React.useState<PostHogRange>("7d")
  const [data, setData] = React.useState<PostHogSummaryResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const loadSummary = React.useCallback(async (nextRange: PostHogRange) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/posthog/summary?range=${nextRange}`, {
        cache: "no-store",
      })

      if (!response.ok) {
        setData({
          configured: true,
          projectUrl: null,
          generatedAt: new Date().toISOString(),
          range: nextRange,
          rangeLabel: "Période sélectionnée",
          metrics: [],
          topEvents: [],
          topPages: [],
          topProducts: [],
          commercialActions: [],
          error: "Lecture PostHog non autorisée ou indisponible.",
        })
        return
      }

      setData((await response.json()) as PostHogSummaryResult)
    } catch {
      setData({
        configured: true,
        projectUrl: null,
        generatedAt: new Date().toISOString(),
        range: nextRange,
        rangeLabel: "Période sélectionnée",
        metrics: [],
        topEvents: [],
        topPages: [],
        topProducts: [],
        commercialActions: [],
        error: "Lecture PostHog momentanément indisponible.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadSummary(range)
  }, [loadSummary, range])

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-5 text-primary" />
                Analytics PostHog
              </CardTitle>
              <CardDescription>
                Tableau de bord français des visites, produits consultés et actions commerciales.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex rounded-full border border-border/70 bg-muted/25 p-1">
                {rangeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      range === option.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => void loadSummary(range)}
                disabled={isLoading}
                aria-label="Rafraîchir PostHog"
              >
                <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
              </Button>
              {data?.projectUrl ? (
                <Button asChild variant="outline">
                  <a href={data.projectUrl} target="_blank" rel="noreferrer">
                    Ouvrir PostHog
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            <span>
              Période analysée :{" "}
              <span className="font-medium text-foreground">
                {data?.rangeLabel ?? "Chargement"}
              </span>
            </span>
            <span>Dernière mise à jour : {formatDate(data?.generatedAt)}</span>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
              Chargement des analytics PostHog...
            </div>
          ) : data?.error ? (
            <div className="flex gap-3 rounded-xl border border-amber-300/35 bg-amber-50 p-4 text-sm text-amber-950">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{data.error}</p>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {(data?.metrics ?? []).map((metric) => (
              <StatTile key={metric.label} {...metric} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankingList
          title="Pages les plus vues"
          description="Pages qui attirent le plus de trafic sur la période."
          empty="Aucune page vue sur la période."
          rows={data?.topPages ?? []}
          collapsible
        />
        <RankingList
          title="Produits les plus consultés"
          description="Fiches catalogue qui intéressent le plus les visiteurs."
          empty="Aucune fiche produit vue sur la période."
          rows={data?.topProducts ?? []}
          collapsible
        />
        <RankingList
          title="Actions commerciales"
          description="Signaux utiles pour panier, devis, téléphone et checkout."
          empty="Aucune action commerciale suivie sur la période."
          rows={data?.commercialActions ?? []}
          collapsible
        />
        <RankingList
          title="Tous les événements suivis"
          description="Vue technique traduite des événements PostHog les plus fréquents."
          empty="Aucun événement PostHog sur la période."
          rows={data?.topEvents ?? []}
          collapsible
        />
      </div>
    </div>
  )
}
