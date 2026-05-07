import { z } from "zod"

export type CustomerType = "company" | "individual"
export type QuoteRequestType =
  | "purchase"
  | "rental"
  | "maintenance"
  | "fit-test"
  | "mixed"
export type OrderPaymentMethod = "card-review" | "bank-transfer" | "account-terms"
export type RequestFieldErrors = Partial<Record<string, string>>

const customerTypeSchema = z.enum(["company", "individual"])
const quoteRequestTypeSchema = z.enum([
  "purchase",
  "rental",
  "maintenance",
  "fit-test",
  "mixed",
])
const orderPaymentMethodSchema = z.enum([
  "card-review",
  "bank-transfer",
  "account-terms",
])

const cartPayloadSchema = z
  .array(
    z.object({
      productId: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().positive().max(999),
    }),
  )
  .max(100)

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function readTextValue(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

function countCartItems(payload: string) {
  if (!payload) {
    return 0
  }

  try {
    return cartPayloadSchema.parse(JSON.parse(payload)).length
  } catch {
    return 0
  }
}

const quoteRequestSchema = z
  .object({
    customerType: customerTypeSchema,
    contactName: z.string().trim().min(2, "Indiquez le nom du contact."),
    contactEmail: z
      .string()
      .trim()
      .email("Renseignez une adresse email valide."),
    contactPhone: z
      .string()
      .trim()
      .min(8, "Renseignez un numero de telephone joignable."),
    companyName: z.string().trim().optional().default(""),
    requestType: quoteRequestTypeSchema,
    requestedAgency: z.string().trim().optional().default(""),
    requestedDelay: z.string().trim().optional().default(""),
    message: z.string().trim().optional().default(""),
    productSlug: z.string().trim().optional().default(""),
    productQuantity: z.preprocess(
      emptyStringToUndefined,
      z
        .coerce
        .number()
        .int()
        .positive("La quantite doit etre superieure a 0.")
        .max(999, "La quantite ne peut pas depasser 999.")
        .optional(),
    ),
    rentalDays: z.preprocess(
      emptyStringToUndefined,
      z
        .coerce
        .number()
        .int()
        .positive("La duree de location doit etre superieure a 0.")
        .max(365, "La duree de location ne peut pas depasser 365 jours.")
        .optional(),
    ),
    cartPayload: z.string().trim().optional().default(""),
    sourcePage: z.string().trim().optional().default(""),
    contextLabel: z.string().trim().optional().default(""),
  })
  .superRefine((values, ctx) => {
    if (values.customerType === "company" && values.companyName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Renseignez la société ou choisissez le profil Particulier.",
      })
    }

    if (values.requestType === "rental" && !values.rentalDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rentalDays"],
        message: "Indiquez la duree de location souhaitee.",
      })
    }

    const hasCatalogContext =
      values.productSlug.trim().length > 0 || countCartItems(values.cartPayload) > 0
    const messageLength = values.message.trim().length

    if (!hasCatalogContext && messageLength < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message:
          "Decrivez votre besoin en au moins 20 caracteres si aucun produit ou panier n'est joint.",
      })
    }

    if (hasCatalogContext && messageLength > 0 && messageLength < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["message"],
        message:
          "Ajoutez au moins 10 caracteres de precision, ou laissez ce champ vide.",
      })
    }
  })

const orderRequestSchema = z
  .object({
    customerType: customerTypeSchema,
    contactName: z.string().trim().min(2, "Indiquez le nom du contact."),
    contactEmail: z
      .string()
      .trim()
      .email("Renseignez une adresse email valide."),
    contactPhone: z
      .string()
      .trim()
      .min(8, "Renseignez un numero de telephone joignable."),
    companyName: z.string().trim().optional().default(""),
    siret: z.string().trim().optional().default(""),
    siteReference: z.string().trim().optional().default(""),
    address: z
      .string()
      .trim()
      .min(4, "Renseignez une adresse de livraison complete."),
    postalCode: z.string().trim().min(4, "Renseignez le code postal."),
    city: z.string().trim().min(2, "Renseignez la ville."),
    country: z.string().trim().min(2, "Renseignez le pays."),
    notes: z.string().trim().optional().default(""),
    paymentMethod: orderPaymentMethodSchema,
    cartPayload: z.string().trim().min(2, "Votre panier est vide."),
  })
  .superRefine((values, ctx) => {
    if (values.customerType === "company" && values.companyName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["companyName"],
        message: "Renseignez la société ou choisissez le profil Particulier.",
      })
    }

    if (
      values.customerType === "individual" &&
      values.paymentMethod === "account-terms"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paymentMethod"],
        message:
          "Les conditions de compte sont réservées aux entreprises. Choisissez un autre mode de règlement.",
      })
    }

    if (values.siret) {
      const digits = values.siret.replace(/\D+/g, "")
      if (digits.length > 0 && digits.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["siret"],
          message: "Le SIRET doit contenir 14 chiffres.",
        })
      }
    }

    if (countCartItems(values.cartPayload) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cartPayload"],
        message: "Votre panier est vide. Ajoutez au moins un article avant de commander.",
      })
    }
  })

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
export type OrderRequestInput = z.infer<typeof orderRequestSchema>

export function safeParseQuoteRequestFormData(formData: FormData) {
  return quoteRequestSchema.safeParse({
    customerType: readTextValue(formData, "customerType"),
    contactName: readTextValue(formData, "contactName"),
    contactEmail: readTextValue(formData, "contactEmail"),
    contactPhone: readTextValue(formData, "contactPhone"),
    companyName: readTextValue(formData, "companyName"),
    requestType: readTextValue(formData, "requestType"),
    requestedAgency: readTextValue(formData, "requestedAgency"),
    requestedDelay: readTextValue(formData, "requestedDelay"),
    message: readTextValue(formData, "message"),
    productSlug: readTextValue(formData, "productSlug"),
    productQuantity: readTextValue(formData, "productQuantity"),
    rentalDays: readTextValue(formData, "rentalDays"),
    cartPayload: readTextValue(formData, "cartPayload"),
    sourcePage: readTextValue(formData, "sourcePage"),
    contextLabel: readTextValue(formData, "contextLabel"),
  })
}

export function safeParseOrderRequestFormData(formData: FormData) {
  return orderRequestSchema.safeParse({
    customerType: readTextValue(formData, "customerType"),
    contactName: readTextValue(formData, "contactName"),
    contactEmail: readTextValue(formData, "contactEmail"),
    contactPhone: readTextValue(formData, "contactPhone"),
    companyName: readTextValue(formData, "companyName"),
    siret: readTextValue(formData, "siret"),
    siteReference: readTextValue(formData, "siteReference"),
    address: readTextValue(formData, "address"),
    postalCode: readTextValue(formData, "postalCode"),
    city: readTextValue(formData, "city"),
    country: readTextValue(formData, "country"),
    notes: readTextValue(formData, "notes"),
    paymentMethod: readTextValue(formData, "paymentMethod"),
    cartPayload: readTextValue(formData, "cartPayload"),
  })
}

export function toFieldErrors(error: z.ZodError): RequestFieldErrors {
  const fieldErrors: RequestFieldErrors = {}

  for (const issue of error.issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "_form"
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message
    }
  }

  return fieldErrors
}
