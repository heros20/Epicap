export type PostHogRange = "24h" | "7d" | "30d"

export type PostHogSummaryMetric = {
  label: string
  value: number
  helper: string
}

export type PostHogSummaryRow = {
  label: string
  value: number
}

export type PostHogSummaryResult =
  | {
      configured: true
      projectUrl: string
      generatedAt: string
      range: PostHogRange
      rangeLabel: string
      metrics: PostHogSummaryMetric[]
      topEvents: PostHogSummaryRow[]
      topPages: PostHogSummaryRow[]
      topProducts: PostHogSummaryRow[]
      commercialActions: PostHogSummaryRow[]
      error: null
    }
  | {
      configured: false
      projectUrl: null
      generatedAt: string
      range: PostHogRange
      rangeLabel: string
      metrics: []
      topEvents: []
      topPages: []
      topProducts: []
      commercialActions: []
      error: string
    }
  | {
      configured: true
      projectUrl: string | null
      generatedAt: string
      range: PostHogRange
      rangeLabel: string
      metrics: []
      topEvents: []
      topPages: []
      topProducts: []
      commercialActions: []
      error: string
    }

type HogQlResponse = {
  results?: unknown[][]
}

const DEFAULT_POSTHOG_API_HOST = "https://eu.posthog.com"

const rangeConfig: Record<PostHogRange, { label: string; interval: string }> = {
  "24h": { label: "24 dernières heures", interval: "INTERVAL 24 HOUR" },
  "7d": { label: "7 derniers jours", interval: "INTERVAL 7 DAY" },
  "30d": { label: "30 derniers jours", interval: "INTERVAL 30 DAY" },
}

const eventLabels: Record<string, string> = {
  "$pageview": "Page vue",
  "Product Viewed": "Fiche produit vue",
  "Product Add To Cart Clicked": "Clic ajouter au panier",
  "Add To Cart": "Ajout panier confirmé",
  "Cart Viewed": "Panier consulté",
  "Quote CTA Clicked": "Clic demande de devis",
  "Quote Form Viewed": "Formulaire devis consulté",
  "Checkout Viewed": "Checkout consulté",
  "Checkout CTA Clicked": "Clic checkout",
  "Phone Clicked": "Clic téléphone",
  "Rental CTA Clicked": "Clic location",
  "Cart Quantity Updated": "Quantité panier modifiée",
  "Remove From Cart": "Article retiré du panier",
  "Cart Cleared": "Panier vidé",
}

function getPostHogConfig() {
  const apiHost = process.env.POSTHOG_API_HOST || DEFAULT_POSTHOG_API_HOST
  const projectId = process.env.POSTHOG_PROJECT_ID
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY

  if (!projectId || !personalApiKey) {
    return null
  }

  return {
    apiHost: apiHost.replace(/\/$/, ""),
    projectId,
    personalApiKey,
  }
}

function getRangeConfig(range: PostHogRange) {
  return rangeConfig[range] ?? rangeConfig["7d"]
}

export function parsePostHogRange(value: string | null | undefined): PostHogRange {
  return value === "24h" || value === "30d" ? value : "7d"
}

async function runHogQlQuery(config: NonNullable<ReturnType<typeof getPostHogConfig>>, query: string) {
  const response = await fetch(`${config.apiHost}/api/projects/${config.projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.personalApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: {
        kind: "HogQLQuery",
        query,
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`PostHog a refusé la lecture des analytics (${response.status}).`)
  }

  const payload = (await response.json()) as HogQlResponse
  return payload.results ?? []
}

function readCount(rows: unknown[][]) {
  const value = rows[0]?.[0]
  return typeof value === "number" ? value : Number(value ?? 0)
}

function toRows(rows: unknown[][], labels?: Record<string, string>): PostHogSummaryRow[] {
  return rows
    .map((row) => {
      const rawLabel = String(row[0] ?? "Inconnu")

      return {
        label: labels?.[rawLabel] ?? rawLabel,
        value: Number(row[1] ?? 0),
      }
    })
    .filter((row) => row.label && Number.isFinite(row.value))
}

export async function getPostHogSummary({
  range = "7d",
}: {
  range?: PostHogRange
} = {}): Promise<PostHogSummaryResult> {
  const config = getPostHogConfig()
  const selectedRange = parsePostHogRange(range)
  const selectedRangeConfig = getRangeConfig(selectedRange)
  const generatedAt = new Date().toISOString()

  if (!config) {
    return {
      configured: false,
      projectUrl: null,
      generatedAt,
      range: selectedRange,
      rangeLabel: selectedRangeConfig.label,
      metrics: [],
      topEvents: [],
      topPages: [],
      topProducts: [],
      commercialActions: [],
      error:
        "Configurez POSTHOG_PROJECT_ID et POSTHOG_PERSONAL_API_KEY pour afficher les analytics PostHog.",
    }
  }

  const projectUrl = `${config.apiHost}/project/${config.projectId}`
  const sinceFilter = `timestamp >= now() - ${selectedRangeConfig.interval}`
  const productNameExpression =
    "coalesce(nullIf(toString(properties['product_name']), ''), nullIf(toString(properties['$current_url']), ''), 'Produit inconnu')"

  try {
    const [
      pageviews,
      visitors,
      productViews,
      cartViews,
      cartAdds,
      quoteClicks,
      phoneClicks,
      checkoutViews,
      topEvents,
      topPages,
      topProducts,
      commercialActions,
    ] = await Promise.all([
      runHogQlQuery(config, `SELECT count() FROM events WHERE event = '$pageview' AND ${sinceFilter}`),
      runHogQlQuery(config, `SELECT count(DISTINCT distinct_id) FROM events WHERE ${sinceFilter}`),
      runHogQlQuery(config, `SELECT count() FROM events WHERE event = 'Product Viewed' AND ${sinceFilter}`),
      runHogQlQuery(config, `SELECT count() FROM events WHERE event = 'Cart Viewed' AND ${sinceFilter}`),
      runHogQlQuery(
        config,
        `SELECT count() FROM events WHERE event IN ('Add To Cart', 'Product Add To Cart Clicked') AND ${sinceFilter}`,
      ),
      runHogQlQuery(config, `SELECT count() FROM events WHERE event = 'Quote CTA Clicked' AND ${sinceFilter}`),
      runHogQlQuery(config, `SELECT count() FROM events WHERE event = 'Phone Clicked' AND ${sinceFilter}`),
      runHogQlQuery(
        config,
        `SELECT count() FROM events WHERE ${sinceFilter} AND (event = 'Checkout Viewed' OR (event = '$pageview' AND toString(properties['path']) LIKE '/checkout%'))`,
      ),
      runHogQlQuery(
        config,
        `SELECT event, count() AS total FROM events WHERE ${sinceFilter} GROUP BY event ORDER BY total DESC LIMIT 10`,
      ),
      runHogQlQuery(
        config,
        `SELECT coalesce(nullIf(toString(properties['path']), ''), nullIf(toString(properties['$current_url']), ''), 'Page inconnue') AS page, count() AS total FROM events WHERE event = '$pageview' AND ${sinceFilter} GROUP BY page ORDER BY total DESC LIMIT 10`,
      ),
      runHogQlQuery(
        config,
        `SELECT ${productNameExpression} AS product, count() AS total FROM events WHERE event = 'Product Viewed' AND ${sinceFilter} GROUP BY product ORDER BY total DESC LIMIT 10`,
      ),
      runHogQlQuery(
        config,
        `SELECT event, count() AS total FROM events WHERE event IN ('Product Add To Cart Clicked', 'Add To Cart', 'Cart Viewed', 'Quote CTA Clicked', 'Quote Form Viewed', 'Checkout CTA Clicked', 'Checkout Viewed', 'Phone Clicked', 'Rental CTA Clicked') AND ${sinceFilter} GROUP BY event ORDER BY total DESC LIMIT 10`,
      ),
    ])

    return {
      configured: true,
      projectUrl,
      generatedAt,
      range: selectedRange,
      rangeLabel: selectedRangeConfig.label,
      metrics: [
        {
          label: "Pages vues",
          value: readCount(pageviews),
          helper: selectedRangeConfig.label,
        },
        {
          label: "Visiteurs uniques",
          value: readCount(visitors),
          helper: "Navigateurs distincts suivis par PostHog",
        },
        {
          label: "Fiches produit vues",
          value: readCount(productViews),
          helper: "Fiches catalogue ouvertes depuis /boutique",
        },
        {
          label: "Panier consulté",
          value: readCount(cartViews),
          helper: "Passages sur la page panier",
        },
        {
          label: "Ajouts panier",
          value: readCount(cartAdds),
          helper: "Depuis les cartes ou fiches produit",
        },
        {
          label: "Clics devis",
          value: readCount(quoteClicks),
          helper: "Boutons de demande de devis",
        },
        {
          label: "Clics téléphone",
          value: readCount(phoneClicks),
          helper: "Appels déclenchés depuis le site",
        },
        {
          label: "Checkout consulté",
          value: readCount(checkoutViews),
          helper: "Entrées dans le parcours commande",
        },
      ],
      topEvents: toRows(topEvents, eventLabels),
      topPages: toRows(topPages),
      topProducts: toRows(topProducts),
      commercialActions: toRows(commercialActions, eventLabels),
      error: null,
    }
  } catch (error) {
    return {
      configured: true,
      projectUrl,
      generatedAt,
      range: selectedRange,
      rangeLabel: selectedRangeConfig.label,
      metrics: [],
      topEvents: [],
      topPages: [],
      topProducts: [],
      commercialActions: [],
      error: error instanceof Error ? error.message : "Lecture PostHog indisponible.",
    }
  }
}
