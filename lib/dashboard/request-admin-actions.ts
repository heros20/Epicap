"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireRole } from "@/lib/auth/server"
import type { Database } from "@/types/supabase"

const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
])

const paymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded", "partial"])

const quoteStatusSchema = z.enum([
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
  "converted",
])

const orderUpdateSchema = z.object({
  orderId: z.string().uuid("Commande invalide."),
  status: orderStatusSchema,
  paymentStatus: paymentStatusSchema,
  paymentMethod: z.string().trim().optional(),
  shippingMethod: z.string().trim().optional(),
  trackingNumber: z.string().trim().optional(),
  internalNotes: z.string().trim().optional(),
})

const quoteUpdateSchema = z.object({
  quoteId: z.string().uuid("Devis invalide."),
  status: quoteStatusSchema,
  validUntil: z.string().trim().optional(),
  internalNotes: z.string().trim().optional(),
})

function buildRedirect(pathname: string, key: "error" | "success", message: string) {
  const url = new URL(pathname, "http://localhost")
  url.searchParams.set(key, message)
  return `${url.pathname}?${url.searchParams.toString()}`
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeDate(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function revalidateDashboardRequests() {
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/commandes")
  revalidatePath("/dashboard/devis")
}

export async function updateDashboardOrderAction(formData: FormData) {
  const parsed = orderUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    paymentMethod: formData.get("paymentMethod"),
    shippingMethod: formData.get("shippingMethod"),
    trackingNumber: formData.get("trackingNumber"),
    internalNotes: formData.get("internalNotes"),
  })

  if (!parsed.success) {
    redirect(
      buildRedirect(
        "/dashboard/commandes",
        "error",
        parsed.error.issues[0]?.message ?? "Mise a jour commande impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/commandes")

  const payload: Database["public"]["Tables"]["orders"]["Update"] = {
    status: parsed.data.status,
    payment_status: parsed.data.paymentStatus,
    payment_method: normalizeText(parsed.data.paymentMethod),
    shipping_method: normalizeText(parsed.data.shippingMethod),
    tracking_number: normalizeText(parsed.data.trackingNumber),
    internal_notes: normalizeText(parsed.data.internalNotes),
  }

  const { error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", parsed.data.orderId)

  if (error) {
    redirect(buildRedirect("/dashboard/commandes", "error", error.message))
  }

  revalidateDashboardRequests()
  redirect(buildRedirect("/dashboard/commandes", "success", "Commande mise a jour."))
}

export async function updateDashboardQuoteAction(formData: FormData) {
  const parsed = quoteUpdateSchema.safeParse({
    quoteId: formData.get("quoteId"),
    status: formData.get("status"),
    validUntil: formData.get("validUntil"),
    internalNotes: formData.get("internalNotes"),
  })

  if (!parsed.success) {
    redirect(
      buildRedirect(
        "/dashboard/devis",
        "error",
        parsed.error.issues[0]?.message ?? "Mise a jour devis impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/devis")

  const payload: Database["public"]["Tables"]["quotes"]["Update"] = {
    status: parsed.data.status,
    valid_until: normalizeDate(parsed.data.validUntil),
    internal_notes: normalizeText(parsed.data.internalNotes),
  }

  const { error } = await supabase
    .from("quotes")
    .update(payload)
    .eq("id", parsed.data.quoteId)

  if (error) {
    redirect(buildRedirect("/dashboard/devis", "error", error.message))
  }

  revalidateDashboardRequests()
  redirect(buildRedirect("/dashboard/devis", "success", "Devis mis a jour."))
}
