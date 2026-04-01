"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortSelect({ currentSort }: { currentSort?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleValueChange = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === "featured") {
        params.delete("sort")
      } else {
        params.set("sort", value)
      }

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    },
    [pathname, router, searchParams],
  )

  return (
    <Select defaultValue={currentSort || "featured"} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[190px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="featured">Mis en avant</SelectItem>
        <SelectItem value="newest">Nouveautes</SelectItem>
        <SelectItem value="price-asc">Prix croissant</SelectItem>
        <SelectItem value="price-desc">Prix decroissant</SelectItem>
        <SelectItem value="name">Nom A-Z</SelectItem>
      </SelectContent>
    </Select>
  )
}
