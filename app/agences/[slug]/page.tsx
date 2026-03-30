import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Clock, Mail, MapPin, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyInfo } from "@/lib/data/company"
import { agencies } from "@/lib/data/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return agencies.map((agency) => ({
    slug: agency.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const agency = agencies.find((item) => item.slug === slug)

  if (!agency) {
    return { title: "Agence non trouvée" }
  }

  return {
    title: `${agency.name} | Agence`,
    description: `Coordonnées de l'agence Epicap ${agency.name} à ${agency.city}.`,
  }
}

export default async function AgencyPage({ params }: PageProps) {
  const { slug } = await params
  const agency = agencies.find((item) => item.slug === slug)

  if (!agency) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              Agence Epicap
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">
              {agency.name} - {agency.city}
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Cette fiche reprend les coordonnées visibles sur le site officiel Epicap pour
              l&apos;agence {agency.name.toLowerCase()}. Vente, location, maintenance respiratoire et
              orientation chantier peuvent être traitées via cette implantation.
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="p-0">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 size-5 text-primary" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-sm text-muted-foreground">
                        {agency.address}, {agency.postalCode} {agency.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 size-5 text-primary" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <a
                        href={`tel:${agency.phone.replace(/\s+/g, "")}`}
                        className="text-sm text-muted-foreground"
                      >
                        {agency.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 size-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${agency.email}`} className="text-sm text-muted-foreground">
                        {agency.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-1 size-5 text-primary" />
                    <div>
                      <p className="font-medium">Horaires</p>
                      <p className="text-sm text-muted-foreground">{agency.hours}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button asChild>
                      <a href={`mailto:${agency.email}`}>Contacter l&apos;agence</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/devis">Demander un devis</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Interlocuteurs</h2>
                  <div className="space-y-3">
                    {agency.contacts.map((contact) => (
                      <div
                        key={`${agency.slug}-${contact.name}`}
                        className="rounded-xl border border-border/70 bg-muted/40 p-4"
                      >
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                        {contact.phone && (
                          <p className="mt-2 text-sm">
                            <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>{contact.phone}</a>
                          </p>
                        )}
                        {contact.email && (
                          <p className="mt-1 text-sm">
                            <a href={`mailto:${contact.email}`}>{contact.email}</a>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-border/70 bg-card p-5">
                    <p className="font-medium">Coordination nationale</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Besoin d&apos;une vue globale multi-sites ? Le siège Epicap à{" "}
                      {companyInfo.headOffice.city} reste joignable au {companyInfo.phone}.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
