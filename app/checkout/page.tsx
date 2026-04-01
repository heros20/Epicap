"use client"

import Link from "next/link"
import { ArrowRight, FileText, Package2 } from "lucide-react"

import { OrderRequestForm } from "@/components/forms/order-request-form"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
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
import { useCart } from "@/lib/cart/use-cart"

export default function CheckoutPage() {
  const { items, itemCount } = useCart()

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-12">
            <Card className="mx-auto max-w-2xl p-0">
              <CardContent className="space-y-6 px-6 py-12 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
                  <Package2 className="size-8" />
                </div>
                <div>
                  <h1 className="mb-3 text-3xl font-bold">Aucun article a finaliser</h1>
                  <p className="text-base leading-7 text-muted-foreground">
                    Ajoutez des references au panier ou basculez directement vers une demande de devis.
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/boutique">Acceder au catalogue</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/devis?source=checkout-empty">Demander un devis</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.18),transparent_30%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/">Accueil</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/panier">Panier</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Checkout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
                  Validation commande
                </Badge>
                <h1 className="mb-3 text-4xl font-bold tracking-tight">
                  Transmettre une vraie demande de commande
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  Le checkout cree maintenant une demande traçable dans le back-office Epicap.
                  Le stock, la logistique chantier et les conditions B2B sont verifies avant
                  confirmation finale.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full px-4 py-1.5">{itemCount} article(s)</Badge>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/devis?cart=1&source=checkout-hero">
                    Basculer en devis
                    <FileText className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <OrderRequestForm />
          </div>
        </section>

        <section className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(255,255,255,0)_72%)] py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 md:grid-cols-3">
              <ValueCard
                title="Commande reliee au dashboard"
                description="La reference retournee est consultable cote commandes et pilotage."
              />
              <ValueCard
                title="Logistique chantier filtree"
                description="Les familles lourdes, louables ou sur devis repassent en validation manuelle."
              />
              <ValueCard
                title="Conditions B2B conservees"
                description="Remises societe, paiement de compte et contexte chantier restent rattaches a la demande."
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-0">
      <CardContent className="space-y-3 p-6">
        <p className="text-base font-semibold">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        <ArrowRight className="size-4 text-primary" />
      </CardContent>
    </Card>
  )
}
