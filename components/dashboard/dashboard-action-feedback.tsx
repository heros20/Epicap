"use client"

import * as React from "react"
import { CheckCircle2, X, XCircle } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type FeedbackTone = "success" | "error"

interface FeedbackState {
  tone: FeedbackTone
  message: string
}

export function DashboardActionFeedback() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [feedback, setFeedback] = React.useState<FeedbackState | null>(null)

  React.useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    const nextFeedback = success
      ? ({ tone: "success", message: success } satisfies FeedbackState)
      : error
        ? ({ tone: "error", message: error } satisfies FeedbackState)
        : null

    if (!nextFeedback) {
      return
    }

    setFeedback(nextFeedback)
    toast({
      title: nextFeedback.tone === "success" ? "Action validée" : "Action à vérifier",
      description: nextFeedback.message,
      variant: nextFeedback.tone === "error" ? "destructive" : "default",
    })

    const params = new URLSearchParams(searchParams.toString())
    params.delete("success")
    params.delete("error")
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname

    window.setTimeout(() => {
      router.replace(nextUrl, { scroll: false })
    }, 250)
  }, [pathname, router, searchParams])

  if (!feedback) {
    return null
  }

  const Icon = feedback.tone === "success" ? CheckCircle2 : XCircle

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-2 rounded-[1.15rem] border px-4 py-3 shadow-[0_18px_45px_-36px_rgba(15,16,18,0.28)]",
        feedback.tone === "success"
          ? "border-success/25 bg-success/8 text-success"
          : "border-destructive/25 bg-destructive/6 text-destructive",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {feedback.tone === "success" ? "Action enregistrée" : "Action non enregistrée"}
          </p>
          <p className="mt-1 text-sm leading-6 opacity-90">{feedback.message}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full text-current hover:bg-current/10"
          onClick={() => setFeedback(null)}
          aria-label="Masquer la notification"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
