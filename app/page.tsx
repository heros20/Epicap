import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
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
import { RandomFeaturedProducts } from "@/components/products/random-featured-products"
import { JsonLd } from "@/components/seo/json-ld"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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

const quickLinks = [
  {
    label: "Masques",
    href: "/boutique/equipements-de-protection-respiratoire",
  },
  {
    label: "Extracteurs EPIAIR",
    href: "/boutique/extracteurs-d-air-epiair",
  },
  {
    label: "Combinaisons",
    href: "/boutique/equipements-de-protection-individuelle?query=combinaison",
  },
  {
    label: "Sas",
    href: "/boutique/decontamination?query=sas",
  },
  {
    label: "Sacs & Big bags",
    href: "/boutique/emballages",
  },
]

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
  const featuredProducts = await getFeaturedCatalogProducts()
  const rentableProducts = catalogProducts.filter((product) => product.isRentable).slice(0, 3)
  const inStockProducts = catalogProducts.filter((product) => product.inStock).slice(0, 3)
  const heroProducts = featuredProducts.slice(0, 3)
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
      <div className="flex min-h-screen flex-col bg-background">
        <Header />

        <main className="flex-1">
          <section className="border-b border-border/70 bg-[linear-gradient(180deg,#f7f8fa_0%,#ffffff_64%)]">
            <div className="container mx-auto px-4 py-8 lg:py-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:items-center">
                <div className="min-w-0">
                  <Badge className="mb-4 rounded-md border border-primary/20 bg-primary/10 text-primary">
                    Vente, location et maintenance
                  </Badge>
                  <h1 className="max-w-5xl text-4xl font-bold leading-tight tracking-normal text-foreground lg:text-6xl">
                    EPICAP Matériels de désamiantage
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground lg:text-lg">
                    Équipements de protection individuelle et collective contre l&apos;amiante et
                    autres polluants, disponibles à la vente, en maintenance et en location.
                  </p>

                  <div className="mt-7 max-w-3xl rounded-lg border border-border/70 bg-card p-3 shadow-[0_22px_58px_-42px_rgba(15,16,18,0.28)]">
                    <HeaderSearchBox className="w-full" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-md border border-border/70 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Button asChild size="lg" className="rounded-md px-5">
                      <Link href="/boutique">
                        <ShoppingCart className="size-4" />
                        Parcourir le catalogue
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-md px-5">
                      <Link href="/catalogues">
                        <BookOpen className="size-4" />
                        Consulter les catalogues
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-md px-5">
                      <Link href="/devis?source=home-modern-hero">
                        Demander un devis
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-7 grid max-w-3xl gap-3 sm:grid-cols-3">
                    <ProofItem value={String(catalogProducts.length)} label="references catalogue" />
                    <ProofItem value={String(agencies.length)} label="agences en France" />
                    <ProofItem value="Vente + location" label="pour chantiers SS3/SS4" />
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="relative overflow-hidden rounded-lg border border-border/70 bg-[#111317] p-5 text-background shadow-[0_28px_80px_-54px_rgba(15,16,18,0.42)]">
                    <div className="grid gap-4 sm:grid-cols-[1fr_150px] sm:items-center">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                          Selection immediate
                        </p>
                        <h2 className="mt-3 text-2xl font-bold">Equipements prioritaires</h2>
                        <p className="mt-2 text-sm leading-6 text-background/72">
                          Les produits a verifier en premier pour preparer une commande ou un devis.
                        </p>
                      </div>
                      <Image
                        src="/images/hero-equipment.jpg"
                        alt="Materiel Epicap pour chantier"
                        width={360}
                        height={300}
                        priority
                        className="h-36 w-full rounded-md object-cover sm:h-40"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {heroProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/boutique/${product.categorySlug}/${product.subcategorySlug ? `${product.subcategorySlug}/` : ""}${product.slug}`}
                        className="group rounded-lg border border-border/70 bg-card p-3 shadow-[0_16px_40px_-34px_rgba(15,16,18,0.24)] transition-colors hover:border-primary/40"
                      >
                        <div className="relative aspect-square rounded-md bg-[radial-gradient(circle_at_top,#ffffff,#eef1f5)]">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          ) : null}
                        </div>
                        <p className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.price > 0 ? `${product.price.toLocaleString("fr-FR")} EUR HT` : "Sur devis"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="border-b border-border/70 py-8">
            <div className="container mx-auto px-4">
              <SectionHeader
                eyebrow="Orientation rapide"
                title="Choisir par besoin chantier"
                href="/boutique"
                cta="Toutes les gammes"
              />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {categories.slice(0, 8).map((category) => {
                  const categoryImage = categoryImages.get(category.slug)

                  return (
                    <Link
                      key={category.slug}
                      href={`/boutique/${category.slug}`}
                      className="group grid min-h-32 grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-lg border border-border/70 bg-card p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="relative overflow-hidden rounded-md bg-[radial-gradient(circle_at_top,#ffffff,#eef1f5)]">
                        {categoryImage ? (
                          <Image
                            src={categoryImage.src}
                            alt={categoryImage.alt}
                            fill
                            className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                          {category.shortName}
                        </p>
                        <h2 className="mt-2 line-clamp-2 text-sm font-semibold leading-5">
                          {category.name}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <SectionHeader
                    eyebrow="Catalogue"
                    title="References mises en avant"
                    href="/boutique"
                    cta="Voir plus"
                  />
                  <RandomFeaturedProducts products={featuredProducts} limit={4} />
                </div>

                <aside className="rounded-lg border border-border/70 bg-[linear-gradient(180deg,#111317,#1b1f25)] p-5 text-background">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Achat assiste
                  </p>
                  <h2 className="mt-3 text-2xl font-bold">Vous avez une liste d&apos;articles ?</h2>
                  <p className="mt-3 text-sm leading-6 text-background/72">
                    Transmettez votre besoin, une reference ou un panier chantier. L&apos;equipe
                    Epicap peut orienter la demande vers la bonne agence.
                  </p>
                  <div className="mt-5 grid gap-2">
                    <Button asChild className="justify-between rounded-md">
                      <Link href="/devis?source=home-modern-panel">
                        Demander un devis
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="justify-between rounded-md border-background/20 bg-transparent text-background hover:bg-background/10 hover:text-background"
                    >
                      <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                        {companyInfo.phone}
                        <Phone className="size-4" />
                      </a>
                    </Button>
                  </div>
                  <div className="mt-5 space-y-3 border-t border-background/10 pt-5">
                    {companyOfferings.slice(0, 3).map((offering) => (
                      <div key={offering} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <p className="text-sm leading-6 text-background/74">{offering}</p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <section className="border-y border-border/70 bg-[#f7f8fa] py-10">
            <div className="container mx-auto px-4">
              <div className="grid gap-8 lg:grid-cols-2">
                <CompactProductList
                  title="Disponible en stock"
                  eyebrow="Commande rapide"
                  href="/boutique?inStock=true"
                  products={inStockProducts}
                />
                <CompactProductList
                  title="Materiel en location"
                  eyebrow="Besoin temporaire"
                  href="/location"
                  products={rentableProducts}
                />
              </div>
            </div>
          </section>

          <section className="py-10">
            <div className="container mx-auto px-4">
              <SectionHeader
                eyebrow="Services terrain"
                title="Achat, location et conformite au meme endroit"
                href="/contact"
                cta="Contacter Epicap"
              />
              <div className="grid gap-4 md:grid-cols-3">
                <ServiceTile
                  href="/location"
                  icon={<Truck className="size-5" />}
                  title={serviceDetails.location.title}
                  description={serviceDetails.location.description}
                />
                <ServiceTile
                  href="/maintenance"
                  icon={<Wrench className="size-5" />}
                  title={serviceDetails.maintenance.title}
                  description={serviceDetails.maintenance.description}
                />
                <ServiceTile
                  href="/fit-test"
                  icon={<ClipboardCheck className="size-5" />}
                  title={serviceDetails["fit-test"].title}
                  description={serviceDetails["fit-test"].description}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-border/70 bg-[linear-gradient(180deg,#ffffff,#f7f8fa)] py-10">
            <div className="container mx-auto px-4">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Reseau Epicap
                  </p>
                  <h2 className="mt-2 text-3xl font-bold">Une agence pour suivre votre demande</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                    Siege a {companyInfo.headOffice.city}, interlocuteurs regionaux et services
                    dedies aux equipements anti-amiante.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  <ActionLink href="/agences" icon={<MapPin className="size-4" />} label="Trouver une agence" />
                  <ActionLink href="/devis?source=home-modern-footer" icon={<ShieldCheck className="size-4" />} label="Demander un devis" />
                  <ActionLink href="/contact" icon={<Building2 className="size-4" />} label="Contacter Epicap" />
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

function ProofItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
      <p className="text-lg font-bold">{value}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{label}</p>
    </div>
  )
}

function SectionHeader({
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
      <Button asChild variant="outline" className="hidden rounded-md sm:inline-flex">
        <Link href={href}>
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}

function CompactProductList({
  title,
  eyebrow,
  href,
  products,
}: {
  title: string
  eyebrow: string
  href: string
  products: Awaited<ReturnType<typeof getCatalogProducts>>
}) {
  return (
    <div>
      <SectionHeader eyebrow={eyebrow} title={title} href={href} cta="Voir la selection" />
      <div className="grid gap-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/boutique/${product.categorySlug}/${product.subcategorySlug ? `${product.subcategorySlug}/` : ""}${product.slug}`}
            className="grid grid-cols-[84px_minmax(0,1fr)_auto] items-center gap-4 rounded-lg border border-border/70 bg-card p-3 transition-colors hover:border-primary/40"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-[radial-gradient(circle_at_top,#ffffff,#eef1f5)]">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill className="object-contain p-2" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{product.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{product.brand}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function ServiceTile({
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
      className="group block rounded-lg border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="mb-5 flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
        En savoir plus
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ActionLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button asChild variant="outline" className="justify-between rounded-md">
      <Link href={href}>
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  )
}
