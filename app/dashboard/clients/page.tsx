import { getCompanySummaries, getTeamProfiles } from "@/lib/auth/dashboard"
import { requireRole } from "@/lib/auth/server"
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

export default async function DashboardClientsPage() {
  await requireRole(["admin", "super_admin"], "/dashboard/clients")
  const [companies, profiles] = await Promise.all([
    getCompanySummaries(),
    getTeamProfiles(),
  ])

  const unassignedProfiles = profiles.filter(
    (profile) => !profile.company_id && Boolean(profile.company_name),
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Sociétés" value={String(companies.length)} helper="Comptes B2B créés dans Supabase." />
        <MetricCard
          label="Profils non rattachés"
          value={String(unassignedProfiles.length)}
          helper="Comptes membres avec société texte mais sans relation formelle."
        />
        <MetricCard
          label="Admins rattachés"
          value={String(companies.reduce((sum, company) => sum + company.adminCount, 0))}
          helper="Comptes admin ou super admin associés à une société."
        />
      </section>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Portefeuille sociétés</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {companies.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Aucune société n’a encore été créée côté Supabase.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {companies.map((company) => (
                <Card key={company.id} className="border-border/70 bg-muted/20">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold">{company.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {company.email ?? company.phone ?? "Aucun contact principal"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {company.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoChip label="Membres" value={String(company.memberCount)} />
                      <InfoChip label="Admins" value={String(company.adminCount)} />
                      <InfoChip label="Conditions" value={company.payment_terms} />
                      <InfoChip
                        label="Remise"
                        value={`${Number(company.discount_percentage).toFixed(0)}%`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Profils à rattacher</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {unassignedProfiles.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Aucun profil en attente de rattachement société.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Société déclarée</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {[profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email}
                    </TableCell>
                    <TableCell>{profile.company_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{profile.role}</Badge>
                    </TableCell>
                    <TableCell>{profile.phone ?? profile.email ?? "Non renseigné"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper: string
}) {
  return (
    <Card className="border-border/70 bg-card/92">
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  )
}

function InfoChip({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.1rem] border border-border/70 bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  )
}
