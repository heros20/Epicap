import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductPageClient } from "@/components/products/product-page-client"
import {
  getCatalogProductBySlug,
  getRelatedCatalogProducts,
} from "@/lib/catalog/data"
import { categories } from "@/lib/data/navigation"

interface PageProps {
  params: Promise<{
    category: string
    slug: string[]
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const productSlug = slug[slug.length - 1]

  if (!productSlug) {
    return { title: "Produit introuvable" }
  }

  const product = await getCatalogProductBySlug(productSlug)
  if (!product) {
    return { title: "Produit introuvable" }
  }

  return {
    title: `${product.name} | Boutique`,
    description: product.shortDescription,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { category: categorySlug, slug } = await params
  const productSlug = slug[slug.length - 1]

  if (!productSlug) {
    notFound()
  }

  const product = await getCatalogProductBySlug(productSlug)
  if (!product || product.categorySlug !== categorySlug) {
    notFound()
  }

  const expectedSubcategory = product.subcategorySlug
  const providedSubcategory = slug.length > 1 ? slug[0] : undefined
  if ((expectedSubcategory ?? undefined) !== (providedSubcategory ?? undefined)) {
    notFound()
  }

  const category = categories.find((item) => item.slug === categorySlug)
  const subcategory = category?.subcategories.find((item) => item.slug === product.subcategorySlug)
  const relatedProducts = await getRelatedCatalogProducts(product)

  return (
    <ProductPageClient
      product={product}
      category={category}
      subcategory={subcategory}
      relatedProducts={relatedProducts}
    />
  )
}
