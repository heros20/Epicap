import type { ReactNode } from "react"

import { updateMyProfileAction } from "@/lib/auth/actions"
import { requireProfile } from "@/lib/auth/server"
import { ROLE_LABELS } from "@/lib/auth/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function DashboardProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const success = pickFirstValue(params.success)
  const { user, profile } = await requireProfile("/dashboard/profil")

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Informations du compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            {profile.company?.name || profile.company_name ? (
              <Badge variant="outline">{profile.company?.name ?? profile.company_name}</Badge>
            ) : null}
          </div>
          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}

          <form action={updateMyProfileAction} className="grid gap-5 lg:grid-cols-2">
            <Field label="Prénom" htmlFor="firstName">
              <Input id="firstName" name="firstName" defaultValue={profile.first_name ?? ""} required />
            </Field>
            <Field label="Nom" htmlFor="lastName">
              <Input id="lastName" name="lastName" defaultValue={profile.last_name ?? ""} required />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" value={user.email ?? ""} readOnly disabled />
            </Field>
            <Field label="Téléphone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
            </Field>
            <Field label="Fonction" htmlFor="jobTitle">
              <Input id="jobTitle" name="jobTitle" defaultValue={profile.job_title ?? ""} />
            </Field>
            <Field label="Société" htmlFor="companyName">
              <Input
                id="companyName"
                name="companyName"
                defaultValue={profile.company?.name ?? profile.company_name ?? ""}
              />
            </Field>
            <div className="lg:col-span-2">
              <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  defaultChecked={profile.email_notifications}
                  className="size-4 rounded border-border"
                />
                Recevoir les notifications email liées au compte et au dashboard.
              </label>
            </div>
            <div className="lg:col-span-2">
              <Button type="submit" size="lg">
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
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
