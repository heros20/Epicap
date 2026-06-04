import type { ReactNode } from "react"

import { AuthProvider } from "@/components/auth/auth-provider"
import { DashboardActionFeedback } from "@/components/dashboard/dashboard-action-feedback"
import {
  DashboardMobileNavigation,
  DashboardSidebar,
} from "@/components/dashboard/dashboard-sidebar"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  ROLE_LABELS,
  getProfileDisplayName,
  isAdminRole,
  type AuthUser,
  type ProfileWithCompany,
} from "@/lib/auth/types"

export function DashboardShell({
  user,
  profile,
  children,
}: {
  user: AuthUser
  profile: ProfileWithCompany
  children: ReactNode
}) {
  const adminMode = isAdminRole(profile.role)

  if (adminMode) {
    return (
      <AuthProvider initialUser={user} initialProfile={profile}>
        <div className="flex min-h-screen flex-col bg-slate-50">
          <Header />
          <main className="flex-1 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%,#f8fafc_100%)]">
            <section className="py-5 lg:py-7">
              <div className="container mx-auto px-4">
                <div className="mb-5 xl:hidden">
                  <DashboardMobileNavigation user={user} profile={profile} />
                </div>
                <div className="grid gap-6 xl:grid-cols-[286px_minmax(0,1fr)]">
                  <aside className="hidden self-start xl:block">
                    <DashboardSidebar user={user} profile={profile} />
                  </aside>
                  <div className="min-w-0 space-y-5">
                    <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
                      <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="max-w-3xl">
                          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700">
                            Administration Epicap
                          </Badge>
                          <h1 className="mt-3 text-2xl font-semibold tracking-tight lg:text-3xl">
                            {getProfileDisplayName(profile, user.email)}
                          </h1>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Pilotage du catalogue, des commandes, des devis et des comptes depuis
                            une interface plus lisible, structurée par priorités.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-md px-3 py-1.5">
                            {ROLE_LABELS[profile.role]}
                          </Badge>
                          {profile.company?.name || profile.company_name ? (
                            <Badge variant="outline" className="rounded-md px-3 py-1.5">
                              {profile.company?.name ?? profile.company_name}
                            </Badge>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                    <DashboardActionFeedback />
                    {children}
                  </div>
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider initialUser={user} initialProfile={profile}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.09),transparent_28%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_70%)]">
          <section className="border-b border-border/70 bg-[linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
            <div className="container mx-auto px-4 py-10 lg:py-14">
              <div className="max-w-3xl">
                <Badge className="mb-4 border border-primary/20 bg-primary/20 text-background">
                  Espace sécurisé Supabase
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                  Tableau de bord {getProfileDisplayName(profile, user.email)}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-background/72">
                  Espace Epicap aligné sur vos flux B2B, votre catalogue et votre gouvernance
                  Supabase.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Badge variant="outline" className="border-background/20 text-background">
                    {ROLE_LABELS[profile.role]}
                  </Badge>
                  {profile.company?.name || profile.company_name ? (
                    <Badge variant="outline" className="border-background/20 text-background">
                      {profile.company?.name ?? profile.company_name}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 lg:py-10">
            <div className="container mx-auto px-4">
              <div className="mb-6 xl:hidden">
                <DashboardMobileNavigation user={user} profile={profile} />
              </div>
              <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="hidden xl:block">
                  <DashboardSidebar user={user} profile={profile} />
                </div>
                <div className="min-w-0 space-y-6">
                  <DashboardActionFeedback />
                  {children}
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
