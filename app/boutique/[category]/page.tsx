import { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArrowRight } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"
import { getProductsByCategory, products } from "@/lib/data/products"
import { categories } from "@/lib/data/navigation"

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{
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
  const category = categories.find(c => c.slug === categorySlug)
  
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
  const searchParamsResolved = await searchParams
  
  const category = categories.find(c => c.slug === categorySlug)
  
  if (!category) {
    notFound()
  }

  // Get products for this category
  let categoryProducts = getProductsByCategory(categorySlug)
  
  // Apply filters
  if (searchParamsResolved.brands) {
    const selectedBrands = searchParamsResolved.brands.split(",")
    categoryProducts = categoryProducts.filter(p => selectedBrands.includes(p.brand))
  }
  
  if (searchParamsResolved.inStock === "true") {
    categoryProducts = categoryProducts.filter(p => p.inStock)
  }
  
  if (searchParamsResolved.rentable === "true") {
    categoryProducts = categoryProducts.filter(p => p.isRentable)
  }
  
  if (searchParamsResolved.minPrice) {
    categoryProducts = categoryProducts.filter(p => p.price >= Number(searchParamsResolved.minPrice))
  }
  if (searchParamsResolved.maxPrice) {
    categoryProducts = categoryProducts.filter(p => p.price <= Number(searchParamsResolved.maxPrice))
  }
  
  // Sort
  switch (searchParamsResolved.sort) {
    case "price-asc":
      categoryProducts.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      categoryProducts.sort((a, b) => b.price - a.price)
      break
    case "name":
      categoryProducts.sort((a, b) => a.name.localeCompare(b.name))
      break
    case "newest":
      categoryProducts = categoryProducts.filter(p => p.isNew).concat(
        categoryProducts.filter(p => !p.isNew)
      )
      break
    default:
      categoryProducts = categoryProducts.filter(p => p.isFeatured).concat(
        categoryProducts.filter(p => !p.isFeatured)
      )
  }

  const maxPrice = Math.max(...products.map(p => p.price), 5000)

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
            
            <h1 className="text-3xl lg:text-4xl font-bold mt-4 mb-2">{category.name}</h1>
            <p className="text-muted-foreground max-w-2xl">
              {category.description}
            </p>
          </div>
        </section>

        {/* Subcategories */}
        {category.subcategories.length > 0 && (
          <section className="border-b bg-background">
            <div className="container mx-auto px-4 py-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-4">Sous-catégories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/boutique/${categorySlug}/${sub.slug}`}
                  >
                    <Card className="p-0 hover:border-primary/20 hover:shadow-md transition-all group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {sub.name}
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <Suspense fallback={<div className="hidden lg:block w-64 flex-shrink-0" />}>
                <ProductFilters 
                  currentCategory={categorySlug}
                  priceRange={[
                    Number(searchParamsResolved.minPrice) || 0, 
                    Number(searchParamsResolved.maxPrice) || maxPrice
                  ]}
                  maxPrice={maxPrice}
                />
              </Suspense>

              {/* Products */}
              <div className="flex-1 min-w-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    {categoryProducts.length} produit{categoryProducts.length > 1 ? "s" : ""}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="lg:hidden">
                      <Suspense fallback={null}>
                        <ProductFilters 
                          currentCategory={categorySlug}
                          priceRange={[
                            Number(searchParamsResolved.minPrice) || 0, 
                            Number(searchParamsResolved.maxPrice) || maxPrice
                          ]}
                          maxPrice={maxPrice}
                        />
                      </Suspense>
                    </div>

                    <Select defaultValue={searchParamsResolved.sort || "featured"}>
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
                  </div>
                </div>

                {/* Grid */}
                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucun produit dans cette catégorie pour le moment.</p>
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
              <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
              <div className="prose prose-muted">
                <p>
                  Découvrez notre sélection de {category.name.toLowerCase()} pour vos chantiers 
                  de désamiantage et de dépollution. Tous nos produits sont conformes aux normes 
                  en vigueur et sélectionnés auprès des meilleurs fabricants.
                </p>
                <p>
                  Besoin d&apos;un conseil ? Notre équipe d&apos;experts est à votre disposition 
                  pour vous accompagner dans le choix de vos équipements. Contactez-nous au 
                  01 45 13 72 00 ou demandez un devis personnalisé.
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
