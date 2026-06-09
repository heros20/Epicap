export type SentryIssue = {
  id: string
  shortId: string
  title: string
  culprit: string | null
  level: string
  count: string
  userCount: number
  lastSeen: string
  firstSeen: string
  permalink: string
}

type RawSentryIssue = {
  id: string
  shortId?: string
  title?: string
  culprit?: string | null
  level?: string
  count?: string
  userCount?: number
  lastSeen?: string
  firstSeen?: string
  permalink?: string
  metadata?: {
    title?: string
    value?: string
    type?: string
  }
}

export type SentryIssuesResult =
  | {
      configured: true
      issues: SentryIssue[]
      sentryUrl: string
      error: null
    }
  | {
      configured: false
      issues: []
      sentryUrl: null
      error: string
    }
  | {
      configured: true
      issues: []
      sentryUrl: string | null
      error: string
    }

const DEFAULT_SENTRY_API_URL = "https://sentry.io"

function getSentryConfig() {
  const apiUrl = process.env.SENTRY_API_URL ?? DEFAULT_SENTRY_API_URL
  const org = process.env.SENTRY_ORG
  const project = process.env.SENTRY_PROJECT
  const authToken = process.env.SENTRY_AUTH_TOKEN

  if (!org || !project || !authToken) {
    return null
  }

  return {
    apiUrl: apiUrl.replace(/\/$/, ""),
    org,
    project,
    authToken,
  }
}

export async function getSentryIssues(): Promise<SentryIssuesResult> {
  const config = getSentryConfig()

  if (!config) {
    return {
      configured: false,
      issues: [],
      sentryUrl: null,
      error: "Configurez SENTRY_ORG, SENTRY_PROJECT et SENTRY_AUTH_TOKEN pour afficher les bugs Sentry.",
    }
  }

  const url = new URL(
    `/api/0/projects/${encodeURIComponent(config.org)}/${encodeURIComponent(
      config.project,
    )}/issues/`,
    config.apiUrl,
  )
  url.searchParams.set("query", "is:unresolved")
  url.searchParams.set("statsPeriod", "24h")

  const sentryUrl = `${config.apiUrl}/organizations/${config.org}/issues/?project=${config.project}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.authToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return {
        configured: true,
        issues: [],
        sentryUrl,
        error: `Sentry a refusé la lecture des issues (${response.status}).`,
      }
    }

    const payload = (await response.json()) as RawSentryIssue[]
    const issues = payload.slice(0, 6).map((issue) => ({
      id: issue.id,
      shortId: issue.shortId ?? issue.id,
      title: issue.title ?? issue.metadata?.title ?? issue.metadata?.value ?? "Erreur sans titre",
      culprit: issue.culprit ?? null,
      level: issue.level ?? "error",
      count: issue.count ?? "0",
      userCount: issue.userCount ?? 0,
      lastSeen: issue.lastSeen ?? "",
      firstSeen: issue.firstSeen ?? "",
      permalink: issue.permalink ?? sentryUrl,
    }))

    return {
      configured: true,
      issues,
      sentryUrl,
      error: null,
    }
  } catch {
    return {
      configured: true,
      issues: [],
      sentryUrl,
      error: "Lecture Sentry momentanement indisponible.",
    }
  }
}
