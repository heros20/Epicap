export interface RequestActionState {
  status: "idle" | "success" | "error"
  message?: string
  reference?: string
  subtotal?: number
  discountAmount?: number
  shippingAmount?: number
  taxAmount?: number
  total?: number
  logisticsMode?: "estimated" | "manual"
  hasQuoteOnlyItems?: boolean
}

export const initialRequestActionState = {
  status: "idle",
} satisfies RequestActionState
