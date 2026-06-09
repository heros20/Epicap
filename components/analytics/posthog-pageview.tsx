"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { capturePostHogEvent, getPostHogClient } from "@/lib/analytics/posthog-client"

export function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]")

      if (!link || link.dataset.analyticsManual === "true") {
        return
      }

      const href = link.getAttribute("href")

      if (!href) {
        return
      }

      const destination = new URL(href, window.location.href)
      const commonProperties = {
        source_path: window.location.pathname,
        destination: destination.href,
      }

      if (destination.protocol === "tel:") {
        capturePostHogEvent("Phone Clicked", commonProperties)
        return
      }

      if (destination.pathname === "/devis") {
        capturePostHogEvent("Quote CTA Clicked", commonProperties)
        return
      }

      if (destination.pathname === "/checkout") {
        capturePostHogEvent("Checkout CTA Clicked", commonProperties)
      }
    }

    document.addEventListener("click", handleClick)

    return () => document.removeEventListener("click", handleClick)
  }, [])

  React.useEffect(() => {
    const client = getPostHogClient()

    if (!client) {
      return
    }

    const queryString = searchParams.toString()
    const path = queryString ? `${pathname}?${queryString}` : pathname

    capturePostHogEvent("$pageview", {
      $current_url: window.location.href,
      path,
    })
  }, [pathname, searchParams])

  return null
}
