"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function AdminSubmitButton({
  children,
  pendingLabel = "Enregistrement...",
  className,
  size = "sm",
  variant,
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      size={size}
      variant={variant}
      className={className}
      disabled={pending}
      aria-busy={pending}
      data-pending={pending ? "true" : undefined}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
