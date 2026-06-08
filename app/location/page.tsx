import Link from "next/link"
import { Metadata } from "next"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getCatalogProductBySlug,
  getCatalogProductHref,
  getRentableCatalogProducts,
} from "@/lib/catalog/data"
import type { Product } from "@/lib/data/products"
import { companyInfo, serviceDetails } from "@/lib/data/company"

export const metadata: Metadata = {
  title: "Location de matériel",
  description:
    "Location Epicap de matériels de protection collective : EPIROLL, EPICAB, EPIAIR, AQUARIUS et contrôleurs de dépression.",
}

interface PageProps {
  searchParams: Promise<{ product?: string }>
}

const locationPointProductSlugs = [
  "roulotte-de-decontamination-epiroll-5-compartiments",
  "location-sas-personnel-5-compartiments-conforme-ed6307",
  "unite-de-chauffage-et-filtration-automatique-aquarius-160",
  "controleur-de-depression-bulkair-pm-1-voie-gsm-integre",
] as const

function getLocationProductHref(product: Product) {
  return getCatalogProductHref(product)
}

function getRandomProducts(products: Product[], count: number) {
  return [...products].sort(() => Math.random() - 0.5).slice(0, count)
}

export default async function LocationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const requestedProduct = params.product ? await getCatalogProductBySlug(params.product) : undefined
  const [allRentableProducts, locationPointProducts] = await Promise.all([
    getRentableCatalogProducts(),
    Promise.all(locationPointProductSlugs.map((slug) => getCatalogProductBySlug(slug))),
  ])
  const rentableProducts = getRandomProducts(allRentableProducts, 4)
  const quoteHref = requestedProduct
    ? `/devis?service=location&product=${requestedProduct.slug}&source=location`
    : "/devis?service=location&source=location"
  const locationCards = serviceDetails.location.points.map((point, index) => ({
    point,
    product: locationPointProducts[index],
  }))

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
              {locationCards.map(({ point, product }) => {
                const cardContent = (
                  <Card className="h-full overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_62px_-34px_rgba(255,133,28,0.28)]">
                    <CardContent className="grid h-full grid-cols-[7.5rem_1fr] gap-4 p-0 sm:grid-cols-[9rem_1fr]">
                      <div className="relative min-h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(238,241,245,0.96))]">
                        {product?.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(min-width: 1024px) 144px, 120px"
                            className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col justify-center gap-3 py-5 pr-5">
                        <p className="text-sm leading-relaxed text-muted-foreground">{point}</p>
                        {product && (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                            Voir la location
                            <ArrowRight className="size-3.5" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )

                return product ? (
                  <Link
                    key={point}
                    href={getLocationProductHref(product)}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Voir la location ${product.name}`}
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div key={point}>{cardContent}</div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl">
              <h2 className="mb-3 text-2xl font-bold">Références proposées en location</h2>
              <p className="text-muted-foreground">
                Exemples de matériels proposés en location pour les besoins de protection
                collective et de décontamination.
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
                      <Link href={quoteHref}>
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
