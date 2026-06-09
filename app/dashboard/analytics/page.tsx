import { PostHogAnalyticsPanel } from "@/components/dashboard/posthog-analytics-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/server"

export default async function DashboardAnalyticsPage() {
  await requireRole(["admin", "super_admin"], "/dashboard/analytics")

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Suivi analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-sm leading-6 text-muted-foreground">
          Ces indicateurs viennent de PostHog et permettent de suivre le comportement utilisateur sans
          alourdir le site. Le replay de session reste désactivé tant que la variable dédiée n&apos;est pas activée.
        </CardContent>
      </Card>

      <PostHogAnalyticsPanel />
    </div>
  )
}
