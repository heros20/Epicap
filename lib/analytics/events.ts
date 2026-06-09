"use client"

import { track } from "@vercel/analytics"

import { capturePostHogEvent } from "@/lib/analytics/posthog-client"

type AnalyticsValue = string | number | boolean | null

export function safeTrack(
  name: string,
  properties?: Record<string, AnalyticsValue | undefined>,
) {
  try {
    const nextProperties = properties
      ? Object.fromEntries(
          Object.entries(properties).filter((entry): entry is [string, AnalyticsValue] => {
            const value = entry[1]
            return value !== undefined
          }),
        )
      : undefined

    try {
      track(name, nextProperties)
    } catch {
      // Ignore Vercel Analytics failures.
    }

    capturePostHogEvent(name, nextProperties)
  } catch {
    // Analytics must never block the user flow.
  }
}
