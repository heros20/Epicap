"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { categories } from "@/lib/data/navigation"

interface ProductFiltersProps {
  currentCategory?: string
  currentSubcategory?: string
  availableBrands?: string[]
  priceRange?: [number, number]
  maxPrice?: number
  className?: string
}

export function ProductFilters({
  currentCategory,
  currentSubcategory,
  availableBrands = [],
  priceRange = [0, 5000],
  maxPrice = 5000,
  className,
}: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [localPriceRange, setLocalPriceRange] = React.useState<[number, number]>(priceRange)
  const [selectedBrands, setSelectedBrands] = React.useState<string[]>(
    searchParams.get("brands")?.split(",").filter(Boolean) || []
  )
  const [inStockOnly, setInStockOnly] = React.useState(
    searchParams.get("inStock") === "true"
  )
  const [rentableOnly, setRentableOnly] = React.useState(
    searchParams.get("rentable") === "true"
  )

  const keepWheelInsideFilters = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.ctrlKey) {
      return
    }

    event.currentTarget.scrollTop += event.deltaY
    event.preventDefault()
  }

  const activeFiltersCount = [
    selectedBrands.length > 0,
    inStockOnly,
    rentableOnly,
    localPriceRange[0] > 0 || localPriceRange[1] < maxPrice,
  ].filter(Boolean).length

  const applyFilters = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    
    if (selectedBrands.length > 0) {
      params.set("brands", selectedBrands.join(","))
    } else {
      params.delete("brands")
    }
    
    if (inStockOnly) {
      params.set("inStock", "true")
    } else {
      params.delete("inStock")
    }
    
    if (rentableOnly) {
      params.set("rentable", "true")
    } else {
      params.delete("rentable")
    }
    
    if (localPriceRange[0] > 0) {
      params.set("minPrice", localPriceRange[0].toString())
    } else {
      params.delete("minPrice")
    }
    
    if (localPriceRange[1] < maxPrice) {
      params.set("maxPrice", localPriceRange[1].toString())
    } else {
      params.delete("maxPrice")
    }
    
    router.push(`?${params.toString()}`, { scroll: false })
  }, [searchParams, selectedBrands, inStockOnly, rentableOnly, localPriceRange, maxPrice, router])

  const clearFilters = () => {
    setSelectedBrands([])
    setInStockOnly(false)
    setRentableOnly(false)
    setLocalPriceRange([0, maxPrice])

    if (currentCategory && currentSubcategory) {
      router.push(`/boutique/${currentCategory}?subcategory=${currentSubcategory}`, { scroll: false })
      return
    }

    router.push(window.location.pathname, { scroll: false })
  }

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    )
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Categories */}
      {!currentCategory && (
        <Accordion type="single" collapsible defaultValue="categories">
          <AccordionItem value="categories" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <span className="text-sm font-medium">Catégories</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {categories.map((category) => (
                  <Button
                    key={category.slug}
                    variant="ghost"
                    className="w-full justify-start h-auto py-2 px-2 text-sm font-normal"
                    onClick={() => router.push(`/boutique/${category.slug}`)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Brands */}
      <Accordion type="single" collapsible defaultValue="brands">
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">Marques</span>
          </AccordionTrigger>
          <AccordionContent>
              <div className="space-y-3 pt-2">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center gap-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <Label 
                    htmlFor={`brand-${brand}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {brand}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">Prix</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 pb-2 px-1">
              <Slider
                value={localPriceRange}
                min={0}
                max={maxPrice}
                step={10}
                onValueChange={(value) => setLocalPriceRange(value as [number, number])}
              />
              <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                <span>{localPriceRange[0]}€</span>
                <span>{localPriceRange[1]}€</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Availability */}
      <Accordion type="single" collapsible defaultValue="availability">
        <AccordionItem value="availability" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">Disponibilité</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in-stock"
                  checked={inStockOnly}
                  onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                />
                <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
                  En stock uniquement
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rentable"
                  checked={rentableOnly}
                  onCheckedChange={(checked) => setRentableOnly(checked as boolean)}
                />
                <Label htmlFor="rentable" className="text-sm font-normal cursor-pointer">
                  Disponible en location
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply/Clear buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={applyFilters} className="flex-1">
          Appliquer
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <aside className={cn("hidden lg:block w-64 flex-shrink-0", className)}>
        <div
          className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto overscroll-contain rounded-[1.5rem] border border-border/70 bg-card/85 p-5 shadow-[0_18px_55px_-42px_rgba(35,29,28,0.45)] backdrop-blur"
          onWheel={keepWheelInsideFilters}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Filtres</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="rounded-full lg:hidden">
            <SlidersHorizontal className="size-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFiltersCount}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 border-border/70 p-0">
          <SheetHeader className="border-b border-border/70 bg-muted/35 p-4">
            <SheetTitle className="text-left">Filtres</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(100vh-80px)] overflow-y-auto overscroll-contain p-4">
            {filterContent}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
