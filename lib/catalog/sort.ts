import type { Product } from "@/lib/data/products"

export type CatalogSortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name"

export function sortCatalogProducts<T extends Product>(
  products: T[],
  sort: string | null | undefined,
) {
  const nextProducts = [...products]
  const normalizedSort = (sort ?? "featured") as CatalogSortOption

  switch (normalizedSort) {
    case "price-asc":
      nextProducts.sort((left, right) => left.price - right.price)
      return nextProducts
    case "price-desc":
      nextProducts.sort((left, right) => right.price - left.price)
      return nextProducts
    case "name":
      nextProducts.sort((left, right) => left.name.localeCompare(right.name, "fr"))
      return nextProducts
    case "newest":
      return nextProducts
        .filter((product) => product.isNew)
        .concat(nextProducts.filter((product) => !product.isNew))
    case "featured":
    default:
      return nextProducts
        .filter((product) => product.isFeatured)
        .concat(nextProducts.filter((product) => !product.isFeatured))
  }
}
