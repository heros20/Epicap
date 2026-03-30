import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyInfo } from "@/lib/data/company"
import { agencies } from "@/lib/data/navigation"

export const metadata: Metadata = {
  title: "Agences",
  description:
    "Réseau d'agences Epicap : siège social à Escaudain et implantations Rhône-Alpes, Île-de-France, Est, Normandie, Sud-Est, Grand-Ouest et Sud-Ouest.",
}

export default function AgenciesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              Réseau Epicap
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">Nos agences</h1>
            <p className="max-w-3xl text-muted-foreground">
              Le projet reprend désormais les implantations visibles sur epicap.com : siège social
              à {companyInfo.headOffice.city} et agences régionales pour la vente, la location, la
              maintenance respiratoire et le support chantier.
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {agencies.map((agency) => (
                <Card key={agency.slug} className="p-0">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold">{agency.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {agency.city} - {agency.region}
                        </p>
                      </div>
                      {agency.isHeadOffice && <Badge variant="secondary">Siège</Badge>}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 size-4 text-primary" />
                        <span>
                          {agency.address}, {agency.postalCode} {agency.city}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="size-4 text-primary" />
                        <a href={`tel:${agency.phone.replace(/\s+/g, "")}`}>{agency.phone}</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="size-4 text-primary" />
                        <a href={`mailto:${agency.email}`}>{agency.email}</a>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="size-4 text-primary" />
                        <span>{agency.hours}</span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      {agency.contacts.slice(0, 2).map((contact) => (
                        <div
                          key={`${agency.slug}-${contact.name}`}
                          className="rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-sm"
                        >
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.role}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Button asChild>
                        <Link href={`/agences/${agency.slug}`}>
                          Voir la fiche
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={`mailto:${agency.email}`}>Contacter</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
