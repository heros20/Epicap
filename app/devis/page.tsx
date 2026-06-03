import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Mail, Phone } from "lucide-react"

import { QuoteRequestForm } from "@/components/forms/quote-request-form"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCatalogProductBySlug } from "@/lib/catalog/data"
import { companyInfo } from "@/lib/data/company"

export const metadata: Metadata = {
  title: "Demande de devis",
  description:
    "Demande de devis Epicap pour vente, location, maintenance respiratoire, FIT TEST et besoins chantier de désamiantage.",
}

interface QuotePageProps {
  searchParams: Promise<{
    product?: string
    service?: string
    cart?: string
    source?: string
  }>
}

function getPreferredRequestType(service?: string) {
  switch (service) {
    case "location":
      return "rental" as const
    case "maintenance":
      return "maintenance" as const
    case "fit-test":
      return "fit-test" as const
    default:
      return "mixed" as const
  }
}

function getContextLabel(service?: string, productName?: string) {
  if (productName && service) {
    return `${productName} · ${service}`
  }

  if (productName) {
    return productName
  }

  if (service === "location") {
    return "Besoin location"
  }

  if (service === "maintenance") {
    return "Besoin maintenance respiratoire"
  }

  if (service === "fit-test") {
    return "Besoin FIT TEST"
  }

  return "Demande libre"
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const params = await searchParams
  const requestedProduct = params.product
    ? await getCatalogProductBySlug(params.product)
    : undefined
  const preferredRequestType = getPreferredRequestType(params.service)
  const includeCartByDefault = params.cart === "1"
  const contextLabel = getContextLabel(params.service, requestedProduct?.name)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.14),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              Demande de devis Epicap
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">
              Centraliser les besoins vente, location et services
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              Décrivez votre besoin et l’équipe Epicap vous accompagne pour choisir la solution
              adaptée en vente, location, maintenance ou FIT TEST.
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <QuoteRequestForm
              requestedProduct={requestedProduct}
              preferredRequestType={preferredRequestType}
              includeCartByDefault={includeCartByDefault}
              sourcePage={params.source}
              contextLabel={contextLabel}
            />
          </div>
        </section>

        <section className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-lg font-semibold">Canal direct</h2>
                  <p className="text-sm text-muted-foreground">
                    Utilisez le formulaire pour détailler votre besoin ou contactez-nous
                    directement par e-mail.
                  </p>
                  <Button asChild className="w-full">
                    <a href={`mailto:${companyInfo.email}?subject=Demande de devis Epicap`}>
                      <Mail className="mr-2 size-4" />
                      {companyInfo.email}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-lg font-semibold">Appel commercial</h2>
                  <p className="text-sm text-muted-foreground">
                    Utile pour échanger rapidement sur une solution de vente, location ou chantier.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                      <Phone className="mr-2 size-4" />
                      {companyInfo.phone}
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="space-y-3 p-6">
                  <h2 className="text-lg font-semibold">Réseau d’agences</h2>
                  <p className="text-sm text-muted-foreground">
                    Pour rattacher la demande à la bonne zone d’intervention.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/agences">
                      Voir les agences
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
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
