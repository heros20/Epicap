import generatedCatalog from "./epicap-catalog.generated.json"

export interface ProductDocument {
  name: string
  description: string
  url: string
  sizeLabel: string
  fileName: string
  fileType: string
  path?: string
}

export interface Product {
  id: number
  sku: string
  slug: string
  name: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice?: number
  categorySlug: string
  categoryName: string
  subcategorySlug?: string
  brand: string
  image: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  isNew?: boolean
  isFeatured?: boolean
  isRentable?: boolean
  rentalPriceDaily?: number
  badge?: string
  specs: { name: string; value: string }[]
  documents: ProductDocument[]
  relatedProducts?: number[]
  sourceUrl?: string
}

type RawProduct = Omit<Product, "subcategorySlug" | "badge" | "sourceUrl" | "documents"> & {
  subcategorySlug?: string | null
  badge?: string | null
  sourceUrl?: string | null
  documents?: ProductDocument[] | null
}

export const products: Product[] = (generatedCatalog.products as RawProduct[]).map((product) => ({
  ...product,
  subcategorySlug: product.subcategorySlug ?? undefined,
  badge: product.badge ?? undefined,
  sourceUrl: product.sourceUrl ?? undefined,
  documents: product.documents ?? [],
}))

export const brands = [...new Set(products.map((product) => product.brand))].sort()

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((product) => product.categorySlug === categorySlug)
}

export function getProductsBySubcategory(categorySlug: string, subcategorySlug: string): Product[] {
  return products.filter(
    (product) =>
      product.categorySlug === categorySlug && product.subcategorySlug === subcategorySlug,
  )
}

export function getFeaturedProducts(): Product[] {
  const featuredProducts = products.filter((product) => product.isFeatured)
  if (featuredProducts.length > 0) {
    return featuredProducts
  }

  return products.slice(0, 12)
}

export function getRelatedProducts(productId: number): Product[] {
  const product = products.find((item) => item.id === productId)
  if (!product) {
    return []
  }

  if (product.relatedProducts?.length) {
    return products.filter((item) => product.relatedProducts?.includes(item.id))
  }

  const bySubcategory = products.filter(
    (item) => item.id !== productId && item.subcategorySlug && item.subcategorySlug === product.subcategorySlug,
  )
  if (bySubcategory.length > 0) {
    return bySubcategory.slice(0, 4)
  }

  return products
    .filter((item) => item.id !== productId && item.categorySlug === product.categorySlug)
    .slice(0, 4)
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.shortDescription.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.documents.some(
        (document) =>
          document.name.toLowerCase().includes(lowerQuery) ||
          document.description.toLowerCase().includes(lowerQuery),
      ),
  )
}
