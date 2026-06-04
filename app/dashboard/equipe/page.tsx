import { adminUpdateProfileAction } from "@/lib/auth/actions"
import { getCompanySummaries, getTeamProfiles } from "@/lib/auth/dashboard"
import { requireRole } from "@/lib/auth/server"
import { getProfileDisplayName, ROLE_LABELS } from "@/lib/auth/types"
import { AdminSubmitButton } from "@/components/dashboard/admin-submit-button"
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

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

export default async function DashboardTeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const success = pickFirstValue(params.success)
  const { profile } = await requireRole(["admin", "super_admin"], "/dashboard/equipe")
  const [teamProfiles, companies] = await Promise.all([
    getTeamProfiles(),
    getCompanySummaries(),
  ])
  const canEditRoles = profile.role === "super_admin"

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Gouvernance des comptes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{teamProfiles.length} profils visibles</Badge>
            <Badge variant="outline">{companies.length} sociétés rattachables</Badge>
            <Badge variant="outline">
              {canEditRoles ? "Mode super admin actif" : "Mode lecture admin"}
            </Badge>
          </div>
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
          <div className="rounded-[1.25rem] border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Les admins lisent l’ensemble des profils. Seuls les super admins peuvent modifier les
            rôles ou désactiver un compte.
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Utilisateurs et rôles</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {teamProfiles.length === 0 ? (
            <div className="rounded-[1.25rem] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
              Aucun profil n’a encore été créé.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Société</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="w-[320px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamProfiles.map((member) => {
                  const displayName = getProfileDisplayName(member, member.email)
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{displayName}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{member.company?.name ?? member.company_name ?? "Non rattaché"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ROLE_LABELS[member.role]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? "secondary" : "outline"}>
                          {member.is_active ? "Actif" : "Désactivé"}
                        </Badge>
                      </TableCell>
                      <TableCell>{dateFormatter.format(new Date(member.created_at))}</TableCell>
                      <TableCell>
                        {canEditRoles ? (
                          <form action={adminUpdateProfileAction} className="grid gap-2 sm:grid-cols-3">
                            <input type="hidden" name="targetUserId" value={member.id} />
                            <select
                              name="role"
                              defaultValue={member.role}
                              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                            >
                              <option value="member">Membre</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super admin</option>
                            </select>
                            <select
                              name="isActive"
                              defaultValue={member.is_active ? "true" : "false"}
                              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                            >
                              <option value="true">Actif</option>
                              <option value="false">Désactivé</option>
                            </select>
                            <select
                              name="companyId"
                              defaultValue={member.company_id ?? ""}
                              className="h-10 rounded-xl border border-input bg-background px-3 text-sm sm:col-span-2"
                            >
                              <option value="">Conserver le rattachement actuel</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.name}
                                </option>
                              ))}
                            </select>
                            <AdminSubmitButton variant="outline" className="sm:col-span-1">
                              Enregistrer
                            </AdminSubmitButton>
                          </form>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Vue admin seulement.
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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
