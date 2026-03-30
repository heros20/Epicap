import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { requireProfile } from "@/lib/auth/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireProfile("/dashboard")

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  )
}
