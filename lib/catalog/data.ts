import { cache } from "react"

import {
  buildCatalogProductHref,
  getCatalogCategoryMeta,
} from "@/lib/catalog/shared"
import { normalizeBrandLabel } from "@/lib/catalog/normalize"
import { matchesSearchText } from "@/lib/catalog/search"
import {
  products as generatedProducts,
  type Product,
  type ProductDocument,
} from "@/lib/data/products"
import { createClient } from "@/lib/supabase/server"
import type { Database, Json } from "@/types/supabase"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

export interface CatalogEntry extends Product {
  isActive: boolean
  createdAt: string
  updatedAt: string
  subcategoryName?: string
}

const PUBLIC_PRODUCT_SELECT = [
  "id",
  "sku",
  "slug",
  "name",
  "short_description",
  "description",
  "price",
  "compare_at_price",
  "category_slug",
  "subcategory_slug",
  "brand",
  "image",
  "images",
  "in_stock",
  "is_active",
  "is_featured",
  "is_new",
  "is_rentable",
  "rental_price_daily",
  "badge",
  "specs",
  "documents",
  "stock_quantity",
  "related_product_ids",
  "source_url",
  "created_at",
  "updated_at",
].join(", ")

const uniqueFallbackSlugCounts = new Map<string, number>()
const uniqueFallbackSkuCounts = new Map<string, number>()

function makeUniqueKey(value: string, counts: Map<string, number>) {
  const nextCount = (counts.get(value) ?? 0) + 1
  counts.set(value, nextCount)

  if (nextCount === 1) {
    return value
  }

  return `${value}-${nextCount}`
}

const fallbackCatalog: CatalogEntry[] = generatedProducts.map((product) => {
  const slug = makeUniqueKey(product.slug, uniqueFallbackSlugCounts)
  const sku = makeUniqueKey(product.sku, uniqueFallbackSkuCounts)
  const { subcategoryName } = getCatalogCategoryMeta(product.categorySlug, product.subcategorySlug)

  return {
    ...product,
    slug,
    sku,
    brand: normalizeBrandLabel(product.brand),
    documents: product.documents.map((document) => ({ ...document })),
    images: [...product.images],
    specs: product.specs.map((spec) => ({ ...spec })),
    isActive: true,
    createdAt: "",
    updatedAt: "",
    subcategoryName,
  }
})

function asRecord(value: Json | null | undefined) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null
}

function asString(value: Json | undefined) {
  return typeof value === "string" ? value : undefined
}

function asStringArray(value: Json | null | undefined) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string")
}

function normalizeProductDocuments(value: Json | null | undefined): ProductDocument[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const record = asRecord(item)
      if (!record) {
        return null
      }

      const document: ProductDocument = {
        name: asString(record.name) ?? "Document",
        description: asString(record.description) ?? "",
        url: asString(record.url) ?? "",
        sizeLabel: asString(record.sizeLabel) ?? "",
        fileName: asString(record.fileName) ?? "",
        fileType: asString(record.fileType) ?? "",
        path: asString(record.path),
      }

      return document
    })
    .filter((item): item is ProductDocument => item !== null && Boolean(item.url))
}

function normalizeProductSpecs(value: Json | null | undefined): Product["specs"] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const record = asRecord(item)
      if (!record) {
        return null
      }

      const name = asString(record.name)
      const specValue = asString(record.value)

      if (!name || !specValue) {
        return null
      }

      return {
        name,
        value: specValue,
      }
    })
    .filter((item): item is Product["specs"][number] => Boolean(item))
}

function normalizeProductRow(row: ProductRow): CatalogEntry {
  const images = asStringArray(row.images)
  const documents = normalizeProductDocuments(row.documents)
  const specs = normalizeProductSpecs(row.specs)
  const { categoryName, subcategoryName } = getCatalogCategoryMeta(
    row.category_slug,
    row.subcategory_slug,
  )

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    price: Number(row.price ?? 0),
    compareAtPrice: row.compare_at_price ?? undefined,
    categorySlug: row.category_slug,
    categoryName,
    subcategorySlug: row.subcategory_slug ?? undefined,
    subcategoryName,
    brand: normalizeBrandLabel(row.brand),
    image: row.image ?? images[0] ?? "",
    images,
    inStock: row.in_stock,
    stockQuantity: row.stock_quantity,
    isNew: row.is_new || undefined,
    isFeatured: row.is_featured || undefined,
    isRentable: row.is_rentable || undefined,
    rentalPriceDaily: row.rental_price_daily ?? undefined,
    badge: row.badge ?? undefined,
    specs,
    documents,
    relatedProducts: row.related_product_ids.length > 0 ? row.related_product_ids.map(Number) : undefined,
    sourceUrl: row.source_url ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const getCatalogEntriesCached = cache(async (): Promise<CatalogEntry[]> => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("products").select(PUBLIC_PRODUCT_SELECT).order("name")

    if (error || !data?.length) {
      return fallbackCatalog
    }

    const rows = data as unknown as ProductRow[]
    return rows.map(normalizeProductRow)
  } catch {
    return fallbackCatalog
  }
})

export async function getCatalogProducts(): Promise<Product[]> {
  return getCatalogEntriesCached()
}

export async function getCatalogBrands() {
  const products = await getCatalogEntriesCached()
  return [...new Set(products.map((product) => normalizeBrandLabel(product.brand)))].sort((left, right) =>
    left.localeCompare(right, "fr"),
  )
}

export async function getFeaturedCatalogProducts(limit = 12) {
  const products = await getCatalogEntriesCached()
  const featuredProducts = products.filter((product) => product.isFeatured)

  if (featuredProducts.length > 0) {
    return featuredProducts.slice(0, limit)
  }

  return products.slice(0, limit)
}

export async function getRentableCatalogProducts(limit?: number) {
  const products = await getCatalogEntriesCached()
  const rentableProducts = products.filter((product) => product.isRentable)
  return typeof limit === "number" ? rentableProducts.slice(0, limit) : rentableProducts
}

export async function getCatalogProductsByCategory(categorySlug: string) {
  const products = await getCatalogEntriesCached()
  return products.filter((product) => product.categorySlug === categorySlug)
}

export async function getCatalogProductBySlug(slug: string) {
  const products = await getCatalogEntriesCached()
  return products.find((product) => product.slug === slug)
}

export async function getRelatedCatalogProducts(product: Pick<Product, "id" | "categorySlug" | "subcategorySlug">) {
  const products = await getCatalogEntriesCached()
  const byExplicitRelation = products.filter((item) => item.relatedProducts?.includes(product.id))
  if (byExplicitRelation.length > 0) {
    return byExplicitRelation.slice(0, 4)
  }

  const bySubcategory = products.filter(
    (item) =>
      item.id !== product.id &&
      item.subcategorySlug &&
      item.subcategorySlug === product.subcategorySlug,
  )

  if (bySubcategory.length > 0) {
    return bySubcategory.slice(0, 4)
  }

  return products
    .filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug)
    .slice(0, 4)
}

export async function searchCatalogProducts(query: string) {
  const products = await getCatalogEntriesCached()

  return products.filter(
    (product) =>
      matchesSearchText(
        query,
        product.name,
        product.shortDescription,
        product.description,
        product.sku,
        product.brand,
      ) ||
      product.documents.some(
        (document) => matchesSearchText(query, document.name, document.description),
      ),
  )
}

export async function getAdminCatalogProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PUBLIC_PRODUCT_SELECT)
    .order("updated_at", { ascending: false })

  if (error || !data) {
    return [] as CatalogEntry[]
  }

  return (data as unknown as ProductRow[]).map(normalizeProductRow)
}

export async function getAdminCatalogProductById(id: number) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select(PUBLIC_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle()

  return data ? normalizeProductRow(data as unknown as ProductRow) : null
}

export function getCatalogProductHref(product: Pick<Product, "categorySlug" | "subcategorySlug" | "slug">) {
  return buildCatalogProductHref({
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug,
    slug: product.slug,
  })
}
