import type { ReactNode } from "react"

import {
  DashboardMobileNavigation,
  DashboardSidebar,
} from "@/components/dashboard/dashboard-sidebar"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import {
  getProfileDisplayName,
  ROLE_LABELS,
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
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.09),transparent_28%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_70%)]">
        <section className="border-b border-border/70 bg-[linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <div className="max-w-3xl">
              <Badge className="mb-4 border border-primary/20 bg-primary/20 text-background">
                Espace securise Supabase
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                Dashboard {getProfileDisplayName(profile, user.email)}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-background/72">
                Cockpit Epicap inspire des surfaces admin les plus operationnelles, mais aligne sur
                vos flux B2B, votre catalogue et votre gouvernance Supabase.
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
              <div className="min-w-0">{children}</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
