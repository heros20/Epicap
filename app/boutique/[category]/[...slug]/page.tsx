"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Minus,
  Phone,
  Plus,
  Shield,
  ShoppingCart,
  Truck,
} from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { companyInfo } from "@/lib/data/company"
import { getProductBySlug, getRelatedProducts, type Product } from "@/lib/data/products"
import { categories, type Category } from "@/lib/data/navigation"
import { useCart } from "@/lib/cart/use-cart"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{
    category: string
    slug: string[]
  }>
}

type PageParams = Awaited<PageProps["params"]>
type Subcategory = Category["subcategories"][number]

export default function ProductPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = React.useState<PageParams | null>(null)

  React.useEffect(() => {
    void params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return <ProductPageSkeleton />
  }

  const productSlug = resolvedParams.slug[resolvedParams.slug.length - 1]
  if (!productSlug) {
    notFound()
  }

  const product = getProductBySlug(productSlug)
  if (!product) {
    notFound()
  }

  const category = categories.find((item) => item.slug === resolvedParams.category)
  const subcategory = category?.subcategories.find((item) => item.slug === product.subcategorySlug)
  const relatedProducts = getRelatedProducts(product.id)

  return (
    <ProductPageContent
      product={product}
      categorySlug={resolvedParams.category}
      category={category}
      subcategory={subcategory}
      relatedProducts={relatedProducts}
    />
  )
}

function ProductPageContent({
  product,
  categorySlug,
  category,
  subcategory,
  relatedProducts,
}: {
  product: Product
  categorySlug: string
  category?: Category
  subcategory?: Subcategory
  relatedProducts: Product[]
}) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = React.useState(1)
  const [isAdded, setIsAdded] = React.useState(false)
  const hasDocuments = product.documents.length > 0

  const handleAddToCart = () => {
    addItem(product, quantity)
    setIsAdded(true)
    window.setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.1),rgba(255,255,255,0)_72%)]">
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
                        <Link href={`/boutique/${categorySlug}?subcategory=${subcategory.slug}`}>
                          {subcategory.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[240px] truncate">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <ProductGallery product={product} />

              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {product.isNew && <Badge className="bg-primary">Nouveau</Badge>}
                  {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
                  {product.isRentable && (
                    <Badge variant="outline">
                      <Truck className="mr-1 size-3" />
                      Disponible en location
                    </Badge>
                  )}
                </div>

                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{product.brand}</span>
                  <span>|</span>
                  <span className="font-mono">Ref: {product.sku}</span>
                </div>

                <h1 className="mb-4 text-2xl font-bold lg:text-3xl">{product.name}</h1>
                <p className="mb-6 text-muted-foreground">{product.shortDescription}</p>

                <div className="mb-6">
                  {product.price > 0 ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-primary">
                        {product.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {product.compareAtPrice.toLocaleString("fr-FR")} EUR
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">HT</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-primary">Sur devis</span>
                    </div>
                  )}
                  {product.isRentable && product.rentalPriceDaily && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      ou <span className="font-medium">{product.rentalPriceDaily} EUR / jour</span>{" "}
                      en location
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  {product.inStock ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-5" />
                      <span className="font-medium">En stock</span>
                      <span className="text-muted-foreground">
                        {product.stockQuantity >= 999
                          ? "(disponibilité à confirmer)"
                          : `(${product.stockQuantity} disponibles)`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-warning">
                      <Clock className="size-5" />
                      <span className="font-medium">Sur commande</span>
                      <span className="text-muted-foreground">(délai à confirmer)</span>
                    </div>
                  )}
                </div>

                <AddToCartSection
                  product={product}
                  quantity={quantity}
                  setQuantity={setQuantity}
                  onAddToCart={handleAddToCart}
                  isAdded={isAdded}
                />

                <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-8">
                  <ReassuranceItem
                    icon={<Truck className="size-5 text-muted-foreground" />}
                    title="Logistique chantier"
                    description="Expédition ou retrait en agence selon la référence"
                  />
                  <ReassuranceItem
                    icon={<Shield className="size-5 text-muted-foreground" />}
                    title="Usage professionnel"
                    description="Gammes Epicap dédiées amiante et polluants"
                  />
                  <ReassuranceItem
                    icon={<Phone className="size-5 text-muted-foreground" />}
                    title="Conseil expert"
                    description={companyInfo.phone}
                  />
                  <ReassuranceItem
                    icon={<FileText className="size-5 text-muted-foreground" />}
                    title="Devis"
                    description="Étude de besoin et tarification sur demande"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.06),rgba(255,255,255,0)_72%)] py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="h-auto w-full flex-wrap justify-start gap-0 rounded-none border-b bg-transparent p-0">
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
                {hasDocuments && (
                  <TabsTrigger
                    value="documents"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Documents
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="shipping"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Livraison & service
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="pt-6">
                <Card className="p-0">
                  <CardContent className="p-6">
                    <FormattedProductText text={product.description} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs" className="pt-6">
                {product.specs.length > 0 ? (
                  <Card className="p-0">
                    <Table>
                      <TableBody>
                        {product.specs.map((spec) => (
                          <TableRow key={spec.name}>
                            <TableCell className="w-1/3 font-medium">{spec.name}</TableCell>
                            <TableCell>{spec.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <Card className="p-0">
                    <CardContent className="p-6 text-sm text-muted-foreground">
                      Caractéristiques détaillées non structurées sur cette fiche catalogue.
                      {hasDocuments
                        ? " Consultez les documents liés ci-dessous pour compléter la fiche."
                        : " Contactez Epicap pour la documentation produit complète."}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {hasDocuments && (
                <TabsContent value="documents" className="pt-6">
                  <Card className="p-0">
                    <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
                      {product.documents.map((document) => (
                        <div
                          key={`${document.url}-${document.name}`}
                          className="flex flex-col rounded-2xl border border-border/70 bg-muted/20 p-4"
                        >
                          <div className="mb-4 flex flex-wrap items-center gap-2">
                            {document.fileType && (
                              <Badge variant="secondary" className="rounded-full">
                                {document.fileType}
                              </Badge>
                            )}
                            {document.sizeLabel && (
                              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                {document.sizeLabel}
                              </span>
                            )}
                          </div>
                          <div className="mb-5 space-y-2">
                            <p className="text-base font-semibold leading-tight">{document.name}</p>
                            {document.description && (
                              <p className="text-sm leading-6 text-muted-foreground">
                                {document.description}
                              </p>
                            )}
                          </div>
                          <Button asChild variant="outline" className="mt-auto w-full rounded-xl">
                            <a href={document.url} target="_blank" rel="noreferrer">
                              <Download className="mr-2 size-4" />
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="shipping" className="pt-6">
                <div className="prose max-w-none">
                  <h4>Livraison</h4>
                  <ul>
                    <li>Expédition selon disponibilité produit et préparation atelier</li>
                    <li>Retrait possible en agence Epicap selon la référence</li>
                    <li>Matériel lourd et location traités sur devis ou transport dédié</li>
                    <li>Services respiratoires et FIT TEST organisés via le réseau Epicap</li>
                  </ul>
                  <h4>Retour et accompagnement</h4>
                  <p>
                    Contactez Epicap avant tout retour pour vérifier la reprise possible selon la
                    famille de produit, la personnalisation et l&apos;état du matériel.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="mb-6 text-2xl font-bold">Produits complémentaires</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                {relatedProducts.slice(0, 4).map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-[linear-gradient(135deg,#ff851c_0%,#ff9c3d_100%)] py-12 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-2xl font-bold">Besoin d&apos;un conseil ?</h2>
            <p className="mx-auto mb-6 max-w-xl text-primary-foreground/80">
              Les équipes Epicap peuvent orienter votre choix entre vente, location, maintenance
              respiratoire, FIT TEST ou retrait en agence.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/devis">Demander un devis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
  )
}

function FormattedProductText({ text }: { text: string }) {
  const sections = text
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean)

  return (
    <div className="space-y-4 text-sm leading-7 text-foreground/90">
      {sections.map((section, index) => {
        const lines = section
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
        const isList = lines.length > 1 && lines.every((line) => /^[\-•]/.test(line))

        if (isList) {
          return (
            <ul key={`${index}-${section.slice(0, 24)}`} className="space-y-2 text-muted-foreground">
              {lines.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 size-1.5 rounded-full bg-primary" />
                  <span>{line.replace(/^[\-•]\s*/, "")}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={`${index}-${section.slice(0, 24)}`} className="whitespace-pre-line text-muted-foreground">
            {section}
          </p>
        )
      })}
    </div>
  )
}

function ProductGallery({ product }: { product: Product }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const images = product.images.length > 0 ? product.images : [product.image]

  return (
    <div className="space-y-4">
      <div className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
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

        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex((index) => (index === 0 ? images.length - 1 : index - 1))
              }
              className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() =>
                setSelectedIndex((index) => (index === images.length - 1 ? 0 : index + 1))
              }
              className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {product.compareAtPrice && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
          </Badge>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "size-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                selectedIndex === index ? "border-primary" : "border-transparent",
              )}
            >
              <div className="relative size-full bg-muted">
                <Image
                  src={image}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AddToCartSection({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  isAdded,
}: {
  product: Product
  quantity: number
  setQuantity: (q: number | ((prev: number) => number)) => void
  onAddToCart: () => void
  isAdded: boolean
}) {
  const maxSelectableQuantity = product.stockQuantity >= 999 ? 20 : product.stockQuantity

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantité</span>
        <div className="flex items-center rounded-lg border">
          <button
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex size-10 items-center justify-center transition-colors hover:bg-muted"
            disabled={quantity <= 1}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((value) => Math.min(maxSelectableQuantity, value + 1))}
            className="flex size-10 items-center justify-center transition-colors hover:bg-muted"
            disabled={quantity >= maxSelectableQuantity}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1"
          onClick={onAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart className="mr-2 size-4" />
          {isAdded ? "Ajouté au panier" : "Ajouter au panier"}
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/devis">Devis</Link>
        </Button>
      </div>

      {product.isRentable && (
        <Card className="bg-muted/50 p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Disponible en location</p>
                <p className="text-xs text-muted-foreground">
                  {product.rentalPriceDaily
                    ? `A partir de ${product.rentalPriceDaily} EUR / jour`
                    : "Tarif location sur demande"}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/location?product=${product.slug}`}>Louer</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReassuranceItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ProductPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-xl bg-muted" />
            <div className="space-y-4">
              <div className="h-6 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
