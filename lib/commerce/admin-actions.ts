"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { requireRole } from "@/lib/auth/server"

const orderStatusSchema = z.object({
  orderId: z.string().uuid("Commande introuvable."),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
})

const quoteStatusSchema = z.object({
  quoteId: z.string().uuid("Devis introuvable."),
  status: z.enum(["draft", "sent", "viewed", "accepted", "rejected", "expired", "converted"]),
})

function buildAdminRedirect(pathname: string, key: "success" | "error", message: string) {
  const url = new URL(pathname, "http://localhost")
  url.searchParams.set(key, message)
  return `${url.pathname}?${url.searchParams.toString()}`
}

export async function updateOrderStatusAction(formData: FormData) {
  const parsed = orderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    redirect(
      buildAdminRedirect(
        "/dashboard/commandes",
        "error",
        parsed.error.issues[0]?.message ?? "Mise à jour de la commande impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/commandes")
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId)

  if (error) {
    redirect(buildAdminRedirect("/dashboard/commandes", "error", error.message))
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/commandes")
  redirect(buildAdminRedirect("/dashboard/commandes", "success", "Statut de commande mis à jour."))
}

export async function updateQuoteStatusAction(formData: FormData) {
  const parsed = quoteStatusSchema.safeParse({
    quoteId: formData.get("quoteId"),
    status: formData.get("status"),
  })

  if (!parsed.success) {
    redirect(
      buildAdminRedirect(
        "/dashboard/devis",
        "error",
        parsed.error.issues[0]?.message ?? "Mise à jour du devis impossible.",
      ),
    )
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/devis")
  const { error } = await supabase
    .from("quotes")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.quoteId)

  if (error) {
    redirect(buildAdminRedirect("/dashboard/devis", "error", error.message))
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/devis")
  redirect(buildAdminRedirect("/dashboard/devis", "success", "Statut de devis mis à jour."))
}
