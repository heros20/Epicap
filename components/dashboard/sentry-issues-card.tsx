"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, ShieldAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { SentryIssue, SentryIssuesResult } from "@/lib/sentry/issues"

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "short",
  timeStyle: "short",
})

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date inconnue" : dateFormatter.format(date)
}

function issueCountLabel(issue: SentryIssue) {
  const count = Number(issue.count)
  return Number.isFinite(count) ? `${count.toLocaleString("fr-FR")} occurrence(s)` : issue.count
}

export function SentryIssuesCard() {
  const [data, setData] = React.useState<SentryIssuesResult | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [resolvingIssueId, setResolvingIssueId] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const loadIssues = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/sentry/issues", { cache: "no-store" })

      if (!response.ok) {
        setData({
          configured: true,
          issues: [],
          sentryUrl: null,
          error: "Lecture Sentry non autorisee ou indisponible.",
        })
        return
      }

      setData((await response.json()) as SentryIssuesResult)
    } catch {
      setData({
        configured: true,
        issues: [],
        sentryUrl: null,
        error: "Lecture Sentry momentanement indisponible.",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadIssues()
  }, [loadIssues])

  const resolveIssue = React.useCallback(
    async (issueId: string) => {
      setResolvingIssueId(issueId)
      setActionError(null)

      try {
        const response = await fetch("/api/admin/sentry/issues", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ issueId }),
        })
        const payload = (await response.json()) as { ok?: boolean; error?: string }

        if (!response.ok || !payload.ok) {
          setActionError(payload.error ?? "Sentry a refusé la résolution de l'issue.")
          return
        }

        await loadIssues()
      } catch {
        setActionError("Résolution Sentry momentanément indisponible.")
      } finally {
        setResolvingIssueId(null)
      }
    },
    [loadIssues],
  )

  const issues = data?.issues ?? []
  const hasIssues = issues.length > 0

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Erreurs & bugs Sentry</CardTitle>
            <CardDescription>Issues non résolues remontées par le monitoring applicatif.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => void loadIssues()}
            disabled={isLoading}
            aria-label="Rafraîchir les issues Sentry"
          >
            <RefreshCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {isLoading ? (
          <div className="rounded-xl border border-border/70 bg-muted/35 p-4 text-sm text-muted-foreground">
            Chargement des issues Sentry...
          </div>
        ) : data?.error ? (
          <div className="flex gap-3 rounded-xl border border-amber-300/35 bg-amber-50 p-4 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>{data.error}</p>
          </div>
        ) : hasIssues ? (
          <div className="space-y-3">
            {actionError ? (
              <div className="flex gap-3 rounded-xl border border-amber-300/35 bg-amber-50 p-4 text-sm text-amber-950">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>{actionError}</p>
              </div>
            ) : null}
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl border border-border/70 bg-muted/25 p-4 transition-colors hover:border-primary/35 hover:bg-primary/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{issue.shortId}</Badge>
                      <Badge variant={issue.level === "error" ? "destructive" : "secondary"}>
                        {issue.level}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium">{issue.title}</p>
                    {issue.culprit ? (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{issue.culprit}</p>
                    ) : null}
                  </div>
                  <Button asChild variant="ghost" size="icon" className="mt-0.5 shrink-0">
                    <a
                      href={issue.permalink}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Ouvrir l'issue dans Sentry"
                    >
                      <ExternalLink className="size-4 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{issueCountLabel(issue)}</span>
                    <span>{issue.userCount.toLocaleString("fr-FR")} utilisateur(s)</span>
                    <span>Dernière vue : {formatDate(issue.lastSeen)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-md"
                    onClick={() => void resolveIssue(issue.id)}
                    disabled={resolvingIssueId === issue.id}
                  >
                    {resolvingIssueId === issue.id ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Marquer comme résolu
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 rounded-xl border border-emerald-300/35 bg-emerald-50 p-4 text-sm text-emerald-950">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <p>Aucune issue non résolue remontée par Sentry.</p>
          </div>
        )}

        {data?.sentryUrl ? (
          <Button asChild variant="outline" className="w-full rounded-md">
            <a href={data.sentryUrl} target="_blank" rel="noreferrer">
              Ouvrir Sentry
              <ExternalLink className="size-4" />
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
