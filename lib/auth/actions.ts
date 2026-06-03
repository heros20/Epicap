"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { normalizeRedirectPath } from "@/lib/auth/types"
import { createClient } from "@/lib/supabase/server"

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caracteres.")
  .regex(/[a-z]/, "Ajoutez au moins une minuscule.")
  .regex(/[A-Z]/, "Ajoutez au moins une majuscule.")
  .regex(/[0-9]/, "Ajoutez au moins un chiffre.")

const authSourceSchema = z.enum(["connexion", "inscription"])

const signInSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
  next: z.string().optional(),
})

const signUpSchema = z
  .object({
    firstName: z.string().trim().min(2, "Le prenom est requis."),
    lastName: z.string().trim().min(2, "Le nom est requis."),
    email: z.string().email("Adresse email invalide."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez le mot de passe."),
    phone: z.string().trim().optional(),
    companyName: z.string().trim().optional(),
    jobTitle: z.string().trim().optional(),
    next: z.string().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  })

const googleAuthSchema = z.object({
  next: z.string().optional(),
  source: authSourceSchema.optional(),
})

const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, "Le prenom est requis."),
  lastName: z.string().trim().min(2, "Le nom est requis."),
  phone: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  emailNotifications: z.enum(["on", "off"]).default("off"),
})

const adminUpdateSchema = z.object({
  targetUserId: z.string().uuid("Utilisateur invalide."),
  role: z.enum(["member", "admin", "super_admin"]).optional(),
  isActive: z.enum(["true", "false"]),
})

function buildActionRedirect(
  pathname: string,
  key: "error" | "success",
  message: string,
  next?: string,
) {
  const url = new URL(pathname, "http://localhost")
  url.searchParams.set(key, message)

  if (next) {
    url.searchParams.set("next", next)
  }

  return `${url.pathname}?${url.searchParams.toString()}`
}

function sanitizeOptional(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getAuthPagePath(source?: z.infer<typeof authSourceSchema>) {
  return source === "inscription" ? "/inscription" : "/connexion"
}

function toFriendlyOAuthError(message: string) {
  if (/provider.*not enabled/i.test(message) || /unsupported provider/i.test(message)) {
    return "La connexion Google n'est pas disponible pour le moment."
  }

  return message
}

async function getRequestOrigin() {
  const requestHeaders = await headers()
  return requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  })

  if (!parsed.success) {
    redirect(
      buildActionRedirect(
        "/connexion",
        "error",
        parsed.error.issues[0]?.message ?? "Connexion impossible.",
      ),
    )
  }

  const next = normalizeRedirectPath(parsed.data.next)
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    redirect(buildActionRedirect("/connexion", "error", error.message, next))
  }

  revalidatePath("/", "layout")
  redirect(next)
}

export async function signInWithGoogleAction(formData: FormData) {
  const parsed = googleAuthSchema.safeParse({
    next: formData.get("next"),
    source: formData.get("source"),
  })

  const source = parsed.success ? parsed.data.source : "connexion"
  const authPagePath = getAuthPagePath(source)
  const next = normalizeRedirectPath(parsed.success ? parsed.data.next : undefined)
  const origin = await getRequestOrigin()
  const callbackUrl = new URL("/auth/callback", origin)
  callbackUrl.searchParams.set("next", next)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    redirect(buildActionRedirect(authPagePath, "error", toFriendlyOAuthError(error.message), next))
  }

  if (!data.url) {
    redirect(
      buildActionRedirect(
        authPagePath,
        "error",
        "Connexion Google impossible pour le moment.",
        next,
      ),
    )
  }

  redirect(data.url)
}

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone"),
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    next: formData.get("next"),
  })

  if (!parsed.success) {
    redirect(
      buildActionRedirect(
        "/inscription",
        "error",
        parsed.error.issues[0]?.message ?? "Inscription impossible.",
      ),
    )
  }

  const next = normalizeRedirectPath(parsed.data.next)
  const origin = await getRequestOrigin()
  const callbackUrl = new URL("/auth/callback", origin)
  callbackUrl.searchParams.set("next", next)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone ?? null,
        company_name: parsed.data.companyName ?? null,
        job_title: parsed.data.jobTitle ?? null,
      },
    },
  })

  if (error) {
    redirect(buildActionRedirect("/inscription", "error", error.message, next))
  }

  revalidatePath("/", "layout")

  if (data.session) {
    redirect(next)
  }

  redirect(
    buildActionRedirect(
      "/connexion",
      "success",
      "Compte créé. Vérifiez votre email pour activer le compte, puis connectez-vous.",
      next,
    ),
  )
}

export async function updateMyProfileAction(formData: FormData) {
  const parsed = profileUpdateSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    jobTitle: formData.get("jobTitle"),
    companyName: formData.get("companyName"),
    emailNotifications: formData.get("emailNotifications") === "on" ? "on" : "off",
  })

  if (!parsed.success) {
    redirect(
      buildActionRedirect(
        "/dashboard/profil",
        "error",
        parsed.error.issues[0]?.message ?? "Profil invalide.",
      ),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("update_my_profile", {
    next_first_name: parsed.data.firstName,
    next_last_name: parsed.data.lastName,
    next_phone: parsed.data.phone?.trim() || "",
    next_job_title: parsed.data.jobTitle?.trim() || "",
    next_company_name: parsed.data.companyName?.trim() || "",
    next_email_notifications: parsed.data.emailNotifications === "on",
  })

  if (error) {
    redirect(buildActionRedirect("/dashboard/profil", "error", error.message))
  }

  revalidatePath("/dashboard", "layout")
  redirect(buildActionRedirect("/dashboard/profil", "success", "Profil mis à jour."))
}

export async function adminUpdateProfileAction(formData: FormData) {
  const parsed = adminUpdateSchema.safeParse({
    targetUserId: formData.get("targetUserId"),
    role: formData.get("role"),
    isActive: formData.get("isActive"),
  })

  if (!parsed.success) {
    redirect(
      buildActionRedirect(
        "/dashboard/equipe",
        "error",
        parsed.error.issues[0]?.message ?? "Mise à jour impossible.",
      ),
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc("admin_update_profile", {
    target_user_id: parsed.data.targetUserId,
    next_role: parsed.data.role,
    next_company_id: sanitizeOptional(formData.get("companyId")) ?? undefined,
    next_is_active: parsed.data.isActive === "true",
  })

  if (error) {
    redirect(buildActionRedirect("/dashboard/equipe", "error", error.message))
  }

  revalidatePath("/dashboard", "layout")
  redirect(buildActionRedirect("/dashboard/equipe", "success", "Utilisateur mis à jour."))
}
