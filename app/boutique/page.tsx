import { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ActiveFilterChips } from "@/components/products/active-filter-chips"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import { SortSelect } from "@/components/products/sort-select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  getCatalogBrands,
  getCatalogProducts,
  searchCatalogProducts,
} from "@/lib/catalog/data"
import { sortCatalogProducts } from "@/lib/catalog/sort"
import { categories } from "@/lib/data/navigation"

export const metadata: Metadata = {
  title: "Catalogue | Gammes Epicap",
  description:
    "Catalogue Epicap inspiré des familles officielles : protection respiratoire, EPI, décontamination, extracteurs EPIAIR, confinement, emballages, brumisation, mesures et déplombage.",
}

interface PageProps {
  searchParams: Promise<{
    query?: string
    sort?: string
    brands?: string
    inStock?: string
    rentable?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function BoutiquePage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.query?.trim()
  const allProducts = await getCatalogProducts()
  const availableBrands = await getCatalogBrands()
  let filteredProducts = query ? await searchCatalogProducts(query) : [...allProducts]

  if (params.brands) {
    const selectedBrands = params.brands.split(",")
    filteredProducts = filteredProducts.filter((product) => selectedBrands.includes(product.brand))
  }

  if (params.inStock === "true") {
    filteredProducts = filteredProducts.filter((product) => product.inStock)
  }

  if (params.rentable === "true") {
    filteredProducts = filteredProducts.filter((product) => product.isRentable)
  }

  if (params.minPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price >= Number(params.minPrice))
  }

  if (params.maxPrice) {
    filteredProducts = filteredProducts.filter((product) => product.price <= Number(params.maxPrice))
  }

  filteredProducts = sortCatalogProducts(filteredProducts, params.sort)

  const maxPrice = Math.max(...allProducts.map((product) => product.price), 5000)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Accueil</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Boutique</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <h1 className="mt-4 mb-2 text-3xl font-bold lg:text-4xl">
              {query ? `Résultats pour "${query}"` : "Catalogue Epicap"}
            </h1>
            <p className="max-w-3xl text-muted-foreground">
              {query
                ? "La recherche parcourt les références produit, les descriptions, les marques et les documents associés du catalogue."
                : "Explorez les produits et prestations Epicap pour vos chantiers de désamiantage, dépollution, protection respiratoire et décontamination."}
            </p>
          </div>
        </section>

        <section className="border-b border-border/70 bg-background/70 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/boutique/${category.slug}`}
                  className="flex-shrink-0 rounded-full border border-border/70 bg-card/88 px-4 py-2 text-sm font-medium shadow-[0_12px_28px_-24px_rgba(35,29,28,0.22)] transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                >
                  {category.shortName}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <Suspense fallback={<div className="hidden w-64 flex-shrink-0 lg:block" />}>
                <ProductFilters
                  availableBrands={availableBrands}
                  priceRange={[Number(params.minPrice) || 0, Number(params.maxPrice) || maxPrice]}
                  maxPrice={maxPrice}
                />
              </Suspense>

              <div className="min-w-0 flex-1">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                      <Suspense fallback={null}>
                        <ProductFilters
                          availableBrands={availableBrands}
                          priceRange={[
                            Number(params.minPrice) || 0,
                            Number(params.maxPrice) || maxPrice,
                          ]}
                          maxPrice={maxPrice}
                        />
                      </Suspense>
                    </div>

                    <SortSelect currentSort={params.sort} />
                  </div>
                </div>

                <ActiveFilterChips
                  brands={params.brands}
                  inStock={params.inStock}
                  rentable={params.rentable}
                  minPrice={params.minPrice}
                  maxPrice={params.maxPrice}
                  query={params.query}
                  resetHref="/boutique"
                />

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Aucun produit ne correspond à vos critères.
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full">
                      <Link href="/boutique">Réinitialiser les filtres</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h2 className="mb-4 text-2xl font-bold">Gammes et services officiels Epicap</h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Retrouvez les grandes familles Epicap : protection respiratoire, équipements de
                  protection individuelle, décontamination, extracteurs EPIAIR, aspirateurs Type H,
                  confinement, emballages, brumisation, instrumentation et déplombage.
                </p>
                <p>
                  Pour un besoin de location, maintenance respiratoire ou FIT TEST, nos pages
                  services vous guident vers les informations et les contacts adaptés.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
