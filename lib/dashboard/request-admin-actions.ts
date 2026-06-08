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
  internalNotes: z.string().trim().optional(),
})

const quoteUpdateSchema = z.object({
  quoteId: z.string().uuid("Devis invalide."),
  status: quoteStatusSchema,
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

function revalidateDashboardRequests() {
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/commandes")
  revalidatePath("/dashboard/devis")
}

export async function updateDashboardOrderAction(formData: FormData) {
  const parsed = orderUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes"),
  })

  if (!parsed.success) {
    redirect(
      buildRedirect(
        "/dashboard/commandes",
        "error",
        parsed.error.issues[0]?.message ?? "Mise à jour commande impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/commandes")

  const payload: Database["public"]["Tables"]["orders"]["Update"] = {
    status: parsed.data.status,
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
  redirect(buildRedirect("/dashboard/commandes", "success", "Commande mise à jour."))
}

export async function updateDashboardQuoteAction(formData: FormData) {
  const parsed = quoteUpdateSchema.safeParse({
    quoteId: formData.get("quoteId"),
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes"),
  })

  if (!parsed.success) {
    redirect(
      buildRedirect(
        "/dashboard/devis",
        "error",
        parsed.error.issues[0]?.message ?? "Mise à jour devis impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/devis")

  const payload: Database["public"]["Tables"]["quotes"]["Update"] = {
    status: parsed.data.status,
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
  redirect(buildRedirect("/dashboard/devis", "success", "Devis mis à jour."))
}
