import type { ReactNode } from "react"
import Link from "next/link"
import { KeyRound, ShieldCheck, UserCog } from "lucide-react"

import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInAction } from "@/lib/auth/actions"
import { normalizeRedirectPath } from "@/lib/auth/types"

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const success = pickFirstValue(params.success)
  const next = normalizeRedirectPath(pickFirstValue(params.next))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.18),transparent_28%),linear-gradient(135deg,#111317_0%,#1a1d22_100%)] py-16 text-background lg:py-24">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-xl">
              <Badge className="mb-5 border border-primary/20 bg-primary/20 text-background">
                Authentification Supabase
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                Connexion sécurisée Epicap
              </h1>
              <p className="mt-5 text-base leading-7 text-background/74">
                Ce socle prepare les comptes membre, admin et super admin avec controle d&apos;acces
                serveur, RLS et dashboard dedie.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <FeatureCard
                  icon={<ShieldCheck className="size-5 text-primary" />}
                  title="RLS"
                  description="Lecture et écriture filtrées côté base."
                />
                <FeatureCard
                  icon={<UserCog className="size-5 text-primary" />}
                  title="Roles"
                  description="Membre, admin et super admin."
                />
                <FeatureCard
                  icon={<KeyRound className="size-5 text-primary" />}
                  title="SSR"
                  description="Session geree sur client et serveur."
                />
              </div>
            </div>

            <Card className="border-border/70 bg-card/95 shadow-[0_32px_90px_-56px_rgba(15,16,18,0.45)]">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Acces au dashboard
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">Se connecter</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Utilisez vos identifiants Epicap ou Google pour accéder à votre espace
                    sécurisé.
                  </p>
                </div>

                {error ? <MessageBox tone="error" message={error} /> : null}
                {success ? <MessageBox tone="success" message={success} /> : null}

                <div className="mt-6">
                  <GoogleAuthButton
                    next={next}
                    source="connexion"
                    cta="Continuer avec Google"
                    hint="Le meme bouton couvre la connexion et la creation de compte Google."
                  />
                </div>

                <form action={signInAction} className="mt-6 space-y-5">
                  <input type="hidden" name="next" value={next} />
                  <div>
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@entreprise.fr"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Votre mot de passe"
                      className="mt-2"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Se connecter
                  </Button>
                </form>

                <div className="mt-6 rounded-[1.2rem] border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Premier acces ?
                  <Link
                    href={`/inscription?next=${encodeURIComponent(next)}`}
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    Creer un compte membre
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-background/10 bg-background/6 p-4 backdrop-blur-sm">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-background/8">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6 text-background/72">{description}</p>
    </div>
  )
}

function MessageBox({
  tone,
  message,
}: {
  tone: "error" | "success"
  message: string
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-destructive/20 bg-destructive/6 text-destructive"
          : "border-success/20 bg-success/8 text-success"
      }`}
    >
      {message}
    </div>
  )
}
