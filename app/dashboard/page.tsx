import Link from "next/link"
import type { ReactNode } from "react"
import {
  AlertTriangle,
  ArrowRight,
  FileText,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react"

import { AdminDashboardHome } from "@/components/dashboard/admin-dashboard-home"
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getAdminDashboardAnalytics,
  getDashboardOverview,
} from "@/lib/auth/dashboard"
import { requireProfile } from "@/lib/auth/server"
import {
  ORDER_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  ROLE_LABELS,
  isAdminRole,
} from "@/lib/auth/types"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

export default async function DashboardHomePage() {
  const { user, profile } = await requireProfile("/dashboard")
  const adminMode = isAdminRole(profile.role)

  if (adminMode) {
    const analytics = await getAdminDashboardAnalytics()
    return <AdminDashboardHome analytics={analytics} profile={profile} />
  }

  const overview = await getDashboardOverview(profile, user.id)

  const headline = "Suivi de votre relation Epicap"
  const supportingText =
    "Espace client pour suivre vos demandes, verifier votre profil et avancer plus vite sur vos futurs achats ou devis."

  const alerts: Array<{
    tone: "warning" | "ok"
    title: string
    detail: string
  }> = []

  if (!profile.company && !profile.company_name) {
    alerts.push({
      tone: "warning",
      title: "Compte sans societe rattachee",
      detail: "Completez votre profil pour fiabiliser le contexte B2B et les futurs parcours commande/devis.",
    })
  }

  if (overview.pendingOrderCount > 0) {
    alerts.push({
      tone: "warning",
      title: `${overview.pendingOrderCount} commande(s) a suivre`,
      detail: "Votre espace contient des commandes encore en cours de traitement.",
    })
  }

  if (overview.activeQuoteCount > 0) {
    alerts.push({
      tone: "warning",
      title: `${overview.activeQuoteCount} devis actif(s)`,
      detail: "Des devis sont encore ouverts et meritent un suivi commercial.",
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      tone: "ok",
      title: "Aucune alerte majeure",
      detail: "La configuration actuelle est saine pour continuer le deploiement du back-office Epicap.",
    })
  }

  const statCards = [
    {
      label: "Mes commandes",
      value: String(overview.orderCount),
      helper: "Historique relie a votre compte Epicap.",
      accent: "primary" as const,
    },
    {
      label: "Mes devis",
      value: String(overview.quoteCount),
      helper: "Demandes envoyees ou en attente de retour.",
      accent: overview.activeQuoteCount > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Rattachement",
      value: profile.company?.name ?? profile.company_name ?? "Aucun",
      helper: "Societe actuellement associee au compte.",
      accent: "default" as const,
    },
    {
      label: "Commandes en cours",
      value: String(overview.pendingOrderCount),
      helper: "Flux encore en attente ou en preparation.",
      accent: overview.pendingOrderCount > 0 ? ("warning" as const) : ("default" as const),
    },
  ]

  const heroMetrics = [
    {
      label: "Profil",
      value: ROLE_LABELS[profile.role],
      helper: "Niveau d'acces actuel",
    },
    {
      label: "Devis",
      value: String(overview.quoteCount),
      helper: "Demandes disponibles",
    },
    {
      label: "Rattachement",
      value: profile.company?.name ?? profile.company_name ?? "A renseigner",
      helper: "Contexte societaire",
    },
  ]

  const quickActions = [
    {
      href: "/dashboard/profil",
      title: "Mettre a jour le profil",
      description: "Coordonnees, societe et preferences email.",
      priority: !profile.company && !profile.company_name,
      icon: <UserRound className="size-4" />,
    },
    {
      href: "/dashboard/commandes",
      title: "Consulter les commandes",
      description: "Historique, montants et statuts de traitement.",
      priority: overview.pendingOrderCount > 0,
      icon: <ReceiptText className="size-4" />,
    },
    {
      href: "/dashboard/devis",
      title: "Suivre les devis",
      description: "Pipeline commercial et demandes ouvertes.",
      priority: overview.activeQuoteCount > 0,
      icon: <FileText className="size-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.18),transparent_32%),linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
          <CardContent className="p-8">
            <Badge className="border border-primary/20 bg-primary/20 text-background">
              Vue operationnelle
            </Badge>
            <h2 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl">
              {headline}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-background/74">
              {supportingText}
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {heroMetrics.map((metric) => (
                <FocusChip
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                  helper={metric.helper}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard/commandes">
                  Ouvrir les commandes
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-background/16 bg-background/6 text-background hover:bg-background/12 hover:text-background"
              >
                <Link href="/dashboard/devis">Voir mes devis</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                <AlertTriangle className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>Points de vigilance</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Priorites immediates pour un dashboard plus utile et exploitable.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {alerts.map((alert, index) => (
              <AlertItem
                key={`${alert.title}-${index}`}
                tone={alert.tone}
                title={alert.title}
                detail={alert.detail}
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            accent={card.accent}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                <ShieldCheck className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>Acces rapides</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Raccourcis pour avancer plus vite dans votre espace Epicap.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            {quickActions.map((action) => (
              <QuickAction
                key={action.href}
                href={action.href}
                title={action.title}
                description={action.description}
                priority={action.priority}
                icon={action.icon}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Etat du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <StateRow label="Role" value={ROLE_LABELS[profile.role]} />
            <StateRow
              label="Portee"
              value="Vue personnelle"
            />
            <StateRow
              label="Societe"
              value={profile.company?.name ?? profile.company_name ?? "Non renseignee"}
            />
            <StateRow
              label="Notifications"
              value={profile.email_notifications ? "Activees" : "Desactivees"}
            />
            <StateRow
              label="Statut"
              value={profile.is_active ? "Actif" : "Desactive"}
            />
            <div className="rounded-[1.2rem] border border-primary/20 bg-primary/8 p-4 text-sm leading-6 text-muted-foreground">
              Cet espace client centralise votre profil, vos commandes et vos demandes ouvertes.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActivityCard
          title="Commandes recentes"
          icon={<ShoppingBag className="size-5 text-primary" />}
          ctaHref="/dashboard/commandes"
          ctaLabel="Voir les commandes"
          emptyMessage="Aucune commande n'a encore ete enregistree."
          rows={overview.recentOrders.map((order) => ({
            id: order.id,
            title: order.order_number ?? "Commande sans numero",
            subtitle: order.company_name ?? order.contact_name ?? "Compte Epicap",
            meta: ORDER_STATUS_LABELS[order.status],
            amount: currencyFormatter.format(order.total),
            date: dateFormatter.format(new Date(order.created_at)),
          }))}
        />

        <ActivityCard
          title="Devis recents"
          icon={<FileText className="size-5 text-primary" />}
          ctaHref="/dashboard/devis"
          ctaLabel="Voir les devis"
          emptyMessage="Aucun devis n'a encore ete saisi."
          rows={overview.recentQuotes.map((quote) => ({
            id: quote.id,
            title: quote.quote_number ?? "Devis sans numero",
            subtitle: quote.company_name ?? quote.contact_name ?? "Compte Epicap",
            meta: QUOTE_STATUS_LABELS[quote.status],
            amount: currencyFormatter.format(quote.total),
            date: dateFormatter.format(new Date(quote.created_at)),
          }))}
        />
      </section>
    </div>
  )
}

function ActivityCard({
  title,
  icon,
  ctaHref,
  ctaLabel,
  emptyMessage,
  rows,
}: {
  title: string
  icon: ReactNode
  ctaHref: string
  ctaLabel: string
  emptyMessage: string
  rows: Array<{
    id: string
    title: string
    subtitle: string
    meta: string
    amount: string
    date: string
  }>
}) {
  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {rows.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-col gap-3 rounded-[1.25rem] border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{row.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{row.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{row.meta}</Badge>
                <div className="text-right">
                  <p className="text-sm font-semibold">{row.amount}</p>
                  <p className="text-xs text-muted-foreground">{row.date}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function FocusChip({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-background/12 bg-background/6 p-4 backdrop-blur-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-background">{value}</p>
      <p className="mt-2 text-sm leading-6 text-background/72">{helper}</p>
    </div>
  )
}

function AlertItem({
  tone,
  title,
  detail,
}: {
  tone: "warning" | "ok"
  title: string
  detail: string
}) {
  return (
    <div
      className={`rounded-[1.2rem] border p-4 ${
        tone === "warning"
          ? "border-amber-300/30 bg-amber-50/70"
          : "border-emerald-300/30 bg-emerald-50/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex size-9 items-center justify-center rounded-xl ${
            tone === "warning"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {tone === "warning" ? (
            <AlertTriangle className="size-4" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  title,
  description,
  priority,
  icon,
}: {
  href: string
  title: string
  description: string
  priority?: boolean
  icon: ReactNode
}) {
  return (
    <Link
      href={href}
      className={`rounded-[1.25rem] border p-4 transition-all ${
        priority
          ? "border-primary/24 bg-[linear-gradient(135deg,rgba(255,133,28,0.10),rgba(255,255,255,0))] hover:border-primary/40 hover:bg-primary/8"
          : "border-border/70 bg-muted/22 hover:border-primary/30 hover:bg-primary/6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
          {icon}
        </div>
      </div>
    </Link>
  )
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}
