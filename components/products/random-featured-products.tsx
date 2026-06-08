"use client"

import * as React from "react"

import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/data/products"

function shuffleProducts(products: Product[]) {
  const shuffled = [...products]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentProduct = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = currentProduct
  }

  return shuffled
}

export function RandomFeaturedProducts({
  products,
  limit = 4,
}: {
  products: Product[]
  limit?: number
}) {
  const [visibleProducts, setVisibleProducts] = React.useState(() => products.slice(0, limit))

  React.useEffect(() => {
    setVisibleProducts(shuffleProducts(products).slice(0, limit))
  }, [products, limit])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
