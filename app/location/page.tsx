import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, CheckCircle2, Phone, Truck } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyInfo, serviceDetails } from "@/lib/data/company"
import { products } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "Location de matériel",
  description:
    "Location Epicap de matériels de protection collective : EPIROLL, EPICAB, EPIAIR, AQUARIUS et contrôleurs de dépression.",
}

interface PageProps {
  searchParams: Promise<{ product?: string }>
}

export default async function LocationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const requestedProduct = params.product
    ? products.find((product) => product.slug === params.product)
    : undefined
  const rentableProducts = products.filter((product) => product.isRentable).slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              {serviceDetails.location.eyebrow}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">
              {serviceDetails.location.title}
            </h1>
            <p className="max-w-3xl text-muted-foreground">{serviceDetails.location.intro}</p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            {requestedProduct && (
              <Card className="mb-8 border-primary/25 bg-primary/5 p-0">
                <CardContent className="p-5">
                  <p className="text-sm font-medium text-primary">Demande en cours</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Vous consultez la location pour la référence : {requestedProduct.name}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {serviceDetails.location.points.map((point) => (
                <Card key={point} className="p-0">
                  <CardContent className="flex gap-4 p-6">
                    <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/12">
                      <Truck className="size-5 text-primary" />
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{point}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <h2 className="mb-3 text-2xl font-bold">Références proposées en location</h2>
              <p className="text-muted-foreground">
                Exemples de matériels visibles dans le projet et cohérents avec l&apos;offre location
                mise en avant sur le site Epicap.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {rentableProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <Card className="p-0">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <h2 className="mb-3 text-2xl font-bold">Demander une étude location</h2>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      {serviceDetails.location.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center gap-3">
                          <CheckCircle2 className="size-4 text-primary" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <Link href="/devis">
                        Demander un devis
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                        <Phone className="mr-2 size-4" />
                        {companyInfo.phone}
                      </a>
                    </Button>
                  </div>
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
