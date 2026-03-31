import Link from "next/link"
import { Metadata } from "next"
import { Mail, MapPin, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyInfo } from "@/lib/data/company"
import { agencies } from "@/lib/data/navigation"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Epicap : siège social à Escaudain, agences régionales, demande de devis, location, maintenance respiratoire et FIT TEST.",
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              Contact Epicap
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">Nous contacter</h1>
            <p className="max-w-3xl text-muted-foreground">
              Le site projet intègre désormais les coordonnées Epicap utiles pour les demandes
              produit, location, maintenance respiratoire, FIT TEST et besoins multi-agences.
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <Phone className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Téléphone</h2>
                  <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>{companyInfo.phone}</a>
                  <p className="text-sm text-muted-foreground">
                    Siège Epicap : orientation vers la bonne agence selon votre besoin.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <Mail className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">E-mail</h2>
                  <a href={`mailto:${companyInfo.email}`}>{companyInfo.email}</a>
                  <p className="text-sm text-muted-foreground">
                    Pour les devis, demandes de catalogues et questions techniques.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <MapPin className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Siège social</h2>
                  <p>{companyInfo.address}</p>
                  <p className="text-sm text-muted-foreground">{companyInfo.headOffice.hours}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <h2 className="mb-3 text-2xl font-bold">Agences</h2>
              <p className="text-muted-foreground">
                Accès rapide aux implantations Epicap pour un traitement régional de votre besoin.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {agencies.map((agency) => (
                <Card key={agency.slug} className="p-0">
                  <CardContent className="p-5">
                    <h3 className="font-semibold">{agency.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{agency.city}</p>
                    <p className="mt-3 text-sm">{agency.phone}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/agences/${agency.slug}`}>Voir l&apos;agence</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/devis">Demander un devis</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/location">Voir la location</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/maintenance">Maintenance respiratoire</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
