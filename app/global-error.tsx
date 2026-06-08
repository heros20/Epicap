"use client"

import * as React from "react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  React.useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <main style={{ padding: "48px", fontFamily: "system-ui, sans-serif" }}>
          <h1>Une erreur est survenue</h1>
          <p>Nos equipes ont ete notifiees. Vous pouvez recharger la page ou revenir plus tard.</p>
        </main>
      </body>
    </html>
  )
}
