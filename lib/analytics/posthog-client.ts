"use client"

import posthog from "posthog-js"

type PostHogValue = string | number | boolean | null

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"
const sessionReplayEnabled = process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY === "true"

let isInitialized = false

export function getPostHogClient() {
  if (typeof window === "undefined" || !posthogKey) {
    return null
  }

  if (!isInitialized) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      disable_session_recording: !sessionReplayEnabled,
      loaded: (client) => {
        if (!sessionReplayEnabled) {
          client.stopSessionRecording()
        }
      },
    })
    isInitialized = true
  }

  return posthog
}

export function capturePostHogEvent(
  name: string,
  properties?: Record<string, PostHogValue>,
) {
  try {
    getPostHogClient()?.capture(name, properties)
  } catch {
    // Product analytics must never block the user flow.
  }
}
