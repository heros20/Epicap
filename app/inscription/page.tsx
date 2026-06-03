import type { ReactNode } from "react"
import Link from "next/link"
import { Building2, ShieldCheck, UserPlus } from "lucide-react"

import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUpAction } from "@/lib/auth/actions"
import { normalizeRedirectPath } from "@/lib/auth/types"

function pickFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const error = pickFirstValue(params.error)
  const next = normalizeRedirectPath(pickFirstValue(params.next))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.14),transparent_24%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)] py-16 lg:py-24">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl">
              <Badge variant="secondary" className="mb-5 border border-border/70 shadow-sm">
                Compte membre Epicap
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                Créer votre accès client Epicap
              </h1>
              <p className="mt-5 text-base leading-7 text-muted-foreground">
                Créez un compte pour renseigner vos informations, faciliter vos demandes de devis
                et préparer vos futures commandes.
              </p>
              <div className="mt-8 grid gap-4">
                <Benefit
                  icon={<UserPlus className="size-5 text-primary" />}
                  title="Compte membre"
                  description="Un espace personnel pour suivre vos informations et vos demandes."
                />
                <Benefit
                  icon={<Building2 className="size-5 text-primary" />}
                  title="Contexte B2B"
                  description="Nom de société, fonction et téléphone peuvent être ajoutés au profil."
                />
                <Benefit
                  icon={<ShieldCheck className="size-5 text-primary" />}
                  title="Suivi simplifié"
                  description="Vos échanges avec Epicap sont plus faciles à retrouver."
                />
              </div>
            </div>

            <Card className="border-border/70 bg-card/95 shadow-[0_32px_90px_-56px_rgba(15,16,18,0.32)]">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Onboarding sécurisé
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">Creer un compte</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Renseignez vos informations ou utilisez votre compte Google pour créer votre
                    espace client sécurisé.
                  </p>
                </div>

                {error ? <MessageBox message={error} /> : null}

                <div className="mt-6">
                  <GoogleAuthButton
                    next={next}
                    source="inscription"
                    cta="Creer mon compte avec Google"
                    hint="Si votre compte Google n’existe pas encore, un espace client sera créé."
                  />
                </div>

                <form action={signUpAction} className="mt-6 space-y-5">
                  <input type="hidden" name="next" value={next} />
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Prenom" htmlFor="firstName">
                      <Input id="firstName" name="firstName" required />
                    </Field>
                    <Field label="Nom" htmlFor="lastName">
                      <Input id="lastName" name="lastName" required />
                    </Field>
                    <Field label="Société" htmlFor="companyName">
                      <Input id="companyName" name="companyName" placeholder="Epicap Normandie" />
                    </Field>
                    <Field label="Fonction" htmlFor="jobTitle">
                      <Input id="jobTitle" name="jobTitle" placeholder="Charge d'affaires" />
                    </Field>
                    <Field label="Téléphone" htmlFor="phone">
                      <Input id="phone" name="phone" type="tel" placeholder="06 12 34 56 78" />
                    </Field>
                    <Field label="Adresse email" htmlFor="email">
                      <Input id="email" name="email" type="email" required />
                    </Field>
                    <Field label="Mot de passe" htmlFor="password">
                      <Input id="password" name="password" type="password" required />
                    </Field>
                    <Field label="Confirmation" htmlFor="confirmPassword">
                      <Input id="confirmPassword" name="confirmPassword" type="password" required />
                    </Field>
                  </div>
                  <Button type="submit" size="lg" className="w-full">
                    Creer mon compte
                  </Button>
                </form>

                <div className="mt-6 rounded-[1.2rem] border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Deja inscrit ?
                  <Link
                    href={`/connexion?next=${encodeURIComponent(next)}`}
                    className="ml-1 font-medium text-primary hover:underline"
                  >
                    Se connecter
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

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/70 bg-card/85 p-5 shadow-[0_22px_52px_-42px_rgba(15,16,18,0.22)]">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary/12">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function MessageBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/6 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  )
}
