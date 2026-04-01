"use server"

import { track } from "@vercel/analytics/server"
import { z } from "zod"

import { getCurrentAuthState } from "@/lib/auth/server"
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/catalog/data"
import type { RequestActionState } from "@/lib/commerce/request-action-state"
import { getPricingSnapshot } from "@/lib/commerce/pricing"
import {
  safeParseOrderRequestFormData,
  safeParseQuoteRequestFormData,
  toFieldErrors,
  type QuoteRequestInput,
} from "@/lib/commerce/request-validation"
import type { Product } from "@/lib/data/products"

type RequestRpcResult = {
  id: string
  reference: string
}

type RequestRpcClient = {
  rpc: (
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: RequestRpcResult[] | null; error: { message?: string } | null }>
}

interface ResolvedRequestLine {
  productId: number | null
  categorySlug: string
  sku: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isRental: boolean
  rentalDays: number | null
}

const cartPayloadSchema = z
  .array(
    z.object({
      productId: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().positive().max(999),
    }),
  )
  .max(100)

function safeParseCartPayload(value: string | undefined) {
  if (!value) {
    return []
  }

  try {
    const parsedValue = JSON.parse(value) as unknown
    return cartPayloadSchema.parse(parsedValue)
  } catch {
    return []
  }
}

function clampQuantity(quantity: number) {
  return Math.max(1, Math.min(quantity, 999))
}

function resolveUnitPrice(
  product: Product,
  options: {
    isRental: boolean
    rentalDays?: number
  },
) {
  const baseUnitPrice = options.isRental ? product.rentalPriceDaily ?? 0 : product.price
  const totalPrice = baseUnitPrice * (options.isRental ? options.rentalDays ?? 1 : 1)

  return {
    unitPrice: baseUnitPrice,
    totalPrice,
  }
}

async function resolveRequestLines(options: {
  cartPayload?: string
  productSlug?: string
  productQuantity?: number
  requestType: QuoteRequestInput["requestType"] | "purchase"
  rentalDays?: number
}) {
  const catalogProducts = await getCatalogProducts()
  const productMap = new Map(catalogProducts.map((product) => [product.id, product]))
  const cartSelection = safeParseCartPayload(options.cartPayload)
  const resolvedLines: ResolvedRequestLine[] = []
  const isRentalRequest = options.requestType === "rental"

  for (const item of cartSelection) {
    const product = productMap.get(item.productId)
    if (!product) {
      continue
    }

    const quantity = clampQuantity(item.quantity)
    const { unitPrice, totalPrice } = resolveUnitPrice(product, {
      isRental: false,
    })

    resolvedLines.push({
      productId: product.id,
      categorySlug: product.categorySlug,
      sku: product.sku,
      name: product.name,
      description: product.shortDescription,
      quantity,
      unitPrice,
      totalPrice: totalPrice * quantity,
      isRental: false,
      rentalDays: null,
    })
  }

  if (resolvedLines.length > 0 || !options.productSlug) {
    return resolvedLines
  }

  const requestedProduct = await getCatalogProductBySlug(options.productSlug)
  if (!requestedProduct) {
    return resolvedLines
  }

  const quantity = clampQuantity(options.productQuantity ?? 1)
  const { unitPrice, totalPrice } = resolveUnitPrice(requestedProduct, {
    isRental: isRentalRequest && Boolean(requestedProduct.isRentable),
    rentalDays: options.rentalDays,
  })

  resolvedLines.push({
    productId: requestedProduct.id,
    categorySlug: requestedProduct.categorySlug,
    sku: requestedProduct.sku,
    name: requestedProduct.name,
    description: requestedProduct.shortDescription,
    quantity,
    unitPrice,
    totalPrice: totalPrice * quantity,
    isRental: isRentalRequest && Boolean(requestedProduct.isRentable),
    rentalDays:
      isRentalRequest && requestedProduct.isRentable ? options.rentalDays ?? 1 : null,
  })

  return resolvedLines
}

function buildAddressPayload(values: {
  address: string
  postalCode: string
  city: string
  country: string
}) {
  return {
    street: values.address,
    postalCode: values.postalCode,
    city: values.city,
    country: values.country,
  }
}

function toDisplayError(message: string | undefined, fallback: string) {
  return message?.trim() || fallback
}

function getAuthenticatedDiscountRate(
  profile: Awaited<ReturnType<typeof getCurrentAuthState>>["profile"],
) {
  return Number(profile?.company?.discount_percentage ?? 0)
}

async function callRequestRpc(
  rpcClient: RequestRpcClient,
  fn: string,
  args: Record<string, unknown>,
) {
  const { data, error } = await rpcClient.rpc(fn, args)

  if (error) {
    return {
      error: toDisplayError(error.message, "La demande n'a pas pu etre enregistree."),
      result: null,
    }
  }

  const result = data?.[0] ?? null
  if (!result) {
    return {
      error: "La demande n'a pas pu etre enregistree.",
      result: null,
    }
  }

  return {
    error: null,
    result,
  }
}

export async function submitQuoteRequestAction(
  _previousState: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  const parsed = safeParseQuoteRequestFormData(formData)

  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrigez les champs du devis indiques ci-dessous.",
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const authState = await getCurrentAuthState()
  const resolvedLines = await resolveRequestLines({
    cartPayload: parsed.data.cartPayload,
    productSlug: parsed.data.productSlug,
    productQuantity: parsed.data.productQuantity,
    requestType: parsed.data.requestType,
    rentalDays: parsed.data.rentalDays,
  })
  const customerLabel =
    parsed.data.customerType === "individual"
      ? "Particulier"
      : parsed.data.companyName.trim()
  const discountRate =
    parsed.data.customerType === "company"
      ? getAuthenticatedDiscountRate(authState.profile)
      : 0
  const pricing = getPricingSnapshot(
    resolvedLines.map((line) => ({
      quantity: line.quantity,
      product: {
        id: line.productId ?? 0,
        price: line.unitPrice,
        categorySlug: line.categorySlug,
        isRentable: line.isRental,
        stockQuantity: 999,
      },
    })),
    discountRate,
  )
  const metadata = {
    type: "quote_request",
    customerType: parsed.data.customerType,
    requestType: parsed.data.requestType,
    requestedAgency: parsed.data.requestedAgency || null,
    requestedDelay: parsed.data.requestedDelay || null,
    contactPhone: parsed.data.contactPhone,
    sourcePage: parsed.data.sourcePage || null,
    contextLabel: parsed.data.contextLabel || null,
    productSlug: parsed.data.productSlug || null,
    rentalDays: parsed.data.rentalDays ?? null,
    withCart: Boolean(parsed.data.cartPayload),
    pricing: {
      logisticsMode: pricing.logisticsMode,
      hasQuoteOnlyItems: pricing.hasQuoteOnlyItems,
      hasSpecialHandlingItems: pricing.hasSpecialHandlingItems,
    },
  }

  const rpcResult = await callRequestRpc(
    authState.supabase as unknown as RequestRpcClient,
    "submit_quote_request",
    {
      next_company_name: customerLabel,
      next_contact_name: parsed.data.contactName,
      next_contact_email: parsed.data.contactEmail,
      next_notes: parsed.data.message || null,
      next_metadata: metadata,
      next_items: resolvedLines.map((line) => ({
        productId: line.productId,
        sku: line.sku,
        name: line.name,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
        isRental: line.isRental,
        rentalDays: line.rentalDays,
      })),
      next_valid_until: null,
      next_subtotal: pricing.subtotal,
      next_tax_amount: pricing.taxAmount,
      next_discount_amount: pricing.discountAmount,
      next_total: pricing.total,
    },
  )

  if (rpcResult.error) {
    return {
      status: "error",
      message: rpcResult.error,
      fieldErrors: {},
    }
  }

  const quoteResult = rpcResult.result
  if (!quoteResult) {
    return {
      status: "error",
      message: "La demande de devis n'a pas pu etre finalisee.",
    }
  }

  await track("Quote Request Submitted", {
    authenticated: Boolean(authState.user),
    customer_type: parsed.data.customerType,
    request_type: parsed.data.requestType,
    cart_items: resolvedLines.length,
    logistics_mode: pricing.logisticsMode,
  })

  return {
    status: "success",
    message:
      "Votre demande de devis a bien ete transmise. L'equipe Epicap peut maintenant reprendre l'etude.",
    reference: quoteResult.reference,
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    shippingAmount: pricing.shippingAmount,
    taxAmount: pricing.taxAmount,
    total: pricing.total,
    logisticsMode: pricing.logisticsMode,
    hasQuoteOnlyItems: pricing.hasQuoteOnlyItems,
  }
}

export async function submitOrderRequestAction(
  _previousState: RequestActionState,
  formData: FormData,
): Promise<RequestActionState> {
  const parsed = safeParseOrderRequestFormData(formData)

  if (!parsed.success) {
    return {
      status: "error",
      message: "Corrigez les champs de commande indiques ci-dessous.",
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const authState = await getCurrentAuthState()
  const resolvedLines = await resolveRequestLines({
    cartPayload: parsed.data.cartPayload,
    requestType: "purchase",
  })

  if (resolvedLines.length === 0) {
    return {
      status: "error",
      message: "Ajoutez au moins un article valide avant de transmettre la commande.",
      fieldErrors: {
        cartPayload:
          "Votre panier est vide ou ne contient plus de references valides.",
      },
    }
  }

  const customerLabel =
    parsed.data.customerType === "individual"
      ? "Particulier"
      : parsed.data.companyName.trim()
  const discountRate =
    parsed.data.customerType === "company"
      ? getAuthenticatedDiscountRate(authState.profile)
      : 0
  const pricing = getPricingSnapshot(
    resolvedLines.map((line) => ({
      quantity: line.quantity,
      product: {
        id: line.productId ?? 0,
        price: line.unitPrice,
        categorySlug: line.categorySlug,
        isRentable: line.isRental,
        stockQuantity: 999,
      },
    })),
    discountRate,
  )

  const addressPayload = buildAddressPayload({
    address: parsed.data.address,
    postalCode: parsed.data.postalCode,
    city: parsed.data.city,
    country: parsed.data.country,
  })
  const metadata = {
    type: "order_request",
    customerType: parsed.data.customerType,
    contactPhone: parsed.data.contactPhone,
    siret:
      parsed.data.customerType === "company" ? parsed.data.siret || null : null,
    siteReference: parsed.data.siteReference || null,
    pricing: {
      discountRate,
      logisticsMode: pricing.logisticsMode,
      hasQuoteOnlyItems: pricing.hasQuoteOnlyItems,
      hasSpecialHandlingItems: pricing.hasSpecialHandlingItems,
    },
  }

  const rpcResult = await callRequestRpc(
    authState.supabase as unknown as RequestRpcClient,
    "submit_order_request",
    {
      next_company_name: customerLabel,
      next_contact_name: parsed.data.contactName,
      next_contact_email: parsed.data.contactEmail,
      next_payment_method: parsed.data.paymentMethod,
      next_notes: parsed.data.notes || null,
      next_metadata: metadata,
      next_items: resolvedLines.map((line) => ({
        productId: line.productId,
        sku: line.sku,
        name: line.name,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
        isRental: line.isRental,
        rentalDays: line.rentalDays,
      })),
      next_billing_address: addressPayload,
      next_shipping_address: addressPayload,
      next_shipping_method:
        pricing.logisticsMode === "manual"
          ? "validation-logistique"
          : "livraison-standard",
      next_subtotal: pricing.subtotal,
      next_tax_amount: pricing.taxAmount,
      next_shipping_amount: pricing.shippingAmount,
      next_discount_amount: pricing.discountAmount,
      next_total: pricing.total,
    },
  )

  if (rpcResult.error) {
    return {
      status: "error",
      message: rpcResult.error,
      fieldErrors: {},
    }
  }

  const orderResult = rpcResult.result
  if (!orderResult) {
    return {
      status: "error",
      message: "La demande de commande n'a pas pu etre finalisee.",
    }
  }

  await track("Order Request Submitted", {
    authenticated: Boolean(authState.user),
    customer_type: parsed.data.customerType,
    cart_items: resolvedLines.length,
    logistics_mode: pricing.logisticsMode,
    payment_method: parsed.data.paymentMethod,
  })

  return {
    status: "success",
    message:
      "Votre demande de commande a bien ete transmise. Un conseiller Epicap peut maintenant confirmer les disponibilites et la logistique.",
    reference: orderResult.reference,
    subtotal: pricing.subtotal,
    discountAmount: pricing.discountAmount,
    shippingAmount: pricing.shippingAmount,
    taxAmount: pricing.taxAmount,
    total: pricing.total,
    logisticsMode: pricing.logisticsMode,
    hasQuoteOnlyItems: pricing.hasQuoteOnlyItems,
  }
}
