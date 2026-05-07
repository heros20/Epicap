import { AdminSubmitButton } from "@/components/dashboard/admin-submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  getOrdersForDashboard,
  type DashboardOrderItem,
  type DashboardOrderRecord,
} from "@/lib/auth/dashboard"
import { requireProfile } from "@/lib/auth/server"
import { ORDER_STATUS_LABELS, isAdminRole, type Order } from "@/lib/auth/types"
import { updateDashboardOrderAction } from "@/lib/dashboard/request-admin-actions"
import type { Json } from "@/types/supabase"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
})

const paymentStatusLabels: Record<Order["payment_status"], string> = {
  pending: "En attente",
  paid: "Réglé",
  failed: "Échec",
  refunded: "Remboursé",
  partial: "Partiel",
}

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
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

function formatAddress(address: Json | null | undefined) {
  const record = asRecord(address)
  if (!record) {
    return []
  }

  const street = typeof record.street === "string" ? record.street : null
  const postalCode = typeof record.postalCode === "string" ? record.postalCode : null
  const city = typeof record.city === "string" ? record.city : null
  const country = typeof record.country === "string" ? record.country : null

  return [
    street,
    [postalCode, city].filter(Boolean).join(" ").trim() || null,
    country,
  ].filter((value): value is string => Boolean(value))
}

export default async function DashboardOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const success = pickFirstValue(params.success)
  const { user, profile } = await requireProfile("/dashboard/commandes")
  const orders = await getOrdersForDashboard(profile, user.id)
  const adminMode = isAdminRole(profile.role)

  if (!adminMode) {
    return (
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Mes commandes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
          {orders.length === 0 ? (
            <EmptyState message="Aucune commande n'est encore disponible dans cet espace." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Créée le</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_number ?? "Sans numéro"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p>{order.contact_name ?? "Compte Epicap"}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.contact_email ?? order.company_name ?? "Sans email"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
                    </TableCell>
                    <TableCell>{currencyFormatter.format(order.total)}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(order.created_at))}</TableCell>
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
          <CardTitle>Gestion des commandes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Les commandes peuvent être pilotées depuis l&apos;admin : statut, paiement,
            logistique, suivi transport et notes internes.
          </p>
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <Card className="border-border/70 bg-card/92">
          <CardContent className="p-6">
            <EmptyState message="Aucune commande n'est encore disponible dans cet espace." />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

function AdminOrderCard({ order }: { order: DashboardOrderRecord }) {
  const customerType = readMetadataValue(order.metadata, "customerType")
  const requestType = readMetadataValue(order.metadata, "requestType")
  const billingAddress = formatAddress(order.billing_address)
  const shippingAddress = formatAddress(order.shipping_address)

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <CardTitle>{order.order_number ?? "Sans numéro"}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status]}</Badge>
              <Badge variant="outline">{paymentStatusLabels[order.payment_status]}</Badge>
              {customerType ? (
                <Badge variant="outline">
                  {customerType === "individual" ? "Particulier" : "Entreprise"}
                </Badge>
              ) : null}
              {requestType ? <Badge variant="outline">{requestType}</Badge> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {order.contact_name ?? "Compte Epicap"} -{" "}
              {order.company_name ?? order.contact_email ?? "Sans société"} -{" "}
              {dateFormatter.format(new Date(order.created_at))}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Total commande
            </p>
            <p className="mt-2 text-lg font-semibold">{currencyFormatter.format(order.total)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <SectionCard title="Coordonnées">
              <InfoGrid
                items={[
                  ["Contact", order.contact_name ?? "Compte Epicap"],
                  ["Email", order.contact_email ?? "Sans email"],
                  ["Société", order.company_name ?? "Sans société"],
                  ["Paiement", paymentStatusLabels[order.payment_status]],
                ]}
              />
            </SectionCard>

            <SectionCard title="Lignes de commande">
              {order.order_items?.length ? (
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <OrderItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune ligne détaillée.</p>
              )}
            </SectionCard>

            <SectionCard title="Notes client">
              <p className="text-sm leading-6 text-muted-foreground">
                {order.notes ?? "Aucune note client transmise."}
              </p>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Adresses">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <AddressBlock title="Facturation" lines={billingAddress} />
                <AddressBlock title="Livraison" lines={shippingAddress} />
              </div>
            </SectionCard>

            <SectionCard title="Mise à jour admin">
              <form action={updateDashboardOrderAction} className="grid gap-4">
                <input type="hidden" name="orderId" value={order.id} />
                <AdminField label="Statut" htmlFor={`status-${order.id}`}>
                  <select
                    id={`status-${order.id}`}
                    name="status"
                    defaultValue={order.status}
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Paiement" htmlFor={`payment-status-${order.id}`}>
                  <select
                    id={`payment-status-${order.id}`}
                    name="paymentStatus"
                    defaultValue={order.payment_status}
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {Object.entries(paymentStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="Mode de règlement" htmlFor={`payment-method-${order.id}`}>
                  <Input
                    id={`payment-method-${order.id}`}
                    name="paymentMethod"
                    defaultValue={order.payment_method ?? ""}
                    placeholder="Virement, compte client..."
                  />
                </AdminField>
                <AdminField label="Mode de livraison" htmlFor={`shipping-method-${order.id}`}>
                  <Input
                    id={`shipping-method-${order.id}`}
                    name="shippingMethod"
                    defaultValue={order.shipping_method ?? ""}
                    placeholder="Livraison standard, retrait agence..."
                  />
                </AdminField>
                <AdminField label="Suivi transport" htmlFor={`tracking-${order.id}`}>
                  <Input
                    id={`tracking-${order.id}`}
                    name="trackingNumber"
                    defaultValue={order.tracking_number ?? ""}
                    placeholder="Numéro de suivi"
                  />
                </AdminField>
                <AdminField label="Notes internes" htmlFor={`internal-notes-${order.id}`}>
                  <Textarea
                    id={`internal-notes-${order.id}`}
                    name="internalNotes"
                    defaultValue={order.internal_notes ?? ""}
                    className="min-h-28"
                    placeholder="Commentaire interne, relance, arbitrage commercial..."
                  />
                </AdminField>
                <AdminSubmitButton>Enregistrer la commande</AdminSubmitButton>
              </form>
            </SectionCard>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OrderItemCard({ item }: { item: DashboardOrderItem }) {
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

function AddressBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      {lines.length > 0 ? (
        <div className="mt-3 space-y-1 text-sm">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Non renseignée.</p>
      )}
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
