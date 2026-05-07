import type { ReactNode } from "react"

import {
  DashboardMobileNavigation,
  DashboardSidebar,
} from "@/components/dashboard/dashboard-sidebar"
import { DashboardActionFeedback } from "@/components/dashboard/dashboard-action-feedback"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import {
  getProfileDisplayName,
  isAdminRole,
  ROLE_LABELS,
  type AuthUser,
  type ProfileWithCompany,
} from "@/lib/auth/types"
import { Card, CardContent } from "@/components/ui/card"

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
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(255,133,28,0.10),transparent_22%),radial-gradient(circle_at_top_right,rgba(33,186,146,0.12),transparent_26%),linear-gradient(180deg,rgba(12,17,24,0.02),rgba(255,255,255,0)_72%)]">
          <section className="py-6 lg:py-8">
            <div className="container mx-auto px-4">
              <div className="mb-6 xl:hidden">
                <DashboardMobileNavigation user={user} profile={profile} />
              </div>
              <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="hidden xl:block">
                  <div className="sticky top-6">
                    <DashboardSidebar user={user} profile={profile} />
                  </div>
                </div>
                <div className="min-w-0 space-y-6">
                  <Card className="overflow-hidden border-border/70 bg-card/92 shadow-[0_24px_70px_-44px_rgba(15,16,18,0.34)]">
                    <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-3xl">
                        <Badge className="border border-primary/14 bg-primary/10 text-primary">
                          Cockpit Epicap
                        </Badge>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight lg:text-4xl">
                          Tableau de bord {getProfileDisplayName(profile, user.email)}
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">
                          Vue admin inspirée des interfaces analytiques modernes, avec navigation
                          latérale, pilotage vente/location et accès direct aux zones critiques.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="rounded-full px-4 py-1.5">
                          {ROLE_LABELS[profile.role]}
                        </Badge>
                        {profile.company?.name || profile.company_name ? (
                          <Badge variant="outline" className="rounded-full px-4 py-1.5">
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
    )
  }

  return (
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
                Cockpit Epicap inspiré des interfaces admin les plus opérationnelles, mais aligné
                sur vos flux B2B, votre catalogue et votre gouvernance Supabase.
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
  )
}
