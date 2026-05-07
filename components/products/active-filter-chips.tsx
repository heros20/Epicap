import Link from "next/link"
import { RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ActiveFilterChipsProps {
  brands?: string
  inStock?: string
  rentable?: string
  minPrice?: string
  maxPrice?: string
  query?: string
  resetHref: string
}

export function ActiveFilterChips({
  brands,
  inStock,
  rentable,
  minPrice,
  maxPrice,
  query,
  resetHref,
}: ActiveFilterChipsProps) {
  const selectedBrands = brands?.split(",").filter(Boolean) ?? []
  const chips = [
    query ? `Recherche: ${query}` : null,
    ...selectedBrands.map((brand) => `Marque: ${brand}`),
    inStock === "true" ? "En stock" : null,
    rentable === "true" ? "Location" : null,
    minPrice ? `Min. ${Number(minPrice).toLocaleString("fr-FR")} €` : null,
    maxPrice ? `Max. ${Number(maxPrice).toLocaleString("fr-FR")} €` : null,
  ].filter((chip): chip is string => Boolean(chip))

  if (chips.length === 0) {
    return null
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Badge key={chip} variant="secondary" className="rounded-full px-3 py-1">
          {chip}
        </Badge>
      ))}
      <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-primary">
        <Link href={resetHref}>
          <RotateCcw className="mr-1.5 size-3.5" />
          Réinitialiser
        </Link>
      </Button>
    </div>
  )
}
