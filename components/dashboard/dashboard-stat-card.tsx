import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DashboardStatCard({
  label,
  value,
  helper,
  accent = "default",
}: {
  label: string
  value: string
  helper: string
  accent?: "default" | "primary" | "warning"
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/70 bg-card/92 shadow-[0_22px_52px_-42px_rgba(15,16,18,0.28)]",
        accent === "primary" &&
          "border-primary/20 bg-[linear-gradient(180deg,rgba(255,133,28,0.06),rgba(255,255,255,0))]",
        accent === "warning" &&
          "border-amber-300/30 bg-[linear-gradient(180deg,rgba(245,158,11,0.08),rgba(255,255,255,0))]",
      )}
    >
      <CardContent className="p-0">
        <div
          className={cn(
            "h-1 w-full bg-border/70",
            accent === "primary" && "bg-[linear-gradient(90deg,#ff851c,#ffb067)]",
            accent === "warning" && "bg-[linear-gradient(90deg,#f59e0b,#fcd34d)]",
          )}
        />
        <div className="p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/80">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}
