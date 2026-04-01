"use client"

import * as React from "react"
import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  FileText,
  Minus,
  Package2,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { safeTrack } from "@/lib/analytics/events"
import { useCart } from "@/lib/cart/use-cart"
import { getPricingSnapshot } from "@/lib/commerce/pricing"
import { companyInfo } from "@/lib/data/company"
import type { CartItem } from "@/lib/cart/cart-context"

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

function formatPrice(value: number) {
  return priceFormatter.format(value)
}

function formatPriceOrQuote(value: number) {
  return value > 0 ? formatPrice(value) : "Sur devis"
}

export default function CartPage() {
  const { profile } = useAuth()
  const { items, removeItem, updateQuantity, clearCart, itemCount } = useCart()
  const companyDiscountRate = Number(profile?.company?.discount_percentage ?? 0)
  const pricing = React.useMemo(
    () =>
      getPricingSnapshot(
        items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        companyDiscountRate,
      ),
    [companyDiscountRate, items],
  )

  React.useEffect(() => {
    safeTrack("Cart Viewed", {
      cart_items: items.length,
      logistics_mode: pricing.logisticsMode,
      quote_only_items: pricing.hasQuoteOnlyItems,
      company_discount_rate: companyDiscountRate || undefined,
    })
  }, [companyDiscountRate, items.length, pricing.hasQuoteOnlyItems, pricing.logisticsMode])

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,133,28,0.14),transparent_36%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)]">
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
                    <BreadcrumbPage>Panier</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="mx-auto max-w-3xl py-10 text-center lg:py-16">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
                  <Package2 className="size-8" />
                </div>
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
                  Parcours d&apos;achat Epicap
                </Badge>
                <h1 className="mb-4 text-4xl font-bold tracking-tight">Votre panier est vide</h1>
                <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground">
                  Ajoutez des references du catalogue vente ou preparez directement une demande de
                  devis pour vos besoins chantier.
                </p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="/boutique">
                      Acceder au catalogue
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/devis?source=cart-empty">Demander un devis</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 pb-10 md:grid-cols-3">
                <ServiceHighlight
                  icon={<Truck className="size-5 text-primary" />}
                  title="Logistique chantier"
                  description="Livraison standard ou retrait agence selon la famille produit."
                />
                <ServiceHighlight
                  icon={<ShieldCheck className="size-5 text-primary" />}
                  title="Selection pro"
                  description="References Epicap dediees a l'amiante, au plomb et aux polluants."
                />
                <ServiceHighlight
                  icon={<Phone className="size-5 text-primary" />}
                  title="Conseil commercial"
                  description={companyInfo.phone}
                />
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const freeShippingProgress =
    pricing.shippingThreshold && pricing.shippingThreshold > 0
      ? Math.min((pricing.subtotal / pricing.shippingThreshold) * 100, 100)
      : 100

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.16),transparent_28%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)]">
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
                  <BreadcrumbPage>Panier</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
                  Preparation de commande
                </Badge>
                <h1 className="mb-3 text-4xl font-bold tracking-tight">
                  Verifier les quantites avant validation
                </h1>
                <p className="text-base leading-7 text-muted-foreground">
                  Le panier tient maintenant compte des remises B2B et des contraintes logistiques.
                  Les references lourdes, louables ou sur devis peuvent etre redirigees vers une
                  validation manuelle.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full px-4 py-1.5">{itemCount} article(s)</Badge>
                <Badge variant="outline" className="rounded-full px-4 py-1.5">
                  {pricing.logisticsMode === "manual"
                    ? "Logistique chantier a confirmer"
                    : "Logistique standard estimee"}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-6">
                <Card className="overflow-hidden p-0">
                  <CardHeader className="border-b border-border/70 bg-muted/18">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Articles selectionnes</CardTitle>
                        <CardDescription>
                          {items.length} ligne(s) de commande prêtes a etre transmises.
                        </CardDescription>
                      </div>
                      <Button variant="ghost" onClick={clearCart} className="rounded-full">
                        Vider le panier
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {items.map((item, index) => (
                      <div key={item.product.id}>
                        {index > 0 && <Separator />}
                        <CartLineItem
                          item={item}
                          onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                          onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                          onRemove={() => removeItem(item.product.id)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="ghost" className="justify-start rounded-full px-0">
                    <Link href="/boutique">Continuer vos achats</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/devis?cart=1&source=cart">
                      Basculer en demande de devis
                      <FileText className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <ServiceHighlight
                    icon={<Truck className="size-5 text-primary" />}
                    title="Expedition chantier"
                    description="Livraison standard, retrait agence ou validation transport dedie."
                  />
                  <ServiceHighlight
                    icon={<ShieldCheck className="size-5 text-primary" />}
                    title="Conformite usage pro"
                    description="Materiels adaptes aux environnements amiante, confinement et decontamination."
                  />
                  <ServiceHighlight
                    icon={<Phone className="size-5 text-primary" />}
                    title="Validation commerciale"
                    description="Epicap peut arbitrer entre achat, devis et location."
                  />
                </div>
              </div>

              <div className="lg:sticky lg:top-28 lg:self-start">
                <Card className="overflow-hidden p-0">
                  <div className="bg-[linear-gradient(135deg,#101114_0%,#17191d_100%)] px-6 py-6 text-background">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-background/60">
                      Resume commande
                    </p>
                    <h2 className="text-2xl font-bold">Pret pour le checkout</h2>
                    <p className="mt-2 text-sm leading-6 text-background/72">
                      Les montants deviennent pilotables et les exceptions logistiques remontent
                      maintenant clairement.
                    </p>
                  </div>

                  <CardContent className="space-y-6 p-6">
                    {pricing.logisticsMode === "estimated" && pricing.shippingThreshold ? (
                      <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Seuil livraison offerte</span>
                          <span className="font-semibold">{formatPrice(pricing.shippingThreshold)}</span>
                        </div>
                        <Progress value={freeShippingProgress} />
                        <p className="text-sm text-muted-foreground">
                          {pricing.remainingForFreeShipping && pricing.remainingForFreeShipping > 0
                            ? `Plus que ${formatPrice(pricing.remainingForFreeShipping)} HT pour debloquer la livraison offerte.`
                            : "Le seuil de livraison offerte est atteint."}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                        La logistique est a confirmer car le panier contient au moins une reference
                        louable, une famille a transport specifique ou un article sur devis.
                      </div>
                    )}

                    <div className="space-y-3 text-sm">
                      <SummaryRow label="Sous-total HT" value={formatPrice(pricing.subtotal)} />
                      <SummaryRow
                        label="Remise societe"
                        value={
                          pricing.discountAmount > 0
                            ? `-${formatPrice(pricing.discountAmount)}`
                            : "Aucune"
                        }
                      />
                      <SummaryRow
                        label="Logistique"
                        value={
                          pricing.logisticsMode === "manual"
                            ? "A confirmer"
                            : pricing.shippingAmount === 0
                              ? "Offerte"
                              : formatPrice(pricing.shippingAmount)
                        }
                        valueClassName={
                          pricing.logisticsMode === "manual" || pricing.shippingAmount === 0
                            ? "text-success"
                            : undefined
                        }
                      />
                      <SummaryRow label="TVA estimee (20%)" value={formatPrice(pricing.taxAmount)} />
                      <Separator />
                      <SummaryRow
                        label="Total estime"
                        value={
                          pricing.hasQuoteOnlyItems
                            ? "Affinage commercial"
                            : formatPrice(pricing.total)
                        }
                        className="text-base font-semibold text-foreground"
                        valueClassName="text-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Button asChild className="w-full" size="lg">
                        <Link href="/checkout">
                          Proceder au checkout
                          <ArrowRight className="ml-2 size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full" size="lg">
                        <Link href="/devis?cart=1&source=cart">Demander un devis</Link>
                      </Button>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <p className="mb-2 text-sm font-semibold">Conditions B2B</p>
                      <p className="mb-4 text-sm leading-6 text-muted-foreground">
                        {profile?.company?.payment_terms
                          ? `Conditions de compte: ${profile.company.payment_terms}.`
                          : "Aucune condition societe appliquee actuellement."}
                      </p>
                      <Button asChild variant="ghost" className="h-auto rounded-full px-0 text-primary">
                        <a
                          href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
                          onClick={() => safeTrack("Phone Clicked", { source_page: "cart" })}
                        >
                          <Phone className="mr-2 size-4" />
                          {companyInfo.phone}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function CartLineItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  item: CartItem
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
}) {
  const maxSelectableQuantity = item.product.stockQuantity >= 999 ? 20 : item.product.stockQuantity
  const categoryPath = item.product.subcategorySlug
    ? `${item.product.categorySlug}/${item.product.subcategorySlug}`
    : item.product.categorySlug

  return (
    <div className="grid gap-5 p-6 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
      <Link
        href={`/boutique/${categoryPath}/${item.product.slug}`}
        className="relative aspect-square overflow-hidden rounded-[1.4rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(15,16,18,0.02))]"
      >
        {item.product.image ? (
          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
      </Link>

      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {item.product.brand}
            </p>
            {item.product.isRentable && <Badge variant="secondary">Location</Badge>}
            {item.product.documents.length > 0 && <Badge variant="outline">Docs disponibles</Badge>}
          </div>

          <Link
            href={`/boutique/${categoryPath}/${item.product.slug}`}
            className="block text-lg font-semibold leading-snug transition-colors hover:text-primary"
          >
            {item.product.name}
          </Link>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Ref. {item.product.sku}</span>
            <span>{item.product.inStock ? "En stock" : "Sur commande"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full border border-border/80 bg-background">
            <button
              onClick={onDecrease}
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
              disabled={item.quantity <= 1}
              aria-label="Diminuer la quantite"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              onClick={onIncrease}
              className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
              disabled={item.quantity >= maxSelectableQuantity}
              aria-label="Augmenter la quantite"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <Button variant="ghost" onClick={onRemove} className="rounded-full text-muted-foreground">
            <Trash2 className="mr-2 size-4 text-destructive" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 md:flex-col md:items-end">
        <div className="space-y-1 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Prix unitaire
          </p>
          <p className="text-sm font-medium text-foreground">
            {formatPriceOrQuote(item.product.price)}
          </p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Total ligne
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatPriceOrQuote(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  className,
  valueClassName,
}: {
  label: string
  value: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

function ServiceHighlight({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="gap-4 rounded-[1.4rem] border-border/70 bg-card/90 p-0">
      <CardContent className="p-5">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/12">
          {icon}
        </div>
        <p className="mb-2 text-base font-semibold">{title}</p>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
