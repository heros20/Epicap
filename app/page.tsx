import Link from "next/link"
import Image from "next/image"
import { 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Truck,
  Shield,
  Wrench,
  MapPin,
  Phone,
  Clock,
  Users,
  Award,
  Package
} from "lucide-react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { categories, agencies } from "@/lib/data/navigation"

// Mock featured products (will be replaced by Supabase data)
const featuredProducts = [
  {
    id: 1,
    name: "Aspirateur THE Nilfisk Attix 761-2M XC",
    slug: "aspirateur-the-nilfisk-attix-761",
    category: "Aspirateurs",
    price: 2890,
    compareAtPrice: 3200,
    image: "/images/products/aspirateur-the.jpg",
    inStock: true,
    isNew: true,
  },
  {
    id: 2,
    name: "Combinaison Tyvek Classic Xpert Type 5/6",
    slug: "combinaison-tyvek-classic-xpert",
    category: "EPI",
    price: 8.90,
    image: "/images/products/combinaison-tyvek.jpg",
    inStock: true,
    badge: "Best-seller",
  },
  {
    id: 3,
    name: "Extracteur d'air THE 3000 m³/h",
    slug: "extracteur-air-the-3000",
    category: "Extracteurs",
    price: 1850,
    image: "/images/products/extracteur-the.jpg",
    inStock: true,
    isRentable: true,
  },
  {
    id: 4,
    name: "Masque complet 3M série 6800",
    slug: "masque-complet-3m-6800",
    category: "EPI",
    price: 189,
    image: "/images/products/masque-3m.jpg",
    inStock: true,
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-foreground via-foreground to-foreground/95 text-background overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 py-16 lg:py-24 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                  Plus de 30 ans d&apos;expertise
                </Badge>
                
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-balance">
                  Votre partenaire{" "}
                  <span className="text-primary">désamiantage</span>{" "}
                  et équipements pros
                </h1>
                
                <p className="text-lg text-background/80 max-w-lg leading-relaxed">
                  Epicap vous accompagne dans tous vos projets de désamiantage et dépollution. 
                  Vente et location de matériel professionnel certifié.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="text-base">
                    <Link href="/boutique">
                      Découvrir nos produits
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-base border-background/20 text-background hover:bg-background/10 hover:text-background">
                    <Link href="/devis">
                      Demander un devis
                    </Link>
                  </Button>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    <span className="text-sm">Stock disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-primary" />
                    <span className="text-sm">7 agences en France</span>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative hidden lg:block">
                <div className="relative aspect-square max-w-lg mx-auto">
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl transform rotate-6"></div>
                  <div className="absolute inset-0 bg-card rounded-3xl overflow-hidden">
                    <Image
                      src="/images/hero-equipment.jpg"
                      alt="Équipement professionnel de désamiantage"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -left-4 bg-card text-card-foreground p-4 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">+2000</p>
                        <p className="text-xs text-muted-foreground">Références disponibles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nos catégories de produits</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez notre gamme complète d&apos;équipements pour le désamiantage et la dépollution
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {categories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/boutique/${category.slug}`}
                  className={`group relative overflow-hidden rounded-xl bg-card border transition-all hover:shadow-lg hover:border-primary/20 ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <div className={`aspect-square ${index === 0 ? "md:aspect-auto md:h-full" : ""} relative`}>
                    {/* Placeholder gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                      <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 lg:p-4 transform transition-transform group-hover:-translate-y-1">
                        <h3 className={`font-semibold mb-1 ${index === 0 ? "text-lg lg:text-xl" : "text-sm lg:text-base"}`}>
                          {category.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center gap-1 text-primary text-sm mt-2 font-medium">
                          <span>Voir les produits</span>
                          <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Produits phares</h2>
                <p className="text-muted-foreground">
                  Les équipements les plus demandés par nos clients professionnels
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/boutique">
                  Voir tout le catalogue
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/boutique">
                  Voir tout le catalogue
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 lg:py-24 bg-foreground text-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nos services</h2>
              <p className="text-background/70 max-w-2xl mx-auto">
                Au-delà de la vente, nous vous accompagnons avec des services adaptés à vos besoins
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <Card className="bg-background/5 border-background/10 text-background p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Truck className="size-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Location de matériel</h3>
                  <p className="text-background/70 mb-4 leading-relaxed">
                    Location courte et longue durée d&apos;équipements professionnels : 
                    aspirateurs, extracteurs, unités de décontamination.
                  </p>
                  <Button variant="outline" asChild className="border-background/20 text-background hover:bg-background/10 hover:text-background">
                    <Link href="/location">
                      En savoir plus
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-background/5 border-background/10 text-background p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Wrench className="size-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Maintenance & SAV</h3>
                  <p className="text-background/70 mb-4 leading-relaxed">
                    Service après-vente réactif et maintenance préventive 
                    pour garantir la performance de vos équipements.
                  </p>
                  <Button variant="outline" asChild className="border-background/20 text-background hover:bg-background/10 hover:text-background">
                    <Link href="/maintenance">
                      En savoir plus
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-background/5 border-background/10 text-background p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="size-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                    <Users className="size-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Formation</h3>
                  <p className="text-background/70 mb-4 leading-relaxed">
                    Formations à l&apos;utilisation du matériel de désamiantage 
                    pour une utilisation optimale et sécurisée.
                  </p>
                  <Button variant="outline" asChild className="border-background/20 text-background hover:bg-background/10 hover:text-background">
                    <Link href="/formation">
                      En savoir plus
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">Pourquoi nous choisir</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                  L&apos;expertise au service de votre sécurité
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Depuis plus de 30 ans, Epicap accompagne les professionnels du BTP 
                  dans leurs projets de désamiantage et dépollution. Notre expertise 
                  et notre réseau d&apos;agences nous permettent de vous offrir un service 
                  de proximité et de qualité.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="size-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">+30 ans d&apos;expertise</h4>
                      <p className="text-sm text-muted-foreground">Leader français du désamiantage</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="size-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">7 agences en France</h4>
                      <p className="text-sm text-muted-foreground">Proximité et réactivité</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="size-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">+2000 références</h4>
                      <p className="text-sm text-muted-foreground">Catalogue complet en stock</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="size-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Produits certifiés</h4>
                      <p className="text-sm text-muted-foreground">Conformes aux normes en vigueur</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-muted">
                  <Image
                    src="/images/about-team.jpg"
                    alt="Équipe Epicap"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Stats card */}
                <div className="absolute -bottom-6 -right-6 bg-card border shadow-xl rounded-xl p-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">98%</p>
                    <p className="text-sm text-muted-foreground">Clients satisfaits</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ce que disent nos clients</h2>
              <p className="text-muted-foreground">
                La satisfaction de nos clients est notre priorité
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card p-0">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">{testimonial.author[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.author}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Agencies Preview */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">Nos agences</h2>
                <p className="text-muted-foreground">
                  Un réseau de proximité pour mieux vous servir
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href="/agences">
                  Voir toutes les agences
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {agencies.map((agency) => (
                <Link
                  key={agency.slug}
                  href={`/agences/${agency.slug}`}
                  className="group p-4 rounded-xl border bg-card hover:border-primary/20 hover:shadow-md transition-all text-center"
                >
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{agency.city}</h3>
                  <p className="text-xs text-muted-foreground">{agency.name.split("/")[0].trim()}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/agences">
                  Voir toutes les agences
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Besoin d&apos;un devis personnalisé ?
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Nos experts sont à votre disposition pour étudier votre projet 
              et vous proposer les meilleures solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link href="/devis">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="text-base border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
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

// Product Card Component
function ProductCard({ product }: { product: typeof featuredProducts[number] }) {
  return (
    <Card className="group overflow-hidden p-0 gap-0">
      <Link href={`/boutique/produit/${product.slug}`}>
        <div className="aspect-square relative bg-muted overflow-hidden">
          {/* Product image placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary">Nouveau</Badge>
            )}
            {product.badge && (
              <Badge variant="secondary">{product.badge}</Badge>
            )}
            {product.isRentable && (
              <Badge variant="outline" className="bg-card">Location</Badge>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold">
              {product.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {product.compareAtPrice.toLocaleString("fr-FR")} €
              </span>
            )}
          </div>
          {product.inStock && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              En stock
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}

// Testimonials data
const testimonials = [
  {
    content: "Epicap est notre partenaire depuis 10 ans. La qualité du matériel et le service client sont irréprochables. Livraison toujours dans les temps.",
    author: "Marc Durand",
    company: "DésamiantPro - Lyon",
  },
  {
    content: "Le service de location nous permet de faire face aux pics d'activité sans investir. Les équipements sont toujours en parfait état.",
    author: "Sophie Martin",
    company: "BTP Services - Paris",
  },
  {
    content: "Très satisfait de la réactivité du SAV. Un extracteur en panne un vendredi, remplacé le lundi suivant. Bravo !",
    author: "Jean-Pierre Lefebvre",
    company: "Amiante Solutions - Nantes",
  },
]
