import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[55vh] bg-background"
    >
      <div className="h-1 overflow-hidden bg-primary/12">
        <div className="h-full w-1/3 animate-[epicap-loading-bar_1.15s_ease-in-out_infinite] rounded-r-full bg-primary" />
      </div>

      <div className="container mx-auto flex min-h-[calc(55vh-0.25rem)] items-center justify-center px-4 py-16">
        <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/90 px-5 py-4 shadow-[0_18px_45px_-34px_rgba(15,16,18,0.22)] backdrop-blur">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Spinner className="size-5" aria-label="Chargement de la page" />
          </div>
          <div>
            <p className="text-sm font-semibold">Chargement</p>
            <p className="text-xs text-muted-foreground">Préparation de la page...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
