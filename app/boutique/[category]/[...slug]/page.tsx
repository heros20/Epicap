import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductPageClient } from "@/components/products/product-page-client"
import { JsonLd } from "@/components/seo/json-ld"
import {
  getCatalogProductBySlug,
  getCatalogProductHref,
  getRelatedCatalogProducts,
} from "@/lib/catalog/data"
import { companyInfo } from "@/lib/data/company"
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
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
      type: "website",
    },
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
  const productUrl = `https://epicap.com${getCatalogProductHref(product)}`
  const productStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    description: product.shortDescription,
    image: product.image ? [product.image] : undefined,
    category: category?.name,
    offers:
      product.price > 0
        ? {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: product.price,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            url: productUrl,
            seller: {
              "@type": "Organization",
              name: companyInfo.brandName,
            },
          }
        : undefined,
    url: productUrl,
  }

  return (
    <>
      <JsonLd data={productStructuredData} />
      <ProductPageClient
        product={product}
        category={category}
        subcategory={subcategory}
        relatedProducts={relatedProducts}
      />
    </>
  )
}
