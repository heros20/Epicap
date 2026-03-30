import Link from "next/link"
import { AlertTriangle, ArrowLeft, LayoutDashboard } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const REASONS: Record<string, string> = {
  role: "Votre rôle actuel ne permet pas d’accéder à cette section.",
  inactive: "Votre compte a été désactivé. Un super admin doit le réactiver.",
  "missing-profile": "La session existe, mais le profil applicatif n’a pas été trouvé.",
}

export default async function ForbiddenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const reason = pickFirstValue(params.reason) ?? "role"
  const message =
    REASONS[reason] ?? "L’accès à cette ressource est actuellement refusé."

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-3xl border-border/70 bg-card/95 shadow-[0_28px_70px_-46px_rgba(15,16,18,0.28)]">
            <CardContent className="p-8 text-center lg:p-12">
              <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-8" />
              </div>
              <Badge variant="secondary" className="mt-6 border border-border/70">
                Accès refusé
              </Badge>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">Zone non autorisée</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                {message}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 size-4" />
                    Retour au dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/connexion">
                    <ArrowLeft className="mr-2 size-4" />
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
