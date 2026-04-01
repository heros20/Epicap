import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/data/products"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const categoryPath = product.subcategorySlug
    ? `${product.categorySlug}/${product.subcategorySlug}`
    : product.categorySlug

  return (
    <Card
      className={cn(
        "group h-full overflow-hidden rounded-[1.4rem] border-border/70 bg-card p-0 shadow-[0_18px_45px_-34px_rgba(15,16,18,0.16)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_62px_-34px_rgba(255,133,28,0.28)]",
        className,
      )}
    >
      <Link href={`/boutique/${categoryPath}/${product.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-[linear-gradient(180deg,rgba(255,133,28,0.08),rgba(15,16,18,0.02))]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60" />
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && <Badge className="shadow-sm">Nouveau</Badge>}
            {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
            {product.isRentable && (
              <Badge variant="outline" className="border-background/70 bg-background/92 backdrop-blur-sm">
                <Truck className="mr-1 size-3" />
                Location
              </Badge>
            )}
            {product.compareAtPrice && (
              <Badge className="bg-foreground text-background">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </Badge>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex h-9 w-full items-center justify-center rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-[0_14px_28px_-20px_rgba(255,133,28,0.55)]">
              Voir la fiche
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,133,28,0),rgba(15,16,18,0.06))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{product.brand}</p>
          <h3 className="mb-3 flex-1 text-sm font-medium transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          <div className="mt-auto">
            {product.price > 0 ? (
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-bold">
                  {product.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR
                </span>
                {product.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.compareAtPrice.toLocaleString("fr-FR")} EUR
                  </span>
                )}
              </div>
            ) : (
              <span className="text-lg font-bold">Sur devis</span>
            )}

            {product.isRentable && product.rentalPriceDaily && (
              <p className="mt-1 text-xs text-muted-foreground">
                ou {product.rentalPriceDaily} EUR / jour en location
              </p>
            )}

            <div className="mt-3">
              {product.inStock ? (
                <p className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="size-3" />
                  En stock
                </p>
              ) : (
                <p className="text-xs text-warning">Sur commande</p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
