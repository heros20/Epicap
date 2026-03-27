import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, Truck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/data/products"

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const categoryPath = product.subcategorySlug 
    ? `${product.categorySlug}/${product.subcategorySlug}`
    : product.categorySlug

  return (
    <Card className={cn("group overflow-hidden p-0 gap-0 h-full", className)}>
      <Link href={`/boutique/${categoryPath}/${product.slug}`} className="flex flex-col h-full">
        <div className="aspect-square relative bg-muted overflow-hidden">
          {/* Product image */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-primary">Nouveau</Badge>
            )}
            {product.badge && (
              <Badge variant="secondary">{product.badge}</Badge>
            )}
            {product.isRentable && (
              <Badge variant="outline" className="bg-card">
                <Truck className="size-3 mr-1" />
                Location
              </Badge>
            )}
            {product.compareAtPrice && (
              <Badge className="bg-accent text-accent-foreground">
                -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
              </Badge>
            )}
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <Button size="sm" className="w-full" onClick={(e) => {
              e.preventDefault()
              // TODO: Add to cart logic
            }}>
              Ajouter au panier
            </Button>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {product.name}
          </h3>
          
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-bold">
                {product.price.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {product.compareAtPrice.toLocaleString("fr-FR")} €
                </span>
              )}
            </div>
            
            {product.isRentable && product.rentalPriceDaily && (
              <p className="text-xs text-muted-foreground mt-1">
                ou {product.rentalPriceDaily}€/jour en location
              </p>
            )}
            
            <div className="mt-2">
              {product.inStock ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  En stock
                </p>
              ) : (
                <p className="text-xs text-orange-600">
                  Sur commande
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
