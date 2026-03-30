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
import { getQuotesForDashboard } from "@/lib/auth/dashboard"
import { requireProfile } from "@/lib/auth/server"
import { QUOTE_STATUS_LABELS, isAdminRole } from "@/lib/auth/types"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

export default async function DashboardQuotesPage() {
  const { user, profile } = await requireProfile("/dashboard/devis")
  const quotes = await getQuotesForDashboard(profile, user.id)
  const adminMode = isAdminRole(profile.role)

  return (
    <Card className="border-border/70 bg-card/92">
      <CardHeader className="border-b border-border/70">
        <CardTitle>{adminMode ? "Devis plateforme" : "Mes devis"}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {quotes.length === 0 ? (
          <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            Aucun devis n’est encore disponible dans cet espace.
          </div>
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
                        {adminMode
                          ? quote.company_name ?? quote.contact_email ?? "Sans société"
                          : quote.contact_email ?? quote.company_name ?? "Sans email"}
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
