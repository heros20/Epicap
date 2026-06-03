import { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"
import {
  getCatalogBrands,
  getCatalogProducts,
  getCatalogProductsByCategory,
  searchCatalogProducts,
} from "@/lib/catalog/data"
import { sortCatalogProducts } from "@/lib/catalog/sort"
import { categories } from "@/lib/data/navigation"

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    subcategory?: string
    query?: string
    sort?: string
    brands?: string
    inStock?: string
    rentable?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: categorySlug } = await params
  const category = categories.find((item) => item.slug === categorySlug)

  if (!category) {
    return { title: "Catégorie non trouvée" }
  }

  return {
    title: `${category.name} | Boutique`,
    description: category.description,
  }
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }))
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category: categorySlug } = await params
  const resolvedSearchParams = await searchParams

  const category = categories.find((item) => item.slug === categorySlug)
  if (!category) {
    notFound()
  }

  const selectedSubcategory = resolvedSearchParams.subcategory
    ? category.subcategories.find((subcategory) => subcategory.slug === resolvedSearchParams.subcategory)
    : undefined

  const allProducts = await getCatalogProducts()
  const availableBrands = await getCatalogBrands()
  let categoryProducts = await getCatalogProductsByCategory(categorySlug)
  const query = resolvedSearchParams.query?.trim()

  if (selectedSubcategory) {
    categoryProducts = categoryProducts.filter(
      (product) => product.subcategorySlug === selectedSubcategory.slug,
    )
  }

  if (query) {
    const matchingIds = new Set((await searchCatalogProducts(query)).map((product) => product.id))
    categoryProducts = categoryProducts.filter((product) => matchingIds.has(product.id))
  }

  if (resolvedSearchParams.brands) {
    const selectedBrands = resolvedSearchParams.brands.split(",")
    categoryProducts = categoryProducts.filter((product) => selectedBrands.includes(product.brand))
  }

  if (resolvedSearchParams.inStock === "true") {
    categoryProducts = categoryProducts.filter((product) => product.inStock)
  }

  if (resolvedSearchParams.rentable === "true") {
    categoryProducts = categoryProducts.filter((product) => product.isRentable)
  }

  if (resolvedSearchParams.minPrice) {
    categoryProducts = categoryProducts.filter(
      (product) => product.price >= Number(resolvedSearchParams.minPrice),
    )
  }

  if (resolvedSearchParams.maxPrice) {
    categoryProducts = categoryProducts.filter(
      (product) => product.price <= Number(resolvedSearchParams.maxPrice),
    )
  }

  categoryProducts = sortCatalogProducts(categoryProducts, resolvedSearchParams.sort)

  const maxPrice = Math.max(...allProducts.map((product) => product.price), 5000)
  const filterResetHref = selectedSubcategory
    ? `/boutique/${categorySlug}?subcategory=${selectedSubcategory.slug}`
    : `/boutique/${categorySlug}`

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
                  <BreadcrumbLink asChild>
                    <Link href="/boutique">Boutique</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{category.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
                  {query
                    ? `Résultats dans ${selectedSubcategory ? selectedSubcategory.name : category.name}`
                    : selectedSubcategory
                      ? selectedSubcategory.name
                      : category.name}
                </h1>
                <p className="text-muted-foreground">
                  {query
                    ? `Recherche active : "${query}". Les résultats restent limités à cette gamme.`
                    : selectedSubcategory
                    ? `${selectedSubcategory.name} dans la gamme ${category.name.toLowerCase()}.`
                    : category.description}
                </p>
              </div>

              {selectedSubcategory && (
                <Link
                  href={`/boutique/${category.slug}`}
                  className="rounded-full border border-border/70 bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/35 hover:text-primary"
                >
                  Voir toute la gamme
                </Link>
              )}
            </div>
          </div>
        </section>

        {category.subcategories.length > 0 && (
          <section className="border-b border-border/70 bg-background/70 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <h2 className="mb-4 text-sm font-medium text-muted-foreground">Sous-catégories</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {category.subcategories.map((subcategory) => {
                  const isActive = selectedSubcategory?.slug === subcategory.slug

                  return (
                    <Link
                      key={subcategory.slug}
                      href={`/boutique/${categorySlug}?subcategory=${subcategory.slug}`}
                    >
                      <Card className="group rounded-[1.35rem] border-border/70 bg-card/92 p-0 shadow-[0_14px_34px_-28px_rgba(35,29,28,0.25)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_55px_-34px_rgba(255,133,28,0.35)]">
                        <CardContent
                          className={`flex items-center justify-between p-4 ${
                            isActive ? "text-primary" : ""
                          }`}
                        >
                          <span className="text-sm font-medium">{subcategory.name}</span>
                          <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <Suspense fallback={<div className="hidden w-64 flex-shrink-0 lg:block" />}>
                <ProductFilters
                  currentCategory={categorySlug}
                  currentSubcategory={selectedSubcategory?.slug}
                  availableBrands={availableBrands}
                  priceRange={[
                    Number(resolvedSearchParams.minPrice) || 0,
                    Number(resolvedSearchParams.maxPrice) || maxPrice,
                  ]}
                  maxPrice={maxPrice}
                />
              </Suspense>

              <div className="min-w-0 flex-1">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {categoryProducts.length} produit{categoryProducts.length > 1 ? "s" : ""}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                      <Suspense fallback={null}>
                        <ProductFilters
                          currentCategory={categorySlug}
                          currentSubcategory={selectedSubcategory?.slug}
                          availableBrands={availableBrands}
                          priceRange={[
                            Number(resolvedSearchParams.minPrice) || 0,
                            Number(resolvedSearchParams.maxPrice) || maxPrice,
                          ]}
                          maxPrice={maxPrice}
                        />
                      </Suspense>
                    </div>

                    <SortSelect currentSort={resolvedSearchParams.sort} />
                  </div>
                </div>

                <ActiveFilterChips
                  brands={resolvedSearchParams.brands}
                  inStock={resolvedSearchParams.inStock}
                  rentable={resolvedSearchParams.rentable}
                  minPrice={resolvedSearchParams.minPrice}
                  maxPrice={resolvedSearchParams.maxPrice}
                  query={resolvedSearchParams.query}
                  resetHref={filterResetHref}
                />

                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Aucun produit dans cette catégorie pour le moment.
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full">
                      <Link href={filterResetHref}>Réinitialiser les filtres</Link>
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
              <h2 className="mb-4 text-2xl font-bold">{category.name}</h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Cette gamme regroupe des produits et services Epicap liés à{" "}
                  {category.name.toLowerCase()}.
                </p>
                <p>
                  Besoin d&apos;une configuration plus précise pour un chantier SS3 ou SS4 ? Nos pages
                  agences, devis, location, maintenance respiratoire et FIT TEST vous orientent vers
                  la solution adaptée.
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
