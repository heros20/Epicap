import type { Database, Enums } from "@/types/supabase"

export type AppRole = Enums<"app_role">
export type OrderStatus = Enums<"order_status">
export type QuoteStatus = Enums<"quote_status">
export type Company = Database["public"]["Tables"]["companies"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type Quote = Database["public"]["Tables"]["quotes"]["Row"]
export type DashboardNavGroup = "priorites" | "compte" | "pilotage"

export interface AuthUser {
  id: string
  email: string | null
}

export interface CompanySummary extends Company {
  memberCount: number
  adminCount: number
}

export interface ProfileWithCompany extends Profile {
  company: Pick<
    Company,
    | "id"
    | "name"
    | "siret"
    | "email"
    | "phone"
    | "website"
    | "payment_terms"
    | "discount_percentage"
  > | null
}

export const ROLE_LABELS: Record<AppRole, string> = {
  member: "Membre",
  admin: "Admin",
  super_admin: "Super admin",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  viewed: "Consulté",
  accepted: "Accepté",
  rejected: "Refusé",
  expired: "Expiré",
  converted: "Converti",
}

export const DASHBOARD_NAV_GROUP_LABELS: Record<DashboardNavGroup, string> = {
  priorites: "Priorités",
  compte: "Mon compte",
  pilotage: "Pilotage",
}

export const DASHBOARD_NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Vue d'ensemble",
    description: "KPI, activité et accès rapides.",
    group: "priorites" as DashboardNavGroup,
    roles: ["member", "admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/profil",
    label: "Profil",
    description: "Coordonnées, société et préférences.",
    group: "compte" as DashboardNavGroup,
    roles: ["member", "admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/commandes",
    label: "Commandes",
    description: "Historique et suivi des commandes.",
    group: "priorites" as DashboardNavGroup,
    roles: ["member", "admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/devis",
    label: "Devis",
    description: "Demandes de devis et statut commercial.",
    group: "priorites" as DashboardNavGroup,
    roles: ["member", "admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/catalogue",
    label: "Catalogue",
    description: "Produits, visuels, pièces jointes et publication.",
    group: "pilotage" as DashboardNavGroup,
    roles: ["admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    description: "Suivi PostHog des visites et actions commerciales.",
    group: "pilotage" as DashboardNavGroup,
    roles: ["admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/equipe",
    label: "Équipe",
    description: "Gestion des membres et des rôles.",
    group: "pilotage" as DashboardNavGroup,
    roles: ["admin", "super_admin"] as AppRole[],
  },
  {
    href: "/dashboard/clients",
    label: "Clients",
    description: "Sociétés, rattachements et visibilité B2B.",
    group: "pilotage" as DashboardNavGroup,
    roles: ["admin", "super_admin"] as AppRole[],
  },
] as const

export function isAdminRole(role: AppRole) {
  return role === "admin" || role === "super_admin"
}

export function getVisibleDashboardItems(role: AppRole) {
  return DASHBOARD_NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export function getVisibleDashboardGroups(role: AppRole) {
  const items = getVisibleDashboardItems(role)
  const groups = Object.keys(DASHBOARD_NAV_GROUP_LABELS) as DashboardNavGroup[]

  return groups
    .map((group) => ({
      key: group,
      label: DASHBOARD_NAV_GROUP_LABELS[group],
      items: items.filter((item) => item.group === group),
    }))
    .filter((group) => group.items.length > 0)
}

export function getProfileDisplayName(
  profile: Pick<Profile, "first_name" | "last_name" | "email"> | null,
  fallbackEmail?: string | null,
) {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim()
  return fullName || profile?.email || fallbackEmail || "Compte Epicap"
}

export function normalizeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  if (value.startsWith("/auth/signout")) {
    return fallback
  }

  return value
}
