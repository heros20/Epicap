import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, CheckCircle2, Phone, Wrench } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCatalogProductBySlug, getCatalogProductHref } from "@/lib/catalog/data"
import { companyInfo, serviceDetails } from "@/lib/data/company"
import { agencies } from "@/lib/data/navigation"
import type { Product } from "@/lib/data/products"

export const metadata: Metadata = {
  title: "Maintenance des systèmes respiratoires",
  description:
    "Maintenance Epicap des systèmes respiratoires 3M, SCOTT et KASCO via le réseau national d'agences.",
}

const maintenancePointProductSlugs = [
  "maintenance-annuelle-complete-systeme-scott-proflow-masque-vision-2",
  "maintenance-annuelle-sur-systeme-kasco-t5m3-masque-zenith",
  "maintenance-annuelle-phantom-vision-scott",
  "maintenance-annuelle-systeme-scott-proflow-masque-promask",
] as const

const maintainedMaskProductSlugs = [
  "appareil-de-protection-respiratoire-filtrant-a-ventilation-assistee-phantom-vision-taille-m",
  "masque-panoramique-promask-scott-noir-taille-m-l",
  "masque-complet-vision-2-scott-taille-m-l",
  "kit-a-filtration-ventilee-kasco-t5-tm3p-avec-masque-zenith",
  "masque-vision-3",
  "masque-optifit-en-taillem-pour-systeme-cubair",
] as const

function compactProducts(products: Array<Product | undefined>) {
  return products.filter((product): product is Product => Boolean(product))
}

function getProductHref(product: Product) {
  return getCatalogProductHref(product)
}

export default async function MaintenancePage() {
  const [maintenancePointProducts, serviceProducts] = await Promise.all([
    Promise.all(maintenancePointProductSlugs.map((slug) => getCatalogProductBySlug(slug))),
    Promise.all(maintainedMaskProductSlugs.map((slug) => getCatalogProductBySlug(slug))),
  ])
  const maintenanceCards = serviceDetails.maintenance.points.map((point, index) => ({
    point,
    product: maintenancePointProducts[index],
  }))
  const maintainedMaskProducts = compactProducts(serviceProducts)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              {serviceDetails.maintenance.eyebrow}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">
              {serviceDetails.maintenance.title}
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              {serviceDetails.maintenance.intro} {serviceDetails.maintenance.priceFrom}
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {maintenanceCards.map(({ point, product }) => {
                const cardContent = (
                  <Card className="h-full p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_62px_-34px_rgba(255,133,28,0.28)]">
                    <CardContent className="flex h-full gap-4 p-6">
                      <div className="flex size-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/12">
                        <Wrench className="size-5 text-primary" />
                      </div>
                      <div className="flex min-w-0 flex-col justify-center gap-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">{point}</p>
                        {product && (
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                            Voir la maintenance
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
                    href={getProductHref(product)}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    aria-label={`Voir la maintenance ${product.name}`}
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
              <h2 className="mb-3 text-2xl font-bold">Matériels concernés</h2>
              <p className="text-muted-foreground">
                Sélection de matériels respiratoires concernés par les services de maintenance
                Epicap.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {maintainedMaskProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <Card className="p-0">
              <CardContent className="p-6 lg:p-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <h2 className="mb-3 text-2xl font-bold">Zones couvertes</h2>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                    <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                      {serviceDetails.maintenance.highlights.map((highlight) => (
                        <div key={highlight} className="flex items-center gap-3">
                          <CheckCircle2 className="size-4 text-primary" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <Button asChild>
                      <Link href="/devis?service=maintenance&source=maintenance">
                        Demander une prise en charge
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
