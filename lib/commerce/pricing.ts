import type { Product } from "@/lib/data/products"

export const STANDARD_SHIPPING_THRESHOLD = 1200
export const STANDARD_SHIPPING_COST = 25
export const DEFAULT_TAX_RATE = 0.2

const SPECIAL_HANDLING_CATEGORY_SLUGS = new Set<string>([
  "aspirateurs-ponceuses-rectifieuses-de-sol",
  "decontamination",
  "extracteurs-d-air-epiair",
  "location-et-maintenance-equipements-anti-amiante",
  "mesures-controles-communication",
])

export interface CartLikeItem {
  product: Pick<
    Product,
    | "id"
    | "price"
    | "categorySlug"
    | "isRentable"
    | "stockQuantity"
  >
  quantity: number
}

export interface PricingSnapshot {
  subtotal: number
  discountRate: number
  discountAmount: number
  shippingAmount: number
  taxAmount: number
  total: number
  logisticsMode: "estimated" | "manual"
  hasQuoteOnlyItems: boolean
  hasSpecialHandlingItems: boolean
  shippingThreshold: number | null
  remainingForFreeShipping: number | null
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function isSpecialHandlingProduct(
  product: Pick<Product, "categorySlug" | "isRentable" | "stockQuantity">,
) {
  return (
    product.isRentable ||
    product.stockQuantity === 0 ||
    SPECIAL_HANDLING_CATEGORY_SLUGS.has(product.categorySlug)
  )
}

export function getPricingSnapshot(
  items: CartLikeItem[],
  companyDiscountRate = 0,
): PricingSnapshot {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )
  const discountRate = Math.min(Math.max(companyDiscountRate, 0), 100)
  const discountAmount = roundCurrency((subtotal * discountRate) / 100)
  const discountedSubtotal = roundCurrency(subtotal - discountAmount)
  const hasQuoteOnlyItems = items.some((item) => item.product.price <= 0)
  const hasSpecialHandlingItems = items.some((item) =>
    isSpecialHandlingProduct(item.product),
  )
  const logisticsMode =
    hasQuoteOnlyItems || hasSpecialHandlingItems ? "manual" : "estimated"
  const shippingThreshold =
    logisticsMode === "estimated" ? STANDARD_SHIPPING_THRESHOLD : null
  const shippingAmount =
    logisticsMode === "manual"
      ? 0
      : discountedSubtotal >= STANDARD_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING_COST
  const remainingForFreeShipping =
    logisticsMode === "estimated"
      ? Math.max(STANDARD_SHIPPING_THRESHOLD - discountedSubtotal, 0)
      : null
  const taxAmount = roundCurrency(
    logisticsMode === "manual"
      ? discountedSubtotal * DEFAULT_TAX_RATE
      : (discountedSubtotal + shippingAmount) * DEFAULT_TAX_RATE,
  )
  const total = roundCurrency(discountedSubtotal + shippingAmount + taxAmount)

  return {
    subtotal,
    discountRate,
    discountAmount,
    shippingAmount,
    taxAmount,
    total,
    logisticsMode,
    hasQuoteOnlyItems,
    hasSpecialHandlingItems,
    shippingThreshold,
    remainingForFreeShipping,
  }
}
