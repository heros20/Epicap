import { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { ProductFilters } from "@/components/products/product-filters"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { products, brands as allBrands } from "@/lib/data/products"
import { categories } from "@/lib/data/navigation"

export const metadata: Metadata = {
  title: "Catalogue | Tous nos produits",
  description: "Découvrez notre gamme complète d'équipements pour le désamiantage et la dépollution. Plus de 2000 références disponibles.",
}

interface PageProps {
  searchParams: Promise<{
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
  
  // Filter products based on search params
  let filteredProducts = [...products]
  
  // Filter by brands
  if (params.brands) {
    const selectedBrands = params.brands.split(",")
    filteredProducts = filteredProducts.filter(p => selectedBrands.includes(p.brand))
  }
  
  // Filter by stock
  if (params.inStock === "true") {
    filteredProducts = filteredProducts.filter(p => p.inStock)
  }
  
  // Filter by rentable
  if (params.rentable === "true") {
    filteredProducts = filteredProducts.filter(p => p.isRentable)
  }
  
  // Filter by price range
  if (params.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(params.minPrice))
  }
  if (params.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(params.maxPrice))
  }
  
  // Sort products
  switch (params.sort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case "name":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "newest":
      filteredProducts = filteredProducts.filter(p => p.isNew).concat(
        filteredProducts.filter(p => !p.isNew)
      )
      break
    default:
      // Default: featured first
      filteredProducts = filteredProducts.filter(p => p.isFeatured).concat(
        filteredProducts.filter(p => !p.isFeatured)
      )
  }

  const maxPrice = Math.max(...products.map(p => p.price))

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/30 border-b">
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
            
            <h1 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">Tous nos produits</h1>
            <p className="text-muted-foreground max-w-2xl">
              Découvrez notre gamme complète d&apos;équipements professionnels pour le désamiantage, 
              la dépollution et la protection individuelle.
            </p>
          </div>
        </section>

        {/* Categories quick access */}
        <section className="border-b bg-background">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/boutique/${category.slug}`}
                  className="flex-shrink-0 px-4 py-2 rounded-full border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                >
                  {category.name.split(" ").slice(0, 2).join(" ")}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <Suspense fallback={<div className="hidden lg:block w-64 flex-shrink-0" />}>
                <ProductFilters 
                  priceRange={[
                    Number(params.minPrice) || 0, 
                    Number(params.maxPrice) || maxPrice
                  ]}
                  maxPrice={maxPrice}
                />
              </Suspense>

              {/* Products */}
              <div className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {/* Mobile filter button is rendered by ProductFilters */}
                    <div className="lg:hidden">
                      <Suspense fallback={null}>
                        <ProductFilters 
                          priceRange={[
                            Number(params.minPrice) || 0, 
                            Number(params.maxPrice) || maxPrice
                          ]}
                          maxPrice={maxPrice}
                        />
                      </Suspense>
                    </div>

                    <SortSelect currentSort={params.sort} />
                  </div>
                </div>

                {/* Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucun produit ne correspond à vos critères.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section className="py-12 bg-muted/30 border-t">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">
                Matériel professionnel de désamiantage
              </h2>
              <div className="prose prose-muted">
                <p>
                  Epicap vous propose un catalogue complet de plus de 2000 références 
                  pour vos chantiers de désamiantage et de dépollution. Retrouvez tous 
                  les équipements nécessaires : EPI (combinaisons, masques, gants), 
                  aspirateurs THE certifiés, extracteurs d&apos;air, unités de décontamination, 
                  matériel de confinement et bien plus.
                </p>
                <p>
                  Tous nos produits sont conformes aux normes en vigueur et sélectionnés 
                  auprès des meilleurs fabricants : 3M, DuPont, Nilfisk, Ruwac, Heylo...
                  Notre équipe d&apos;experts est à votre disposition pour vous conseiller 
                  dans le choix de vos équipements.
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

function SortSelect({ currentSort }: { currentSort?: string }) {
  return (
    <Select defaultValue={currentSort || "featured"}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="featured">Mis en avant</SelectItem>
        <SelectItem value="newest">Nouveautés</SelectItem>
        <SelectItem value="price-asc">Prix croissant</SelectItem>
        <SelectItem value="price-desc">Prix décroissant</SelectItem>
        <SelectItem value="name">Nom A-Z</SelectItem>
      </SelectContent>
    </Select>
  )
}
