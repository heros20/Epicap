import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, Building2, Factory, MapPin, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  companyInfo,
  companyOfferings,
  companyStats,
  manufacturerHighlights,
} from "@/lib/data/company"
import { agencies } from "@/lib/data/navigation"

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Epicap SAS : spécialiste de la fourniture, de la location et de la maintenance de matériel de protection contre l'amiante et les autres polluants.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              À propos d&apos;Epicap
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">{companyInfo.legalName}</h1>
            <p className="max-w-3xl text-muted-foreground">{companyInfo.summary}</p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {companyStats.map((stat) => (
                <Card key={stat.label} className="p-0">
                  <CardContent className="p-6">
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12">
                      <Building2 className="size-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Activités mises en avant</h2>
                      <p className="text-sm text-muted-foreground">
                        Synthèse du positionnement observé sur epicap.com
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-muted-foreground">
                    {companyOfferings.map((offering) => (
                      <div key={offering} className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3">
                        {offering}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12">
                      <Factory className="size-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Marques et solutions</h2>
                      <p className="text-sm text-muted-foreground">
                        Fabricants et familles visibles sur les catalogues Epicap
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {manufacturerHighlights.map((manufacturer) => (
                      <span
                        key={manufacturer}
                        className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {manufacturer}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <Card className="p-0">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-xl font-semibold">Siège social</h2>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="mt-1 size-4 text-primary" />
                    <span>{companyInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-primary" />
                    <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>{companyInfo.phone}</a>
                  </div>
                  <p className="text-sm text-muted-foreground">{companyInfo.headOffice.hours}</p>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Implantations</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {agencies.map((agency) => (
                      <div
                        key={agency.slug}
                        className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm"
                      >
                        <p className="font-medium">{agency.name}</p>
                        <p className="text-muted-foreground">{agency.city}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/agences">
                  Voir les agences
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/devis">Demander un devis</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
