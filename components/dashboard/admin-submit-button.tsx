"use client"

import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"

export function AdminSubmitButton({
  children,
  pendingLabel = "Validation...",
  className,
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="sm" className={className} disabled={pending}>
      {pending ? pendingLabel : children}
    </Button>
  )
}
