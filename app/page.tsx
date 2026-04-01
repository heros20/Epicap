import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  MapPin,
  Phone,
  Shield,
  Truck,
  Wrench,
} from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  companyInfo,
  companyOfferings,
  companyStats,
  manufacturerHighlights,
  serviceDetails,
} from "@/lib/data/company"
import { getCatalogProducts, getFeaturedCatalogProducts } from "@/lib/catalog/data"
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
    alt: `${matchingProduct.name} - illustration ${categorySlug}`,
  }
}

export default async function HomePage() {
  const catalogProducts = await getCatalogProducts()
  const featuredProducts = await getFeaturedCatalogProducts(6)
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
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.24),transparent_24%),linear-gradient(135deg,#0f1012_0%,#17191d_52%,#090a0b_100%)] text-background">
          <div className="absolute inset-0 opacity-[0.08]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 71h72v1H0zm0-18h72v1H0zm0-18h72v1H0zm0-18h72v1H0zm17 54V0h1v71zm18 0V0h1v71zm18 0V0h1v71z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
          </div>

          <div className="container relative mx-auto px-4 py-16 lg:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <Badge className="border border-primary/25 bg-background/8 text-primary shadow-sm">
                  {companyInfo.tagline}
                </Badge>

                <h1 className="max-w-4xl text-4xl font-bold leading-[0.94] text-balance lg:text-6xl xl:text-7xl">
                  {companyInfo.heroTitle}
                </h1>

                <p className="max-w-2xl text-lg leading-relaxed text-background/76">
                  {companyInfo.summary} Vente, location, maintenance respiratoire, FIT TEST,
                  confinement, décontamination et consommables chantier.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {companyOfferings.slice(0, 4).map((offering) => (
                    <div key={offering} className="flex items-start gap-3 rounded-2xl border border-background/10 bg-background/5 p-4 backdrop-blur-sm">
                      <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                      <span className="text-sm text-background/84">{offering}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button size="lg" asChild className="px-6 text-base">
                    <Link href="/boutique">
                      Voir le catalogue
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-background/16 bg-background/6 text-base text-background hover:bg-background/10 hover:text-background"
                  >
                    <Link href="/location">Voir la location</Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-[2rem] border border-background/10 bg-background/5 p-5 shadow-[0_44px_110px_-58px_rgba(0,0,0,0.78)] backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.16),transparent_38%)]" />
                  <div className="overflow-hidden rounded-[1.5rem] border border-background/10">
                    <Image
                      src="/images/hero-equipment.jpg"
                      alt="Matériel Epicap pour chantier de désamiantage"
                      width={1200}
                      height={960}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>

                  <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                    {companyStats.map((stat) => (
                      <div key={stat.label} className="rounded-[1.25rem] border border-background/10 bg-black/18 p-4">
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="mt-1 text-sm text-background/72">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 rounded-[1.4rem] border border-background/10 bg-background/5 px-5 py-4 text-sm text-background/82 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <span>Siège à {companyInfo.headOffice.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span>Réseau national d&apos;agences</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-primary" />
                    <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>{companyInfo.phone}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,rgba(255,133,28,0.05),transparent_38%)] py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 max-w-3xl">
              <Badge variant="secondary" className="mb-4 border border-border/60 shadow-sm">
                Gammes Epicap
              </Badge>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
                Les familles de produits présentes sur epicap.com
              </h2>
              <p className="text-muted-foreground">
                Le projet reprend maintenant la structure officielle des gammes Epicap :
                respiratoire, EPI, décontamination, EPIAIR, aspirateurs Type H, confinement,
                emballages, brumisation, mesures et déplombage.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => {
                const categoryImage = categoryImages.get(category.slug)

                return (
                  <Link
                    key={category.slug}
                    href={`/boutique/${category.slug}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-[0_18px_45px_-34px_rgba(15,16,18,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_62px_-34px_rgba(255,133,28,0.26)]"
                  >
                    <div className="relative">
                      {categoryImage ? (
                        <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(238,241,245,0.96))]">
                          <Image
                            src={categoryImage.src}
                            alt={categoryImage.alt}
                            fill
                            className="object-contain p-4 transition duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(12,13,16,0.12))]" />
                        </div>
                      ) : (
                        <div className="h-32 bg-[linear-gradient(135deg,rgba(255,133,28,0.15),rgba(15,16,18,0.06))]" />
                      )}

                      <div className="absolute left-4 top-4">
                        <Badge variant="secondary" className="border border-white/15 bg-white/86 shadow-sm">
                          {category.shortName}
                        </Badge>
                      </div>

                      <div className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/16 bg-white/82 shadow-sm">
                        <ArrowRight className="size-4 text-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-semibold">{category.name}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {category.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {category.subcategories.slice(0, 3).map((subcategory) => (
                          <span
                            key={subcategory.slug}
                            className="rounded-full border border-border/70 bg-background px-3 py-1 text-xs text-muted-foreground"
                          >
                            {subcategory.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4 border border-border/60 shadow-sm">
                  Sélection représentative
                </Badge>
                <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Produits et services phares</h2>
                <p className="text-muted-foreground">
                  Les références ci-dessous reprennent des produits et prestations mis en avant
                  sur le site officiel Epicap : Phantom Vision, CUBAIR, EPIROLL, EPIAIR,
                  BULKAIR, Easy Gel Protect ou encore le FIT TEST.
                </p>
              </div>

              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/boutique">
                  Voir tout le catalogue
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[radial-gradient(circle_at_top,rgba(255,133,28,0.14),transparent_28%),linear-gradient(135deg,#101114_0%,#17191d_100%)] py-16 text-background lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 max-w-3xl">
              <Badge className="mb-4 border border-primary/20 bg-background/8 text-primary shadow-sm">
                Services terrain
              </Badge>
              <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
                Location, maintenance respiratoire et FIT TEST
              </h2>
              <p className="text-background/70">
                Le contenu de ces services est maintenant aligné sur les informations visibles sur
                epicap.com, sans blocs marketing fictifs.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
              <ServiceCard
                href="/location"
                icon={<Truck className="size-7 text-primary" />}
                title={serviceDetails.location.title}
                description={serviceDetails.location.description}
                bullets={serviceDetails.location.points.slice(0, 2)}
              />
              <ServiceCard
                href="/maintenance"
                icon={<Wrench className="size-7 text-primary" />}
                title={serviceDetails.maintenance.title}
                description={serviceDetails.maintenance.description}
                bullets={serviceDetails.maintenance.points.slice(0, 2)}
              />
              <ServiceCard
                href="/fit-test"
                icon={<ClipboardCheck className="size-7 text-primary" />}
                title={serviceDetails["fit-test"].title}
                description={serviceDetails["fit-test"].description}
                bullets={serviceDetails["fit-test"].points.slice(0, 2)}
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <Badge variant="secondary" className="mb-4 border border-border/60 shadow-sm">
                  À propos d&apos;Epicap
                </Badge>
                <h2 className="mb-6 text-3xl font-bold lg:text-4xl">
                  Fourniture, location et maintenance de matériel anti-amiante
                </h2>
                <p className="mb-8 leading-relaxed text-muted-foreground">
                  Le site Epicap présente l&apos;entreprise comme un spécialiste de la fourniture,
                  de la location et de la maintenance de matériel et d&apos;équipements de
                  protection contre l&apos;amiante et les autres polluants. Le siège social est
                  situé à {companyInfo.headOffice.city} et s&apos;appuie sur un réseau
                  d&apos;implantations en
                  France.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {companyOfferings.map((offering) => (
                    <div key={offering} className="rounded-[1.3rem] border border-border/70 bg-card p-4 shadow-[0_18px_45px_-34px_rgba(15,16,18,0.12)]">
                      <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/12">
                        <Shield className="size-5 text-primary" />
                      </div>
                      <p className="text-sm leading-relaxed">{offering}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.8rem] border border-border/70 bg-muted shadow-[0_28px_70px_-44px_rgba(15,16,18,0.26)]">
                  <Image src="/images/about-team.jpg" alt="Equipe Epicap" fill className="object-cover" />
                </div>
                <Card className="p-0">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12">
                        <Factory className="size-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Fabricants et solutions suivis</h3>
                        <p className="text-sm text-muted-foreground">
                          Marques et familles visibles sur les catalogues Epicap
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
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,rgba(15,16,18,0.03),transparent_38%)] py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-end justify-between gap-6">
              <div>
                <Badge variant="secondary" className="mb-4 border border-border/60 shadow-sm">
                  Nos agences
                </Badge>
                <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Implantations Epicap</h2>
                <p className="text-muted-foreground">
                  Escaudain, Rhône-Alpes, Île-de-France, Est, Normandie, Sud-Est, Grand-Ouest et
                  Sud-Ouest.
                </p>
              </div>

              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/agences">
                  Voir toutes les agences
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {agencies.map((agency) => (
                <Link
                  key={agency.slug}
                  href={`/agences/${agency.slug}`}
                  className="group rounded-[1.4rem] border border-border/70 bg-card p-5 shadow-[0_18px_45px_-34px_rgba(15,16,18,0.12)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_62px_-34px_rgba(255,133,28,0.26)]"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/12">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{agency.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {agency.address}, {agency.postalCode} {agency.city}
                  </p>
                  <p className="mt-4 text-sm font-medium">{agency.phone}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(135deg,#ff851c_0%,#ff9a2f_100%)] py-16 text-primary-foreground lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Besoin d&apos;un conseil ou d&apos;un devis chantier ?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-primary-foreground/78">
              Le projet reprend maintenant les coordonnées principales d&apos;Epicap et ses pages
              agences, contact, maintenance, location et FIT TEST.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/devis?source=home">
                  Demander un devis
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                  <Phone className="mr-2 size-4" />
                  {companyInfo.phone}
                </a>
              </Button>
            </div>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

function ServiceCard({
  icon,
  title,
  description,
  bullets,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  bullets: readonly string[]
  href: string
}) {
  return (
    <Card className="border border-background/10 bg-background/5 p-0 text-background backdrop-blur-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/18">
          {icon}
        </div>
        <h3 className="mb-3 text-xl font-semibold">{title}</h3>
        <p className="mb-5 leading-relaxed text-background/70">{description}</p>

        <div className="mb-6 space-y-3">
          {bullets.map((bullet) => (
            <div key={bullet} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 text-primary" />
              <p className="text-sm text-background/72">{bullet}</p>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          asChild
          className="border-background/18 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          <Link href={href}>
            En savoir plus
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
