"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts"
import {
  ArrowRight,
  Boxes,
  Clock3,
  FileText,
  HandCoins,
  LayoutPanelLeft,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { PendingLinkButton } from "@/components/dashboard/pending-link-button"
import { SentryIssuesCard } from "@/components/dashboard/sentry-issues-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { AdminDashboardAnalytics } from "@/lib/auth/dashboard"
import {
  ORDER_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  ROLE_LABELS,
  type ProfileWithCompany,
} from "@/lib/auth/types"

type DashboardRange = "24h" | "7d" | "30d" | "all"

type DashboardActivity = {
  id: string
  kind: "order" | "quote"
  reference: string
  contact: string
  status: string
  amount: number
  createdAt: string
}

type ChartPoint = {
  key: string
  label: string
  saleRevenue: number
  rentalRevenue: number
  totalRevenue: number
  sales: number
  rentals: number
}

const rangeOptions: Array<{ value: DashboardRange; label: string }> = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7j" },
  { value: "30d", label: "30j" },
  { value: "all", label: "Toujours" },
]

const chartConfig = {
  saleRevenue: {
    label: "Revenu vente",
    color: "#ff8f3d",
  },
  rentalRevenue: {
    label: "Revenu location",
    color: "#1bb59b",
  },
  totalRevenue: {
    label: "Revenu global",
    color: "#111827",
  },
} as const

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const preciseCurrencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const numberFormatter = new Intl.NumberFormat("fr-FR")

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
})

const monthFormatter = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
})

function toValidDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function startOfHour(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    0,
    0,
    0,
  )
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0)
}

function addHours(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 60 * 60 * 1000)
}

function addDays(date: Date, amount: number) {
  return new Date(date.getTime() + amount * 24 * 60 * 60 * 1000)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 0, 0, 0, 0)
}

function getActivityFeed(analytics: AdminDashboardAnalytics) {
  const orders = analytics.orders.map((order) => ({
    id: order.id,
    kind: "order" as const,
    reference: order.orderNumber ?? "Commande sans numero",
    contact: order.companyName ?? order.contactName ?? "Compte Epicap",
    status: ORDER_STATUS_LABELS[order.status],
    amount: order.total,
    createdAt: order.createdAt,
  }))

  const quotes = analytics.quotes.map((quote) => ({
    id: quote.id,
    kind: "quote" as const,
    reference: quote.quoteNumber ?? "Devis sans numero",
    contact: quote.companyName ?? quote.contactName ?? "Compte Epicap",
    status: QUOTE_STATUS_LABELS[quote.status],
    amount: quote.total,
    createdAt: quote.createdAt,
  }))

  return [...orders, ...quotes]
    .sort((left, right) => {
      const leftDate = toValidDate(left.createdAt)?.getTime() ?? 0
      const rightDate = toValidDate(right.createdAt)?.getTime() ?? 0
      return rightDate - leftDate
    })
    .slice(0, 8)
}

function buildChartData(analytics: AdminDashboardAnalytics, range: DashboardRange, now: Date) {
  const orders = analytics.orders
    .map((order) => ({
      ...order,
      date: toValidDate(order.createdAt),
    }))
    .filter((order) => order.date !== null)

  if (orders.length === 0) {
    return [] as ChartPoint[]
  }

  if (range === "24h") {
    const start = addHours(startOfHour(now), -23)
    const buckets = Array.from({ length: 24 }, (_, index) => {
      const bucketDate = addHours(start, index)
      const hourLabel = String(bucketDate.getHours()).padStart(2, "0")

      return {
        key: bucketDate.toISOString(),
        label: `${hourLabel}h`,
        saleRevenue: 0,
        rentalRevenue: 0,
        totalRevenue: 0,
        sales: 0,
        rentals: 0,
      } satisfies ChartPoint
    })

    for (const order of orders) {
      if (!order.date || order.date < start) {
        continue
      }

      const index = Math.floor((order.date.getTime() - start.getTime()) / (60 * 60 * 1000))
      if (index < 0 || index >= buckets.length) {
        continue
      }

      buckets[index].saleRevenue += order.saleRevenue
      buckets[index].rentalRevenue += order.rentalRevenue
      buckets[index].totalRevenue += order.total
      buckets[index].sales += order.saleUnits
      buckets[index].rentals += order.rentalUnits
    }

    return buckets
  }

  if (range === "7d" || range === "30d") {
    const totalDays = range === "7d" ? 7 : 30
    const start = addDays(startOfDay(now), -(totalDays - 1))
    const buckets = Array.from({ length: totalDays }, (_, index) => {
      const bucketDate = addDays(start, index)

      return {
        key: bucketDate.toISOString(),
        label: shortDateFormatter.format(bucketDate),
        saleRevenue: 0,
        rentalRevenue: 0,
        totalRevenue: 0,
        sales: 0,
        rentals: 0,
      } satisfies ChartPoint
    })

    for (const order of orders) {
      if (!order.date || order.date < start) {
        continue
      }

      const orderDay = startOfDay(order.date)
      const index = Math.floor(
        (orderDay.getTime() - start.getTime()) / (24 * 60 * 60 * 1000),
      )

      if (index < 0 || index >= buckets.length) {
        continue
      }

      buckets[index].saleRevenue += order.saleRevenue
      buckets[index].rentalRevenue += order.rentalRevenue
      buckets[index].totalRevenue += order.total
      buckets[index].sales += order.saleUnits
      buckets[index].rentals += order.rentalUnits
    }

    return buckets
  }

  const earliestDate =
    orders
      .map((order) => order.date)
      .filter((value): value is Date => value !== null)
      .sort((left, right) => left.getTime() - right.getTime())[0] ?? now

  const start = startOfMonth(earliestDate)
  const end = startOfMonth(now)
  const buckets: ChartPoint[] = []

  for (let cursor = start; cursor <= end; cursor = addMonths(cursor, 1)) {
    buckets.push({
      key: cursor.toISOString(),
      label: monthFormatter.format(cursor),
      saleRevenue: 0,
      rentalRevenue: 0,
      totalRevenue: 0,
      sales: 0,
      rentals: 0,
    })
  }

  for (const order of orders) {
    if (!order.date) {
      continue
    }

    const bucketIndex =
      (order.date.getFullYear() - start.getFullYear()) * 12 +
      (order.date.getMonth() - start.getMonth())

    if (bucketIndex < 0 || bucketIndex >= buckets.length) {
      continue
    }

    buckets[bucketIndex].saleRevenue += order.saleRevenue
    buckets[bucketIndex].rentalRevenue += order.rentalRevenue
    buckets[bucketIndex].totalRevenue += order.total
    buckets[bucketIndex].sales += order.saleUnits
    buckets[bucketIndex].rentals += order.rentalUnits
  }

  return buckets
}

function getRangeStart(range: DashboardRange, now: Date) {
  if (range === "24h") return addHours(now, -24)
  if (range === "7d") return addDays(now, -7)
  if (range === "30d") return addDays(now, -30)
  return null
}

function getSelectedView(analytics: AdminDashboardAnalytics, range: DashboardRange) {
  const now = toValidDate(analytics.generatedAt) ?? new Date()
  const start = getRangeStart(range, now)

  const selectedOrders = analytics.orders.filter((order) => {
    const createdAt = toValidDate(order.createdAt)
    return Boolean(createdAt && (!start || createdAt >= start))
  })

  const selectedQuotes = analytics.quotes.filter((quote) => {
    const createdAt = toValidDate(quote.createdAt)
    return Boolean(createdAt && (!start || createdAt >= start))
  })

  const saleRevenue = selectedOrders.reduce((sum, order) => sum + order.saleRevenue, 0)
  const rentalRevenue = selectedOrders.reduce((sum, order) => sum + order.rentalRevenue, 0)
  const totalRevenue = selectedOrders.reduce((sum, order) => sum + order.total, 0)
  const sales = selectedOrders.reduce((sum, order) => sum + order.saleUnits, 0)
  const rentals = selectedOrders.reduce((sum, order) => sum + order.rentalUnits, 0)
  const pendingOrders = selectedOrders.filter((order) =>
    ["pending", "confirmed", "processing"].includes(order.status),
  ).length
  const fulfilledOrders = selectedOrders.filter((order) =>
    ["shipped", "delivered"].includes(order.status),
  ).length
  const activeQuotes = selectedQuotes.filter((quote) =>
    ["draft", "sent", "viewed"].includes(quote.status),
  )
  const quotePipeline = activeQuotes.reduce((sum, quote) => sum + quote.total, 0)
  const avgTicket = selectedOrders.length > 0 ? totalRevenue / selectedOrders.length : 0
  const rentalShare = totalRevenue > 0 ? rentalRevenue / totalRevenue : 0

  return {
    chartData: buildChartData(analytics, range, now),
    saleRevenue,
    rentalRevenue,
    totalRevenue,
    sales,
    rentals,
    pendingOrders,
    fulfilledOrders,
    activeQuotes: activeQuotes.length,
    quotePipeline,
    avgTicket,
    rentalShare,
    selectedOrderCount: selectedOrders.length,
    selectedQuoteCount: selectedQuotes.length,
    now,
  }
}

export function AdminDashboardHome({
  analytics,
  profile,
}: {
  analytics: AdminDashboardAnalytics
  profile: ProfileWithCompany
}) {
  const [selectedRange, setSelectedRange] = React.useState<DashboardRange>("7d")
  const view = getSelectedView(analytics, selectedRange)
  const recentActivity = getActivityFeed(analytics)

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-emerald-300/20 bg-[radial-gradient(circle_at_top_right,rgba(33,186,146,0.34),transparent_34%),linear-gradient(135deg,#10151c_0%,#13201d_50%,#182229_100%)] text-background">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border border-background/18 bg-background/10 text-background">
                Pilotage admin
              </Badge>
              <Badge className="border border-emerald-300/20 bg-emerald-400/12 text-background">
                Accès {ROLE_LABELS[profile.role]}
              </Badge>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
                  Cockpit vente, location et revenu global
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-background/78">
                  Une lecture immédiate de l&apos;activité Epicap, avec une séparation nette entre
                  revenus vente et location, et une période de lecture qui se bascule sans
                  changer de page.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <PendingLinkButton
                    href="/dashboard/catalogue"
                    size="lg"
                    className="rounded-md"
                    pendingLabel="Ouverture..."
                  >
                    Ouvrir le catalogue
                    <ArrowRight className="size-4" />
                  </PendingLinkButton>
                  <PendingLinkButton
                    href="/dashboard/commandes"
                    variant="outline"
                    size="lg"
                    className="rounded-md border-background/16 bg-background/6 text-background hover:bg-background/12 hover:text-background"
                    pendingLabel="Chargement..."
                  >
                    Voir les commandes
                  </PendingLinkButton>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <HeroChip
                  icon={<Users className="size-4" />}
                  label="Comptes admin"
                  value={numberFormatter.format(analytics.adminCount)}
                  helper={`${numberFormatter.format(analytics.memberCount)} membres visibles`}
                />
                <HeroChip
                  icon={<ShoppingBag className="size-4" />}
                  label="Catalogue actif"
                  value={numberFormatter.format(analytics.catalog.activeProducts)}
                  helper={`${numberFormatter.format(analytics.catalog.rentableProducts)} refs location`}
                />
                <HeroChip
                  icon={<Clock3 className="size-4" />}
                  label="Dernière lecture"
                  value={dateTimeFormatter.format(view.now)}
                  helper="Base admin synchronisée"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Radar opérationnel</CardTitle>
            <CardDescription>
              Vue synthétique des flux qui demandent une action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <MetricRow
              icon={<ReceiptText className="size-4 text-primary" />}
              label="Commandes dans la periode"
              value={numberFormatter.format(view.selectedOrderCount)}
              helper={`${numberFormatter.format(view.pendingOrders)} en cours, ${numberFormatter.format(view.fulfilledOrders)} expédiées ou livrées`}
            />
            <MetricRow
              icon={<FileText className="size-4 text-primary" />}
              label="Devis suivis"
              value={numberFormatter.format(view.selectedQuoteCount)}
              helper={`${numberFormatter.format(view.activeQuotes)} devis encore ouverts`}
            />
            <MetricRow
              icon={<HandCoins className="size-4 text-primary" />}
              label="Pipeline devis"
              value={currencyFormatter.format(view.quotePipeline)}
              helper="Valeur cumulée des devis brouillon, envoyés ou consultés"
            />
            <MetricRow
              icon={<TrendingUp className="size-4 text-primary" />}
              label="Ticket moyen"
              value={currencyFormatter.format(view.avgTicket)}
              helper="Moyenne du panier confirme sur la periode choisie"
            />
            <MetricRow
              icon={<Truck className="size-4 text-primary" />}
              label="Part location"
              value={`${Math.round(view.rentalShare * 100)}%`}
              helper="Poids de la location dans le revenu global"
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Ventes"
          value={numberFormatter.format(view.sales)}
          helper={`${currencyFormatter.format(view.saleRevenue)} de revenu vente`}
          accent="sale"
        />
        <InsightCard
          label="Locations"
          value={numberFormatter.format(view.rentals)}
          helper={`${currencyFormatter.format(view.rentalRevenue)} de revenu location`}
          accent="rental"
        />
        <InsightCard
          label="Revenu global"
          value={currencyFormatter.format(view.totalRevenue)}
          helper="Montant cumulé des commandes de la période"
          accent="primary"
        />
        <InsightCard
          label="Sociétés"
          value={numberFormatter.format(analytics.companyCount)}
          helper={`${numberFormatter.format(analytics.orderCount)} commandes et ${numberFormatter.format(analytics.quoteCount)} devis au global`}
          accent="default"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Courbe de revenu par flux</CardTitle>
              <CardDescription>
                Vente, location et revenu global sur{" "}
                {selectedRange === "all"
                  ? "tout l'historique"
                  : `la fenêtre ${rangeOptions
                        .find((option) => option.value === selectedRange)
                        ?.label.toLowerCase()}`}
                  .
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                {rangeOptions.map((option) => {
                  const isActive = option.value === selectedRange

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => {
                        React.startTransition(() => {
                          setSelectedRange(option.value)
                        })
                      }}
                    >
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <AreaChart data={view.chartData}>
                <defs>
                  <linearGradient id="fillSaleRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-saleRevenue)" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="var(--color-saleRevenue)" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="fillRentalRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-rentalRevenue)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--color-rentalRevenue)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, item) => {
                        const payload = item.payload as ChartPoint
                        const label =
                          name === "saleRevenue"
                            ? "Revenu vente"
                            : name === "rentalRevenue"
                              ? "Revenu location"
                              : "Revenu global"

                        return (
                          <div className="flex min-w-[14rem] items-center justify-between gap-4">
                            <div>
                              <p className="font-medium">{label}</p>
                              {name === "saleRevenue" ? (
                                <p className="text-muted-foreground">
                                  {numberFormatter.format(payload.sales)} vente(s)
                                </p>
                              ) : null}
                              {name === "rentalRevenue" ? (
                                <p className="text-muted-foreground">
                                  {numberFormatter.format(payload.rentals)} location(s)
                                </p>
                              ) : null}
                            </div>
                            <span className="font-medium tabular-nums">
                              {preciseCurrencyFormatter.format(Number(value))}
                            </span>
                          </div>
                        )
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area
                  type="monotone"
                  dataKey="saleRevenue"
                  stroke="var(--color-saleRevenue)"
                  fill="url(#fillSaleRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="rentalRevenue"
                  stroke="var(--color-rentalRevenue)"
                  fill="url(#fillRentalRevenue)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="var(--color-totalRevenue)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>

            <div className="grid gap-3 md:grid-cols-3">
              <InlineStat
                label="Volume vente"
                value={numberFormatter.format(view.sales)}
                helper="Lignes vente cumulées"
                tone="sale"
              />
              <InlineStat
                label="Volume location"
                value={numberFormatter.format(view.rentals)}
                helper="Lignes location cumulées"
                tone="rental"
              />
              <InlineStat
                label="Revenu total"
                value={currencyFormatter.format(view.totalRevenue)}
                helper="Tous flux confondus"
                tone="neutral"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border-border/70 bg-card/92">
            <CardHeader className="border-b border-border/70">
            <CardTitle>Catalogue admin</CardTitle>
            <CardDescription>
              Séparation claire entre publications, brouillons et références louables.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <MetricRow
                icon={<Boxes className="size-4 text-primary" />}
                label="Références totales"
                value={numberFormatter.format(analytics.catalog.totalProducts)}
                helper={`${numberFormatter.format(analytics.catalog.activeProducts)} publiées, ${numberFormatter.format(analytics.catalog.draftProducts)} brouillons`}
              />
              <MetricRow
                icon={<Truck className="size-4 text-primary" />}
                label="Offre location"
                value={numberFormatter.format(analytics.catalog.rentableProducts)}
                helper="Produits pouvant être proposés en location"
              />
              <div className="grid gap-3 pt-1">
                <PendingLinkButton href="/dashboard/catalogue" className="rounded-md">
                  Piloter le catalogue
                  <ArrowRight className="size-4" />
                </PendingLinkButton>
                <PendingLinkButton
                  href="/dashboard/catalogue/nouveau"
                  variant="outline"
                  className="rounded-md"
                  pendingLabel="Préparation..."
                >
                  Ajouter une référence
                </PendingLinkButton>
                </div>
              </CardContent>
            </Card>

          <SentryIssuesCard />

          <Card className="border-border/70 bg-card/92">
            <CardHeader className="border-b border-border/70">
              <CardTitle>Flux récents</CardTitle>
              <CardDescription>
                Les dernières commandes et devis remontés dans le cockpit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {recentActivity.length === 0 ? (
                <EmptyBlock message="Aucune activité commerciale n'est encore disponible." />
              ) : (
                recentActivity.slice(0, 6).map((item) => (
                  <ActivityRow key={`${item.kind}-${item.id}`} item={item} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>
              Les derniers dossiers de commandes visibles par le rôle admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {analytics.orders.length === 0 ? (
              <EmptyBlock message="Aucune commande n'a encore été enregistrée." />
            ) : (
              analytics.orders.slice(0, 5).map((order) => (
                <OrderRow
                  key={order.id}
                  reference={order.orderNumber ?? "Commande sans numéro"}
                  company={order.companyName ?? order.contactName ?? "Compte Epicap"}
                  status={ORDER_STATUS_LABELS[order.status]}
                  amount={order.total}
                  detail={`${numberFormatter.format(order.saleUnits)} vente(s) / ${numberFormatter.format(order.rentalUnits)} location(s)`}
                  createdAt={order.createdAt}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Devis récents</CardTitle>
            <CardDescription>
              Un aperçu rapide du pipeline commercial encore ouvert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {analytics.quotes.length === 0 ? (
              <EmptyBlock message="Aucun devis n'a encore été saisi." />
            ) : (
              analytics.quotes.slice(0, 5).map((quote) => (
                <OrderRow
                  key={quote.id}
                  reference={quote.quoteNumber ?? "Devis sans numéro"}
                  company={quote.companyName ?? quote.contactName ?? "Compte Epicap"}
                  status={QUOTE_STATUS_LABELS[quote.status]}
                  amount={quote.total}
                  detail={`${numberFormatter.format(quote.saleUnits)} vente(s) / ${numberFormatter.format(quote.rentalUnits)} location(s)`}
                  createdAt={quote.createdAt}
                />
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function HeroChip({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-background/12 bg-background/8 p-4">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-background/66">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-background">{value}</p>
      <p className="mt-2 text-sm leading-6 text-background/72">{helper}</p>
    </div>
  )
}

function InsightCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string
  value: string
  helper: string
  accent: "sale" | "rental" | "primary" | "default"
}) {
  const topBarClass =
    accent === "sale"
      ? "bg-[linear-gradient(90deg,#ff8f3d,#ffb067)]"
      : accent === "rental"
        ? "bg-[linear-gradient(90deg,#18b49c,#47d6c0)]"
        : accent === "primary"
          ? "bg-[linear-gradient(90deg,#111827,#475569)]"
          : "bg-border/70"

  const cardClass =
    accent === "sale"
      ? "border-orange-300/30 bg-[linear-gradient(180deg,rgba(255,143,61,0.08),rgba(255,255,255,0))]"
      : accent === "rental"
        ? "border-emerald-300/30 bg-[linear-gradient(180deg,rgba(24,180,156,0.08),rgba(255,255,255,0))]"
        : accent === "primary"
          ? "border-slate-300/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.05),rgba(255,255,255,0))]"
          : "border-border/70 bg-card/92"

  return (
    <Card className={`overflow-hidden shadow-[0_22px_52px_-42px_rgba(15,16,18,0.28)] ${cardClass}`}>
      <CardContent className="p-0">
        <div className={`h-1 w-full ${topBarClass}`} />
        <div className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/80">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricRow({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-primary/12">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm font-semibold">{value}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
      </div>
    </div>
  )
}

function InlineStat({
  label,
  value,
  helper,
  tone,
}: {
  label: string
  value: string
  helper: string
  tone: "sale" | "rental" | "neutral"
}) {
  const wrapperClass =
    tone === "sale"
      ? "border-orange-300/25 bg-orange-50/60"
      : tone === "rental"
        ? "border-emerald-300/25 bg-emerald-50/60"
        : "border-border/70 bg-muted/20"

  return (
    <div className={`rounded-[1.1rem] border p-4 ${wrapperClass}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
    </div>
  )
}

function ActivityRow({
  item,
}: {
  item: DashboardActivity
}) {
  const createdAt = toValidDate(item.createdAt)

  return (
    <div className="rounded-[1.15rem] border border-border/70 bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
              {item.kind === "order" ? (
                <ReceiptText className="size-4" />
              ) : (
                <LayoutPanelLeft className="size-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{item.reference}</p>
              <p className="text-xs text-muted-foreground">{item.contact}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{item.status}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{currencyFormatter.format(item.amount)}</p>
          <p className="text-xs text-muted-foreground">
            {createdAt ? shortDateFormatter.format(createdAt) : "-"}
          </p>
        </div>
      </div>
    </div>
  )
}

function OrderRow({
  reference,
  company,
  status,
  amount,
  detail,
  createdAt,
}: {
  reference: string
  company: string
  status: string
  amount: number
  detail: string
  createdAt: string
}) {
  const parsedDate = toValidDate(createdAt)

  return (
    <div className="rounded-[1.2rem] border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{reference}</p>
          <p className="mt-1 text-sm text-muted-foreground">{company}</p>
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-primary/80">
            {status}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-semibold">{currencyFormatter.format(amount)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsedDate ? dateTimeFormatter.format(parsedDate) : "-"}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
