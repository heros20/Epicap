import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getOrdersForDashboard } from "@/lib/auth/dashboard"
import { requireProfile } from "@/lib/auth/server"
import { ORDER_STATUS_LABELS, isAdminRole } from "@/lib/auth/types"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

export default async function DashboardOrdersPage() {
  const { user, profile } = await requireProfile("/dashboard/commandes")
  const orders = await getOrdersForDashboard(profile, user.id)
  const adminMode = isAdminRole(profile.role)

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <CardTitle>{adminMode ? "Commandes plateforme" : "Mes commandes"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {orders.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            Aucune commande n’est encore disponible dans cet espace.
          </div>
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
                        {adminMode
                          ? order.company_name ?? order.contact_email ?? "Sans société"
                          : order.contact_email ?? order.company_name ?? "Sans email"}
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
