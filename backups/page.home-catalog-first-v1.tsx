import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
} from "lucide-react"

import { HeaderSearchBox } from "@/components/layout/header-search-box"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getCatalogProducts, getFeaturedCatalogProducts } from "@/lib/catalog/data"
import { companyInfo, companyOfferings, serviceDetails } from "@/lib/data/company"
import { agencies, categories } from "@/lib/data/navigation"

const categoryImageKeywords: Record<string, string[]> = {
  "equipements-de-protection-respiratoire": ["phantom", "masque", "respiratoire", "ventilation"],
  "equipements-de-protection-individuelle": ["combinaison", "botte", "gants", "epi"],
  decontamination: ["pediluve", "decontamination", "sas", "gel protect"],
  "extracteurs-d-air-epiair": ["extracteur", "epiair"],
  "aspirateurs-ponceuses-rectifieuses-de-sol": ["aspirateur", "ponceuse", "rectifieuse"],
  "mesures-controles-communication": ["controleur", "bulkair", "mesure", "alarme"],
  confinement: ["film", "colle", "ruban", "confinement"],
  emballages: ["liner", "sac", "big bag", "film"],
  "brumisation-impregnation-decapage-outillages": ["brumisateur", "decapage", "impregnation"],
  "materiel-et-consommables-pour-le-deplombage": ["plomb", "deplombage"],
  "location-et-maintenance-equipements-anti-amiante": ["epiroll", "location", "controleur"],
}

const categoryImageProductOverrides: Record<string, string[]> = {
  "extracteurs-d-air-epiair": [
    "extracteur-d-air-a-filtration-the-epiair-t10-10000-m3h",
    "extracteur-dair-a-filtration-the-epi-air-50-pour-le-desamiantage",
    "extracteur-dair-a-filtration-the-650m3-desamiantage",
  ],
  confinement: [
    "film-polyethylene-80-thr-240m-transparent-epicap",
    "film-polyethylene-80-thr-240m-blanc-epicap",
  ],
}

function getRepresentativeCategoryImage(
  categorySlug: string,
  products: Awaited<ReturnType<typeof getCatalogProducts>>,
) {
  const categoryProducts = products.filter((product) => product.categorySlug === categorySlug)
  const keywords = categoryImageKeywords[categorySlug] ?? []
  const preferredSlugs = categoryImageProductOverrides[categorySlug] ?? []
  const preferredProduct = preferredSlugs
    .map((slug) => categoryProducts.find((product) => product.slug === slug && product.image))
    .find(Boolean)

  const matchingProduct =
    preferredProduct ??
    categoryProducts.find((product) => {
      const haystack = [
        product.name,
        product.shortDescription,
        product.description,
        product.subcategorySlug ?? "",
      ]
        .join(" ")
        .toLowerCase()

      return keywords.some((keyword) => haystack.includes(keyword))
    }) ??
    categoryProducts.find((product) => Boolean(product.image)) ??
    null

  if (!matchingProduct?.image) {
    return null
  }

  return {
    src: matchingProduct.image,
    alt: `${matchingProduct.name} - ${categorySlug}`,
  }
}

export default async function HomePage() {
  const catalogProducts = await getCatalogProducts()
  const featuredProducts = await getFeaturedCatalogProducts(8)
  const rentableProducts = catalogProducts.filter((product) => product.isRentable).slice(0, 4)
  const stockProducts = catalogProducts.filter((product) => product.inStock).slice(0, 4)
  const categoryImages = new Map(
    categories.map((category) => [
      category.slug,
      getRepresentativeCategoryImage(category.slug, catalogProducts),
    ]),
  )

  const localBusinessStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: companyInfo.legalName,
    alternateName: companyInfo.brandName,
    description: companyInfo.summary,
    telephone: companyInfo.phone,
    email: companyInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: companyInfo.headOffice.address,
      postalCode: companyInfo.headOffice.postalCode,
      addressLocality: companyInfo.headOffice.city,
      addressCountry: "FR",
    },
    areaServed: agencies.map((agency) => agency.region),
    url: "https://epicap.com",
  }

  return (
    <>
      <JsonLd data={localBusinessStructuredData} />
      <div className="flex min-h-screen flex-col">
        <Header />

        <main className="flex-1">
          <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.11),rgba(255,255,255,0)_72%)]">
            <div className="container mx-auto px-4 py-8 lg:py-10">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
                <div>
                  <Badge className="mb-4 border border-primary/20 bg-primary/12 text-primary shadow-sm">
                    Catalogue B2B Epicap
                  </Badge>
                  <h1 className="max-w-5xl text-4xl font-bold tracking-tight lg:text-6xl">
                    Trouvez rapidement vos produits de desamiantage
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground lg:text-lg">
                    Protection respiratoire, EPI, confinement, extracteurs EPIAIR, consommables,
                    location et maintenance pour vos chantiers.
                  </p>

                  <div className="mt-6 max-w-3xl">
                    <HeaderSearchBox className="w-full" />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Masques",
                      "Extracteurs",
                      "Combinaisons",
                      "Sacs amiante",
                      "Location",
                    ].map((query) => (
                      <Link
                        key={query}
                        href={`/boutique?query=${encodeURIComponent(query)}`}
                        className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/35 hover:text-primary"
                      >
                        {query}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg" className="rounded-full px-6">
                      <Link href="/boutique">
                        <ShoppingCart className="size-4" />
                        Voir tout le catalogue
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-6">
                      <Link href="/devis?source=home-hero">
                        Demander un devis
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <QuickCommerceLink
                    href="/boutique/equipements-de-protection-respiratoire"
                    icon={<ShieldCheck className="size-5" />}
                    title="Respiratoire"
                    description="Masques, ventilation, filtres et accessoires."
                  />
                  <QuickCommerceLink
                    href="/location"
                    icon={<Truck className="size-5" />}
                    title="Location chantier"
                    description="EPIROLL, EPICAB, EPIAIR et controleurs."
                  />
                  <QuickCommerceLink
                    href="/devis?source=home-quick"
                    icon={<ClipboardCheck className="size-5" />}
                    title="Devis rapide"
                    description="Envoyez une liste d'articles ou un besoin chantier."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-border/70 bg-background py-8">
            <div className="container mx-auto px-4">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Acheter par famille</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Acces direct aux gammes les plus recherchees.
                  </p>
                </div>
                <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex">
                  <Link href="/boutique">
                    Toutes les familles
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 8).map((category) => {
                  const categoryImage = categoryImages.get(category.slug)

                  return (
                    <Link
                      key={category.slug}
                      href={`/boutique/${category.slug}`}
                      className="group overflow-hidden rounded-[1.35rem] border border-border/70 bg-card shadow-[0_16px_40px_-34px_rgba(15,16,18,0.18)] transition-all hover:-translate-y-0.5 hover:border-primary/35"
                    >
                      <div className="relative aspect-[16/9] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.94),rgba(238,241,245,0.96))]">
                        {categoryImage ? (
                          <Image
                            src={categoryImage.src}
                            alt={categoryImage.alt}
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-muted" />
                        )}
                      </div>
                      <div className="flex min-h-24 items-start justify-between gap-3 p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            {category.shortName}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold leading-5">{category.name}</h3>
                        </div>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="py-10 lg:py-12">
            <div className="container mx-auto px-4">
              <ProductSectionHeader
                eyebrow="Selection catalogue"
                title="Produits mis en avant"
                href="/boutique"
                cta="Voir le catalogue"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>

          <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(15,16,18,0.025),rgba(255,255,255,0)_70%)] py-10 lg:py-12">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
                <div>
                  <ProductSectionHeader
                    eyebrow="Disponible rapidement"
                    title="Articles en stock"
                    href="/boutique?inStock=true"
                    cta="Voir le stock"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {stockProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>

                <div>
                  <ProductSectionHeader
                    eyebrow="Pour chantier temporaire"
                    title="Materiel en location"
                    href="/location"
                    cta="Voir la location"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {rentableProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10 lg:py-12">
            <div className="container mx-auto px-4">
              <div className="grid gap-4 md:grid-cols-3">
                <ServicePanel
                  href="/location"
                  icon={<Truck className="size-6 text-primary" />}
                  title={serviceDetails.location.title}
                  description={serviceDetails.location.description}
                />
                <ServicePanel
                  href="/maintenance"
                  icon={<Wrench className="size-6 text-primary" />}
                  title={serviceDetails.maintenance.title}
                  description={serviceDetails.maintenance.description}
                />
                <ServicePanel
                  href="/fit-test"
                  icon={<ClipboardCheck className="size-6 text-primary" />}
                  title={serviceDetails["fit-test"].title}
                  description={serviceDetails["fit-test"].description}
                />
              </div>
            </div>
          </section>

          <section className="bg-[linear-gradient(135deg,#111317_0%,#1a1d22_100%)] py-10 text-background lg:py-12">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                <div>
                  <Badge className="mb-4 border border-primary/20 bg-background/8 text-primary">
                    Accompagnement B2B
                  </Badge>
                  <h2 className="text-3xl font-bold lg:text-4xl">
                    Besoin d&apos;un panier chantier complet ?
                  </h2>
                  <p className="mt-4 max-w-3xl leading-7 text-background/72">
                    Epicap accompagne les entreprises sur la fourniture, la location et la
                    maintenance de materiel anti-amiante. Ajoutez vos articles, demandez un devis
                    ou contactez l&apos;agence la plus proche.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {companyOfferings.slice(0, 4).map((offering) => (
                      <div key={offering} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                        <span className="text-sm leading-6 text-background/78">{offering}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-background/10 bg-background/6 p-5">
                  <div className="space-y-3">
                    <Button asChild size="lg" className="w-full rounded-full">
                      <Link href="/devis?source=home-bottom">
                        Demander un devis
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
                    >
                      <Link href="/agences">
                        <MapPin className="size-4" />
                        Trouver une agence
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="w-full rounded-full border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
                    >
                      <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                        <Phone className="size-4" />
                        {companyInfo.phone}
                      </a>
                    </Button>
                  </div>
                  <div className="mt-5 flex items-center gap-3 rounded-2xl border border-background/10 bg-black/16 p-4">
                    <Building2 className="size-5 text-primary" />
                    <p className="text-sm text-background/74">
                      Siege a {companyInfo.headOffice.city}, reseau national d&apos;agences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

function QuickCommerceLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-[1.35rem] border border-border/70 bg-card p-5 shadow-[0_18px_45px_-34px_rgba(15,16,18,0.16)] transition-all hover:-translate-y-0.5 hover:border-primary/35"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="ml-auto mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}

function ProductSectionHeader({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow: string
  title: string
  href: string
  cta: string
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-bold lg:text-3xl">{title}</h2>
      </div>
      <Button asChild variant="outline" className="hidden rounded-full sm:inline-flex">
        <Link href={href}>
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}

function ServicePanel({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="h-full border-border/70 bg-card p-0">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-primary/12">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
        <Button asChild variant="outline" className="mt-6 w-fit rounded-full">
          <Link href={href}>
            En savoir plus
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
