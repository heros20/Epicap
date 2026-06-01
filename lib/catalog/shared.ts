import { categories } from "@/lib/data/navigation"

export const CATALOG_ASSET_BUCKET = "catalog-assets"
export const CATALOG_CACHE_TAG = "catalog"

export interface CatalogCategoryOption {
  slug: string
  name: string
}

export interface CatalogSubcategoryOption extends CatalogCategoryOption {
  categorySlug: string
  categoryName: string
}

export const catalogCategoryOptions: CatalogCategoryOption[] = categories.map((category) => ({
  slug: category.slug,
  name: category.name,
}))

export const catalogSubcategoryOptions: CatalogSubcategoryOption[] = categories.flatMap((category) =>
  category.subcategories.map((subcategory) => ({
    slug: subcategory.slug,
    name: subcategory.name,
    categorySlug: category.slug,
    categoryName: category.name,
  })),
)

const categoryBySlug = new Map(categories.map((category) => [category.slug, category]))
const subcategoryBySlug = new Map(
  catalogSubcategoryOptions.map((subcategory) => [subcategory.slug, subcategory]),
)

export function isValidCategorySlug(value: string) {
  return categoryBySlug.has(value)
}

export function isValidSubcategorySlug(categorySlug: string, value: string) {
  const subcategory = subcategoryBySlug.get(value)
  return subcategory?.categorySlug === categorySlug
}

export function getCatalogCategoryMeta(categorySlug: string, subcategorySlug?: string | null) {
  const category = categoryBySlug.get(categorySlug)
  const subcategory = subcategorySlug ? subcategoryBySlug.get(subcategorySlug) : undefined

  return {
    categoryName: category?.name ?? categorySlug,
    subcategoryName: subcategory?.name,
  }
}

export function buildCatalogProductHref({
  categorySlug,
  subcategorySlug,
  slug,
}: {
  categorySlug: string
  subcategorySlug?: string | null
  slug: string
}) {
  return `/boutique/${categorySlug}/${subcategorySlug ? `${subcategorySlug}/` : ""}${slug}`
}

export function pickFirstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
