import { normalizeSearchText } from "@/lib/catalog/search"

const BRAND_ALIASES = new Map<string, string>([
  ["epicap", "Epicap"],
])

export function normalizeBrandLabel(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ")
  return BRAND_ALIASES.get(normalizeSearchText(cleaned)) ?? cleaned
}
