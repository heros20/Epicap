"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ButtonProps = React.ComponentProps<typeof Button>

export function PendingLinkButton({
  href,
  children,
  pendingLabel = "Chargement...",
  className,
  onClick,
  ...props
}: Omit<ButtonProps, "asChild" | "disabled" | "type"> & {
  href: string
  pendingLabel?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  const pathname = usePathname()
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    setPending(false)
  }, [pathname])

  return (
    <Button
      asChild
      className={cn("relative overflow-hidden", pending && "pointer-events-none", className)}
      aria-busy={pending}
      data-pending={pending ? "true" : undefined}
      {...props}
    >
      <Link
        href={href}
        prefetch={false}
        onClick={(event) => {
          onClick?.(event)
          if (
            event.defaultPrevented ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return
          }
          setPending(true)
        }}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          children
        )}
      </Link>
    </Button>
  )
}
