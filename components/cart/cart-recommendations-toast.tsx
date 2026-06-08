"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/use-cart"
import {
  type CartRecommendation,
  getProductHref,
} from "@/lib/cart/cart-recommendations"

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

export function CartRecommendationsToast({
  addedLine,
  recommendations,
}: {
  addedLine: string
  recommendations: CartRecommendation[]
}) {
  const { addItem } = useCart()
  const [addedProductIds, setAddedProductIds] = React.useState<number[]>([])

  const handleAddRecommendation = (recommendation: CartRecommendation) => {
    addItem(recommendation.product, 1)
    setAddedProductIds((current) =>
      current.includes(recommendation.product.id)
        ? current
        : [...current, recommendation.product.id],
    )
  }

  return (
    <div className="space-y-3">
      <p>{addedLine}</p>

      {recommendations.length > 0 ? (
        <div className="space-y-2 rounded-md border border-border/70 bg-muted/35 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Souvent vendu avec
            </p>
            <Link href="/panier" className="text-xs font-semibold text-primary hover:underline">
              Voir panier
            </Link>
          </div>

          <div className="space-y-2">
            {recommendations.map((recommendation) => {
              const isAdded = addedProductIds.includes(recommendation.product.id)

              return (
                <div
                  key={recommendation.product.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md bg-background/85 p-2"
                >
                  <div className="min-w-0">
                    <Link
                      href={getProductHref(recommendation.product)}
                      className="line-clamp-2 text-xs font-medium text-foreground hover:text-primary"
                    >
                      {recommendation.product.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {recommendation.reason}
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {priceFormatter.format(recommendation.product.price)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant={isAdded ? "secondary" : "outline"}
                    className="h-8 shrink-0 px-2 text-xs"
                    onClick={() => handleAddRecommendation(recommendation)}
                  >
                    {isAdded ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                    {isAdded ? "Ajouté" : "Ajouter"}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <Link href="/panier" className="inline-flex text-xs font-semibold text-primary hover:underline">
          Voir le panier
        </Link>
      )}
    </div>
  )
}
