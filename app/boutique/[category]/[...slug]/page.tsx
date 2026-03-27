"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { 
  CheckCircle2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Shield,
  Phone,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { getProductBySlug, getRelatedProducts, products } from "@/lib/data/products"
import { categories } from "@/lib/data/navigation"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ 
    category: string
    slug: string[] 
  }>
}

export default function ProductPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = React.useState<{ category: string; slug: string[] } | null>(null)
  
  React.useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return <ProductPageSkeleton />
  }

  // The slug array can be [subcategory, product] or just [product]
  const productSlug = resolvedParams.slug[resolvedParams.slug.length - 1]
  const product = getProductBySlug(productSlug)

  if (!product) {
    notFound()
  }

  const category = categories.find(c => c.slug === resolvedParams.category)
  const subcategory = category?.subcategories.find(s => s.slug === product.subcategorySlug)
  const relatedProducts = getRelatedProducts(product.id)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-4">
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
                {category && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={`/boutique/${category.slug}`}>{category.name}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                {subcategory && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={`/boutique/${resolvedParams.category}/${subcategory.slug}`}>
                          {subcategory.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[200px] truncate">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        {/* Product Detail */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Gallery */}
              <ProductGallery product={product} />

              {/* Product Info */}
              <div>
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.isNew && <Badge className="bg-primary">Nouveau</Badge>}
                  {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                  {product.isRentable && (
                    <Badge variant="outline">
                      <Truck className="size-3 mr-1" />
                      Disponible en location
                    </Badge>
                  )}
                </div>

                {/* Brand & SKU */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="font-medium">{product.brand}</span>
                  <span>|</span>
                  <span className="font-mono">Réf: {product.sku}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-bold mb-4">{product.name}</h1>

                {/* Short Description */}
                <p className="text-muted-foreground mb-6">{product.shortDescription}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {product.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.compareAtPrice.toLocaleString("fr-FR")} €
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">HT</span>
                  </div>
                  {product.isRentable && product.rentalPriceDaily && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ou <span className="font-medium">{product.rentalPriceDaily}€/jour</span> en location
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div className="mb-6">
                  {product.inStock ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="size-5" />
                      <span className="font-medium">En stock</span>
                      <span className="text-muted-foreground">
                        ({product.stockQuantity} disponibles)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="size-5" />
                      <span className="font-medium">Sur commande</span>
                      <span className="text-muted-foreground">(délai 5-10 jours)</span>
                    </div>
                  )}
                </div>

                {/* Add to Cart */}
                <AddToCartSection product={product} />

                {/* Reassurance */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Truck className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Livraison rapide</p>
                      <p className="text-xs text-muted-foreground">Expédition sous 24-48h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Shield className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Produit certifié</p>
                      <p className="text-xs text-muted-foreground">Conforme aux normes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Phone className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Conseil expert</p>
                      <p className="text-xs text-muted-foreground">01 45 13 72 00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Devis gratuit</p>
                      <p className="text-xs text-muted-foreground">Réponse sous 24h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="py-8 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 border-b rounded-none">
                <TabsTrigger 
                  value="description"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="specs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Caractéristiques
                </TabsTrigger>
                <TabsTrigger 
                  value="shipping"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Livraison
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="pt-6">
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="specs" className="pt-6">
                <Card className="p-0">
                  <Table>
                    <TableBody>
                      {product.specs.map((spec, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium w-1/3">{spec.name}</TableCell>
                          <TableCell>{spec.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
              
              <TabsContent value="shipping" className="pt-6">
                <div className="prose max-w-none">
                  <h4>Livraison</h4>
                  <ul>
                    <li>Expédition sous 24-48h pour les produits en stock</li>
                    <li>Livraison gratuite dès 500€ HT d&apos;achat</li>
                    <li>Livraison en France métropolitaine et DOM-TOM</li>
                    <li>Possibilité de retrait en agence</li>
                  </ul>
                  <h4>Retours</h4>
                  <p>
                    Vous disposez de 14 jours pour retourner un produit non utilisé 
                    dans son emballage d&apos;origine.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-6">Produits complémentaires</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Besoin d&apos;un conseil ?</h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-6">
              Nos experts sont à votre disposition pour vous accompagner dans le choix 
              de vos équipements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/devis">Demander un devis</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="tel:0145137200">
                  <Phone className="mr-2 size-4" />
                  01 45 13 72 00
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ProductGallery({ product }: { product: ReturnType<typeof getProductBySlug> }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  
  if (!product) return null
  
  const images = product.images.length > 0 ? product.images : [product.image]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative bg-muted rounded-xl overflow-hidden group">
        {images[selectedIndex] ? (
          <Image
            src={images[selectedIndex]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
        )}
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelectedIndex(i => i === 0 ? images.length - 1 : i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => setSelectedIndex(i => i === images.length - 1 ? 0 : i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Discount badge */}
        {product.compareAtPrice && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </Badge>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 size-20 rounded-lg overflow-hidden border-2 transition-colors",
                selectedIndex === index ? "border-primary" : "border-transparent"
              )}
            >
              <div className="relative size-full bg-muted">
                {image && (
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AddToCartSection({ product }: { product: ReturnType<typeof getProductBySlug> }) {
  const [quantity, setQuantity] = React.useState(1)

  if (!product) return null

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantité</span>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="size-10 flex items-center justify-center hover:bg-muted transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
            className="size-10 flex items-center justify-center hover:bg-muted transition-colors"
            disabled={quantity >= product.stockQuantity}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button size="lg" className="flex-1">
          <ShoppingCart className="size-4 mr-2" />
          Ajouter au panier
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/devis">Devis</Link>
        </Button>
      </div>

      {/* Rental option */}
      {product.isRentable && (
        <Card className="p-0 bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Disponible en location</p>
                <p className="text-xs text-muted-foreground">
                  à partir de {product.rentalPriceDaily}€/jour
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/location?product=${product.slug}`}>
                  Louer
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-10 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
