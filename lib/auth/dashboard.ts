import type {
  CompanySummary,
  Order,
  ProfileWithCompany,
  Quote,
} from "@/lib/auth/types"
import { isAdminRole } from "@/lib/auth/types"
import { createClient } from "@/lib/supabase/server"

interface DashboardOverview {
  orderCount: number
  quoteCount: number
  pendingOrderCount: number
  activeQuoteCount: number
  companyCount: number
  memberCount: number
  adminCount: number
  recentOrders: Order[]
  recentQuotes: Quote[]
}

export async function getDashboardOverview(
  profile: ProfileWithCompany,
  userId: string,
): Promise<DashboardOverview> {
  const supabase = await createClient()
  const isAdmin = isAdminRole(profile.role)

  const orderScope = isAdmin
    ? supabase.from("orders").select("id", { count: "exact", head: true })
    : supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", userId)

  const quoteScope = isAdmin
    ? supabase.from("quotes").select("id", { count: "exact", head: true })
    : supabase.from("quotes").select("id", { count: "exact", head: true }).eq("user_id", userId)

  const pendingOrderScope = isAdmin
    ? supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "confirmed", "processing"])
    : supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["pending", "confirmed", "processing"])

  const activeQuoteScope = isAdmin
    ? supabase
        .from("quotes")
        .select("id", { count: "exact", head: true })
        .in("status", ["draft", "sent", "viewed"])
    : supabase
        .from("quotes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .in("status", ["draft", "sent", "viewed"])

  const recentOrdersScope = isAdmin
    ? supabase
        .from("orders")
        .select(
          "id, order_number, user_id, company_id, company_name, contact_name, contact_email, status, payment_status, payment_method, subtotal, tax_amount, shipping_amount, discount_amount, total, currency, billing_address, shipping_address, shipping_method, tracking_number, notes, internal_notes, metadata, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(5)
    : supabase
        .from("orders")
        .select(
          "id, order_number, user_id, company_id, company_name, contact_name, contact_email, status, payment_status, payment_method, subtotal, tax_amount, shipping_amount, discount_amount, total, currency, billing_address, shipping_address, shipping_method, tracking_number, notes, internal_notes, metadata, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

  const recentQuotesScope = isAdmin
    ? supabase
        .from("quotes")
        .select(
          "id, quote_number, user_id, company_id, company_name, contact_name, contact_email, status, subtotal, tax_amount, discount_amount, total, currency, valid_until, notes, internal_notes, metadata, created_at, updated_at",
        )
        .order("created_at", { ascending: false })
        .limit(5)
    : supabase
        .from("quotes")
        .select(
          "id, quote_number, user_id, company_id, company_name, contact_name, contact_email, status, subtotal, tax_amount, discount_amount, total, currency, valid_until, notes, internal_notes, metadata, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

  const [
    ordersCount,
    quotesCount,
    pendingOrders,
    activeQuotes,
    companiesCount,
    membersCount,
    adminsCount,
    recentOrders,
    recentQuotes,
  ] = await Promise.all([
    orderScope,
    quoteScope,
    pendingOrderScope,
    activeQuoteScope,
    isAdmin
      ? supabase.from("companies").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: profile.company ? 1 : 0 }),
    isAdmin
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member")
      : Promise.resolve({ count: 0 }),
    isAdmin
      ? supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .in("role", ["admin", "super_admin"])
      : Promise.resolve({ count: 0 }),
    recentOrdersScope,
    recentQuotesScope,
  ])

  return {
    orderCount: ordersCount.count ?? 0,
    quoteCount: quotesCount.count ?? 0,
    pendingOrderCount: pendingOrders.count ?? 0,
    activeQuoteCount: activeQuotes.count ?? 0,
    companyCount: companiesCount.count ?? 0,
    memberCount: membersCount.count ?? 0,
    adminCount: adminsCount.count ?? 0,
    recentOrders: recentOrders.data ?? [],
    recentQuotes: recentQuotes.data ?? [],
  }
}

export async function getOrdersForDashboard(profile: ProfileWithCompany, userId: string) {
  const supabase = await createClient()
  const query = supabase
    .from("orders")
    .select(
      "id, order_number, user_id, company_id, company_name, contact_name, contact_email, status, payment_status, payment_method, subtotal, tax_amount, shipping_amount, discount_amount, total, currency, billing_address, shipping_address, shipping_method, tracking_number, notes, internal_notes, metadata, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(30)

  if (!isAdminRole(profile.role)) {
    query.eq("user_id", userId)
  }

  const { data } = await query
  return data ?? []
}

export async function getQuotesForDashboard(profile: ProfileWithCompany, userId: string) {
  const supabase = await createClient()
  const query = supabase
    .from("quotes")
    .select(
      "id, quote_number, user_id, company_id, company_name, contact_name, contact_email, status, subtotal, tax_amount, discount_amount, total, currency, valid_until, notes, internal_notes, metadata, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(30)

  if (!isAdminRole(profile.role)) {
    query.eq("user_id", userId)
  }

  const { data } = await query
  return data ?? []
}

export async function getTeamProfiles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, company_id, company_name, first_name, last_name, email, phone, job_title, role, is_active, email_notifications, created_at, updated_at, company:companies(id, name, siret, email, phone, website, payment_terms, discount_percentage)",
    )
    .order("created_at", { ascending: false })
    .limit(100)

  return (data ?? []) as ProfileWithCompany[]
}

export async function getCompanySummaries(): Promise<CompanySummary[]> {
  const supabase = await createClient()
  const [companiesResponse, profilesResponse] = await Promise.all([
    supabase
      .from("companies")
      .select(
        "id, name, siret, vat_number, email, phone, website, billing_address, shipping_addresses, payment_terms, credit_limit, discount_percentage, notes, is_active, created_at, updated_at",
      )
      .order("name"),
    supabase.from("profiles").select("company_id, role"),
  ])

  const companies = companiesResponse.data ?? []
  const profiles = profilesResponse.data ?? []

  return companies.map((company) => {
    const attachedProfiles = profiles.filter((profile) => profile.company_id === company.id)
    return {
      ...company,
      memberCount: attachedProfiles.filter((profile) => profile.role === "member").length,
      adminCount: attachedProfiles.filter((profile) => profile.role !== "member").length,
    }
  })
}
