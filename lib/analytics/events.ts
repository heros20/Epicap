"use client"

import { track } from "@vercel/analytics"

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

    track(name, nextProperties)
  } catch {
    // Analytics must never block the user flow.
  }
}
