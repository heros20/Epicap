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

interface OrderLineAnalyticsRow {
  is_rental: boolean | null
  quantity: number
  total_price: number
}

interface QuoteLineAnalyticsRow {
  is_rental: boolean | null
  quantity: number
  total_price: number
}

interface AdminOrderAnalyticsRow
  extends Pick<
    Order,
    "id" | "order_number" | "company_name" | "contact_name" | "status" | "total" | "created_at"
  > {
  order_items?: OrderLineAnalyticsRow[] | null
}

interface AdminQuoteAnalyticsRow
  extends Pick<
    Quote,
    "id" | "quote_number" | "company_name" | "contact_name" | "status" | "total" | "created_at"
  > {
  quote_items?: QuoteLineAnalyticsRow[] | null
}

export interface AdminDashboardOrderAnalytics {
  id: string
  orderNumber: string | null
  companyName: string | null
  contactName: string | null
  status: Order["status"]
  total: number
  createdAt: string
  saleUnits: number
  rentalUnits: number
  saleRevenue: number
  rentalRevenue: number
}

export interface AdminDashboardQuoteAnalytics {
  id: string
  quoteNumber: string | null
  companyName: string | null
  contactName: string | null
  status: Quote["status"]
  total: number
  createdAt: string
  saleUnits: number
  rentalUnits: number
  saleRevenue: number
  rentalRevenue: number
}

export interface AdminDashboardAnalytics {
  generatedAt: string
  orderCount: number
  quoteCount: number
  companyCount: number
  memberCount: number
  adminCount: number
  catalog: {
    totalProducts: number
    activeProducts: number
    draftProducts: number
    rentableProducts: number
  }
  orders: AdminDashboardOrderAnalytics[]
  quotes: AdminDashboardQuoteAnalytics[]
}

function normalizeLineAnalytics(
  lines: Array<OrderLineAnalyticsRow | QuoteLineAnalyticsRow> | null | undefined,
) {
  return (lines ?? []).reduce(
    (totals, line) => {
      const quantity = Number(line.quantity ?? 0)
      const totalPrice = Number(line.total_price ?? 0)

      if (line.is_rental) {
        totals.rentalUnits += quantity
        totals.rentalRevenue += totalPrice
        return totals
      }

      totals.saleUnits += quantity
      totals.saleRevenue += totalPrice
      return totals
    },
    {
      saleUnits: 0,
      rentalUnits: 0,
      saleRevenue: 0,
      rentalRevenue: 0,
    },
  )
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

export async function getAdminDashboardAnalytics(): Promise<AdminDashboardAnalytics> {
  const supabase = await createClient()

  const [
    ordersResponse,
    quotesResponse,
    companiesCount,
    membersCount,
    adminsCount,
    totalProducts,
    activeProducts,
    draftProducts,
    rentableProducts,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, company_name, contact_name, status, total, created_at, order_items(quantity, total_price, is_rental)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("quotes")
      .select(
        "id, quote_number, company_name, contact_name, status, total, created_at, quote_items(quantity, total_price, is_rental)",
      )
      .order("created_at", { ascending: false }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "super_admin"]),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_rentable", true),
  ])

  const orders = ((ordersResponse.data ?? []) as AdminOrderAnalyticsRow[]).map((order) => {
    const totals = normalizeLineAnalytics(order.order_items)

    return {
      id: order.id,
      orderNumber: order.order_number,
      companyName: order.company_name,
      contactName: order.contact_name,
      status: order.status,
      total: Number(order.total ?? 0),
      createdAt: order.created_at,
      saleUnits: totals.saleUnits,
      rentalUnits: totals.rentalUnits,
      saleRevenue: totals.saleRevenue,
      rentalRevenue: totals.rentalRevenue,
    } satisfies AdminDashboardOrderAnalytics
  })

  const quotes = ((quotesResponse.data ?? []) as AdminQuoteAnalyticsRow[]).map((quote) => {
    const totals = normalizeLineAnalytics(quote.quote_items)

    return {
      id: quote.id,
      quoteNumber: quote.quote_number,
      companyName: quote.company_name,
      contactName: quote.contact_name,
      status: quote.status,
      total: Number(quote.total ?? 0),
      createdAt: quote.created_at,
      saleUnits: totals.saleUnits,
      rentalUnits: totals.rentalUnits,
      saleRevenue: totals.saleRevenue,
      rentalRevenue: totals.rentalRevenue,
    } satisfies AdminDashboardQuoteAnalytics
  })

  return {
    generatedAt: new Date().toISOString(),
    orderCount: orders.length,
    quoteCount: quotes.length,
    companyCount: companiesCount.count ?? 0,
    memberCount: membersCount.count ?? 0,
    adminCount: adminsCount.count ?? 0,
    catalog: {
      totalProducts: totalProducts.count ?? 0,
      activeProducts: activeProducts.count ?? 0,
      draftProducts: draftProducts.count ?? 0,
      rentableProducts: rentableProducts.count ?? 0,
    },
    orders,
    quotes,
  }
}
