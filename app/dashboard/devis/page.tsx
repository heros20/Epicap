import { AdminSubmitButton } from "@/components/dashboard/admin-submit-button"
import { RequestListControls } from "@/components/dashboard/request-list-controls"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  getPaginatedQuotesForDashboard,
  type DashboardListSort,
  type DashboardQuoteItem,
  type DashboardQuoteRecord,
} from "@/lib/auth/dashboard"
import { requireProfile } from "@/lib/auth/server"
import { QUOTE_STATUS_LABELS, isAdminRole, type QuoteStatus } from "@/lib/auth/types"
import { updateDashboardQuoteAction } from "@/lib/dashboard/request-admin-actions"
import type { Json } from "@/types/supabase"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
})

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parsePositiveInteger(value: string | string[] | undefined) {
  const parsed = Number(pickFirstValue(value))
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function parseSort(value: string | string[] | undefined): DashboardListSort {
  return pickFirstValue(value) === "oldest" ? "oldest" : "recent"
}

function parseQuoteStatus(value: string | string[] | undefined): QuoteStatus | undefined {
  const status = pickFirstValue(value)
  return status && status in QUOTE_STATUS_LABELS ? (status as QuoteStatus) : undefined
}

function asRecord(value: Json | null | undefined) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function readMetadataValue(metadata: Json | null | undefined, key: string) {
  const record = asRecord(metadata)
  const value = record?.[key]
  return typeof value === "string" ? value : null
}

function isSageQuoteRequest(metadata: Json | null | undefined) {
  return (
    readMetadataValue(metadata, "type") === "quote_request" &&
    readMetadataValue(metadata, "processingMode") === "sage"
  )
}

export default async function DashboardQuotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const success = pickFirstValue(params.success)
  const page = parsePositiveInteger(params.page) ?? 1
  const sort = parseSort(params.sort)
  const year = parsePositiveInteger(params.year)
  const status = parseQuoteStatus(params.status)
  const { user, profile } = await requireProfile("/dashboard/devis")
  const quotesList = await getPaginatedQuotesForDashboard(profile, user.id, {
    page,
    sort,
    year,
    status,
  })
  const quotes = quotesList.items
  const adminMode = isAdminRole(profile.role)

  if (!adminMode) {
    return (
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Mes devis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
          <RequestListControls
            basePath="/dashboard/devis"
            itemLabel="devis"
            totalCount={quotesList.totalCount}
            page={quotesList.page}
            pageCount={quotesList.pageCount}
            sort={quotesList.sort}
            year={quotesList.year}
            years={quotesList.years}
            status={quotesList.status}
            statusCounts={quotesList.statusCounts}
            statusLabels={QUOTE_STATUS_LABELS}
          />
          {quotes.length === 0 ? (
            <EmptyState message="Aucun devis n'est encore disponible dans cet espace." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Devis</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Créé le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">
                      {quote.quote_number ?? "Sans numéro"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{quote.contact_name ?? "Compte Epicap"}</p>
                        <p className="text-xs text-muted-foreground">
                          {quote.contact_email ?? quote.company_name ?? "Sans email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{QUOTE_STATUS_LABELS[quote.status]}</Badge>
                    </TableCell>
                    <TableCell>{currencyFormatter.format(quote.total)}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(quote.created_at))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Gestion des devis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Les demandes de devis sont notifiées par e-mail à Epicap et restent visibles ici pour
            le suivi. Le chiffrage final est traité par l&apos;équipe Epicap.
          </p>
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
        </CardContent>
      </Card>

      <RequestListControls
        basePath="/dashboard/devis"
        itemLabel="devis"
        totalCount={quotesList.totalCount}
        page={quotesList.page}
        pageCount={quotesList.pageCount}
        sort={quotesList.sort}
        year={quotesList.year}
        years={quotesList.years}
        status={quotesList.status}
        statusCounts={quotesList.statusCounts}
        statusLabels={QUOTE_STATUS_LABELS}
      />

      {quotes.length === 0 ? (
        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-6">
            <EmptyState message="Aucun devis n'est encore disponible dans cet espace." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {quotes.map((quote) => (
            <AdminQuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminQuoteCard({ quote }: { quote: DashboardQuoteRecord }) {
  const customerType = readMetadataValue(quote.metadata, "customerType")
  const requestType = readMetadataValue(quote.metadata, "requestType")
  const notificationEmail = readMetadataValue(quote.metadata, "notificationEmail")
  const sageRequest = isSageQuoteRequest(quote.metadata)

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle>{quote.quote_number ?? "Sans numéro"}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {sageRequest && quote.status === "sent"
                  ? "Demande transmise"
                  : QUOTE_STATUS_LABELS[quote.status]}
              </Badge>
              {sageRequest ? <Badge variant="outline">Traitement interne</Badge> : null}
              {customerType ? (
                <Badge variant="outline">
                  {customerType === "individual" ? "Particulier" : "Entreprise"}
                </Badge>
              ) : null}
              {requestType ? <Badge variant="outline">{requestType}</Badge> : null}
              {quote.valid_until ? (
                <Badge variant="outline">
                  Valide jusqu&apos;au {quote.valid_until.slice(0, 10)}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {quote.contact_name ?? "Compte Epicap"} -{" "}
              {quote.company_name ?? quote.contact_email ?? "Sans société"} -{" "}
              {dateFormatter.format(new Date(quote.created_at))}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Total devis
            </p>
            <p className="mt-2 text-lg font-semibold">{currencyFormatter.format(quote.total)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard title="Coordonnées">
              <InfoGrid
                items={[
                  ["Contact", quote.contact_name ?? "Compte Epicap"],
                  ["Email", quote.contact_email ?? "Sans email"],
                  ["Société", quote.company_name ?? "Sans société"],
                  ["Validité", quote.valid_until ? quote.valid_until.slice(0, 10) : "À définir"],
                ]}
              />
            </SectionCard>

            {sageRequest ? (
              <SectionCard title="Transmission Epicap">
                <InfoGrid
                  items={[
                    ["Parcours", "Demande envoyée par e-mail"],
                    ["Destinataire", notificationEmail ?? "herosqwerty@gmail.com"],
                    ["Traitement", "Chiffrage et suivi interne"],
                    ["Confirmation", "Demande présente dans le tableau de bord"],
                  ]}
                />
              </SectionCard>
            ) : null}

            <SectionCard title="Lignes du devis">
              {quote.quote_items?.length ? (
                <div className="space-y-3">
                  {quote.quote_items.map((item) => (
                    <QuoteItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune ligne détaillée.</p>
              )}
            </SectionCard>

            <SectionCard title="Besoin client">
              <p className="text-sm leading-6 text-muted-foreground">
                {quote.notes ?? "Aucune note client transmise."}
              </p>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Suivi interne">
              <form
                action={updateDashboardQuoteAction}
                className="grid gap-4 rounded-[1rem] border border-border/70 bg-muted/20 p-4"
              >
                <input type="hidden" name="quoteId" value={quote.id} />
                <AdminField label="État du devis" htmlFor={`status-${quote.id}`}>
                  <select
                    id={`status-${quote.id}`}
                    name="status"
                    defaultValue={quote.status}
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Note de suivi" htmlFor={`internal-notes-${quote.id}`}>
                  <Textarea
                    id={`internal-notes-${quote.id}`}
                    name="internalNotes"
                    defaultValue={quote.internal_notes ?? ""}
                    className="min-h-24"
                    placeholder="Relance, précision client, prochaine action..."
                  />
                </AdminField>
                <AdminSubmitButton>Mettre à jour</AdminSubmitButton>
              </form>
            </SectionCard>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuoteItemCard({ item }: { item: DashboardQuoteItem }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-muted-foreground">{item.sku}</p>
          {item.description ? (
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <p>
            {item.is_rental
              ? `Location x${item.quantity} - ${item.rental_days ?? 1} j`
              : `Vente x${item.quantity}`}
          </p>
          <p>{currencyFormatter.format(item.total_price)}</p>
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 text-sm font-medium">{value}</p>
        </div>
      ))}
    </div>
  )
}

function AdminField({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function MessageBox({
  tone,
  message,
}: {
  tone: "error" | "success"
  message: string
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-destructive/20 bg-destructive/6 text-destructive"
          : "border-success/20 bg-success/8 text-success"
      }`}
    >
      {message}
    </div>
  )
}
