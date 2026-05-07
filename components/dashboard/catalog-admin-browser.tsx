"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ExternalLink,
  FolderKanban,
  PencilLine,
  Search,
  SlidersHorizontal,
  Undo2,
  X,
} from "lucide-react"

import type { CatalogEntry } from "@/lib/catalog/data"
import {
  buildCatalogProductHref,
  catalogCategoryOptions,
  catalogSubcategoryOptions,
} from "@/lib/catalog/shared"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

type CatalogScope = "all" | "sale_only" | "rentable" | "active" | "inactive"
type CatalogSort = "updated" | "name" | "category"

const scopeOptions: Array<{ value: CatalogScope; label: string }> = [
  { value: "all", label: "Toutes les fiches" },
  { value: "sale_only", label: "Vente" },
  { value: "rentable", label: "Vente + location" },
  { value: "active", label: "Publiées" },
  { value: "inactive", label: "Brouillons" },
]

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "updated", label: "Dernière mise à jour" },
  { value: "name", label: "Nom A-Z" },
  { value: "category", label: "Catégorie / famille" },
]

function isCatalogScope(value: string): value is CatalogScope {
  return scopeOptions.some((option) => option.value === value)
}

function isCatalogSort(value: string): value is CatalogSort {
  return sortOptions.some((option) => option.value === value)
}

function matchesScope(product: CatalogEntry, scope: CatalogScope) {
  switch (scope) {
    case "sale_only":
      return !product.isRentable
    case "active":
      return product.isActive
    case "inactive":
      return !product.isActive
    case "rentable":
      return Boolean(product.isRentable)
    default:
      return true
  }
}

function matchesCategory(product: CatalogEntry, category: string) {
  return category === "all" || product.categorySlug === category
}

function matchesSubcategory(product: CatalogEntry, subcategory: string) {
  return subcategory === "all" || product.subcategorySlug === subcategory
}

function getProductTimestamp(product: CatalogEntry) {
  const timestamp = Date.parse(product.updatedAt || product.createdAt || "")
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getProductHref(product: CatalogEntry) {
  return `/dashboard/catalogue/${product.id}`
}

function getPublicProductHref(product: CatalogEntry) {
  return buildCatalogProductHref({
    categorySlug: product.categorySlug,
    subcategorySlug: product.subcategorySlug,
    slug: product.slug,
  })
}

function getSearchScore(product: CatalogEntry, query: string) {
  if (!query) {
    return 0
  }

  const name = product.name.toLowerCase()
  const sku = product.sku.toLowerCase()
  const slug = product.slug.toLowerCase()
  const brand = product.brand.toLowerCase()
  const category = product.categoryName.toLowerCase()
  const subcategory = (product.subcategoryName ?? "").toLowerCase()
  const shortDescription = product.shortDescription.toLowerCase()
  const description = product.description.toLowerCase()
  const documentMatch = product.documents.some((document) => {
    const documentName = document.name.toLowerCase()
    const documentDescription = document.description.toLowerCase()
    return documentName.includes(query) || documentDescription.includes(query)
  })

  let score = 0

  if (sku === query) score += 420
  if (slug === query) score += 390
  if (name === query) score += 360

  if (sku.startsWith(query)) score += 240
  if (slug.startsWith(query)) score += 210
  if (name.startsWith(query)) score += 190

  if (name.includes(query)) score += 170
  if (sku.includes(query)) score += 170
  if (slug.includes(query)) score += 150
  if (brand.includes(query)) score += 120
  if (category.includes(query)) score += 90
  if (subcategory.includes(query)) score += 80
  if (shortDescription.includes(query)) score += 50
  if (description.includes(query)) score += 25
  if (documentMatch) score += 70

  return score
}

function getCommercialMode(product: CatalogEntry) {
  return product.isRentable ? "Vente + location" : "Vente"
}

function ProductBadges({ product }: { product: CatalogEntry }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        className={
          product.isRentable
            ? "border border-emerald-300/30 bg-emerald-500/10 text-emerald-700"
            : "border border-orange-300/30 bg-orange-500/10 text-orange-700"
        }
      >
        {getCommercialMode(product)}
      </Badge>
      <Badge variant={product.isActive ? "default" : "secondary"}>
        {product.isActive ? "Publié" : "Brouillon"}
      </Badge>
      {product.documents.length > 0 ? (
        <Badge variant="outline">{product.documents.length} doc(s)</Badge>
      ) : null}
    </div>
  )
}

function ProductPriceBreakdown({
  product,
  compact = false,
}: {
  product: CatalogEntry
  compact?: boolean
}) {
  return (
    <div className={cn("grid gap-2", !compact && "sm:grid-cols-2")}>
      <div className="rounded-2xl border border-orange-300/25 bg-orange-50/60 px-3 py-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
          Vente
        </p>
        <p className="mt-1 text-sm font-semibold">{currencyFormatter.format(product.price)}</p>
      </div>
      <div
        className={cn(
          "rounded-2xl border px-3 py-2",
          product.isRentable && product.rentalPriceDaily
            ? "border-emerald-300/25 bg-emerald-50/60"
            : "border-border/70 bg-muted/20",
        )}
      >
        <p
          className={cn(
            "text-[11px] font-bold uppercase tracking-[0.18em]",
            product.isRentable && product.rentalPriceDaily
              ? "text-emerald-700"
              : "text-muted-foreground",
          )}
        >
          Location
        </p>
        <p className="mt-1 text-sm font-semibold">
          {product.isRentable && product.rentalPriceDaily
            ? `${currencyFormatter.format(product.rentalPriceDaily)} / jour`
            : "Inactive"}
        </p>
      </div>
    </div>
  )
}

function ProductActions({
  product,
  compact = false,
  align = "end",
}: {
  product: CatalogEntry
  compact?: boolean
  align?: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        align === "start" ? "justify-start" : "justify-end",
      )}
    >
      <Button variant="outline" size={compact ? "sm" : "default"} asChild>
        <Link href={getPublicProductHref(product)} target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" />
          Voir
        </Link>
      </Button>
      <Button size={compact ? "sm" : "default"} asChild>
        <Link href={getProductHref(product)}>
          <PencilLine className="size-4" />
          Modifier
        </Link>
      </Button>
    </div>
  )
}

function DesktopProductRow({ product }: { product: CatalogEntry }) {
  return (
    <article className="rounded-[1.55rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,248,250,0.92))] p-5 shadow-[0_28px_70px_-52px_rgba(23,19,18,0.28)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.8fr)_minmax(260px,0.95fr)_auto] 2xl:items-center">
        <div className="min-w-0">
          <Link
            href={getProductHref(product)}
            className="group flex items-start gap-4 rounded-[1.2rem] transition"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-[1.1rem] border border-border/70 bg-muted/20">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="border border-primary/15 bg-primary/8 text-primary">
                  {product.categoryName}
                </Badge>
                {product.subcategoryName ? (
                  <Badge variant="outline" className="bg-background/70">
                    {product.subcategoryName}
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-start gap-2">
                <p className="line-clamp-2 text-base font-semibold transition group-hover:text-primary">
                  {product.name}
                </p>
                <PencilLine className="mt-0.5 size-3.5 shrink-0 text-primary/80" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {product.brand} - Ref. {product.sku}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{product.slug}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-primary/80">
                  Ouvrir l&apos;éditeur produit
                </p>
            </div>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:contents">
          <div className="rounded-[1.2rem] border border-border/70 bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
              Lecture rapide
            </p>
            <p className="mt-2 text-sm font-medium">{getCommercialMode(product)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.documents.length > 0
                ? `${product.documents.length} document(s) rattache(s)`
                : "Aucun document rattache"}
            </p>
            <div className="mt-3">
              <ProductBadges product={product} />
            </div>
          </div>

          <div className="rounded-[1.2rem] border border-border/70 bg-white/72 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
              Offre commerciale
            </p>
            <div className="mt-3">
              <ProductPriceBreakdown product={product} compact />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.2rem] border border-border/70 bg-white/72 p-4 2xl:min-w-[188px]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
              Mise à jour
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
            </p>
          </div>
          <ProductActions product={product} compact align="start" />
        </div>
      </div>
    </article>
  )
}

export function CatalogAdminBrowser({
  products,
  initialQuery = "",
  initialScope = "all",
}: {
  products: CatalogEntry[]
  initialQuery?: string
  initialScope?: string
}) {
  const [query, setQuery] = React.useState(initialQuery)
  const [scope, setScope] = React.useState<CatalogScope>(
    isCatalogScope(initialScope) ? initialScope : "all",
  )
  const [selectedCategory, setSelectedCategory] = React.useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = React.useState("all")
  const [selectedSort, setSelectedSort] = React.useState<CatalogSort>("updated")

  const deferredQuery = React.useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const availableCategoryOptions = catalogCategoryOptions.filter((category) =>
    products.some((product) => product.categorySlug === category.slug),
  )

  const availableSubcategoryOptions = catalogSubcategoryOptions.filter((subcategory) => {
    if (selectedCategory !== "all" && subcategory.categorySlug !== selectedCategory) {
      return false
    }

    return products.some((product) => product.subcategorySlug === subcategory.slug)
  })

  const filteredProducts = products
    .map((product, index) => ({
      product,
      index,
      score: getSearchScore(product, normalizedQuery),
    }))
    .filter(({ product, score }) => {
      if (!matchesCategory(product, selectedCategory)) {
        return false
      }

      if (!matchesSubcategory(product, selectedSubcategory)) {
        return false
      }

      if (!matchesScope(product, scope)) {
        return false
      }

      return normalizedQuery.length === 0 || score > 0
    })
    .sort((left, right) => {
      if (normalizedQuery.length > 0 && right.score !== left.score) {
        return right.score - left.score
      }

       if (selectedSort === "name") {
        return left.product.name.localeCompare(right.product.name, "fr")
      }

      if (selectedSort === "category") {
        const categoryDelta = left.product.categoryName.localeCompare(
          right.product.categoryName,
          "fr",
        )

        if (categoryDelta !== 0) {
          return categoryDelta
        }

        const subcategoryDelta = (left.product.subcategoryName ?? "").localeCompare(
          right.product.subcategoryName ?? "",
          "fr",
        )

        if (subcategoryDelta !== 0) {
          return subcategoryDelta
        }

        return left.product.name.localeCompare(right.product.name, "fr")
      }

      const updatedDelta = getProductTimestamp(right.product) - getProductTimestamp(left.product)

      if (updatedDelta !== 0) {
        return updatedDelta
      }

      return left.index - right.index
    })
    .map(({ product }) => product)

  const scopeCounts = {
    all: products.length,
    sale_only: products.filter((product) => !product.isRentable).length,
    active: products.filter((product) => product.isActive).length,
    inactive: products.filter((product) => !product.isActive).length,
    rentable: products.filter((product) => product.isRentable).length,
  }

  const stats = [
    {
      label: "Résultats visibles",
      value: filteredProducts.length,
      detail:
        normalizedQuery.length > 0 || selectedCategory !== "all" || selectedSubcategory !== "all"
          ? `sur ${products.length} fiches`
          : "liste complète triée par dernière mise à jour",
    },
    {
      label: "Vente seule",
      value: filteredProducts.filter((product) => !product.isRentable).length,
      detail: "articles uniquement vendus",
    },
    {
      label: "Vente + location",
      value: filteredProducts.filter((product) => product.isRentable).length,
      detail: "références avec tarif journalier",
    },
    {
      label: "Brouillons",
      value: filteredProducts.filter((product) => !product.isActive).length,
      detail: "fiches à finaliser ou corriger",
    },
  ]

  const quickResults = normalizedQuery.length > 0 ? filteredProducts.slice(0, 4) : []

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Trouver et modifier un article</CardTitle>
          <CardDescription>
            Recherche instantanée sur le nom, la référence, le slug, la marque et les
            documents, avec une séparation claire entre offre vente et offre location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="w-full max-w-3xl space-y-4">
                <div>
                  <label htmlFor="catalog-admin-search" className="mb-2 block text-sm font-medium">
                    Trouver un article à modifier
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="catalog-admin-search"
                      type="search"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Nom, SKU, slug, marque, catégorie ou document"
                      className="h-11 pl-10 pr-12"
                      aria-describedby="catalog-admin-search-help"
                    />
                    {query ? (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label="Effacer la recherche"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>
                  <p id="catalog-admin-search-help" className="mt-2 text-xs text-muted-foreground">
                    Astuce : une recherche par SKU ou slug remonte la bonne fiche en tête.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {scopeOptions.map((option) => {
                    const isActive = scope === option.value
                    const count = scopeCounts[option.value]

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setScope(option.value)}
                      >
                        {option.label}
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px]",
                            isActive
                              ? "bg-white/15 text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      </Button>
                    )
                  })}
                  {(query ||
                    scope !== "all" ||
                    selectedCategory !== "all" ||
                    selectedSubcategory !== "all" ||
                    selectedSort !== "updated") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        React.startTransition(() => {
                          setQuery("")
                          setScope("all")
                          setSelectedCategory("all")
                          setSelectedSubcategory("all")
                          setSelectedSort("updated")
                        })
                      }}
                    >
                      <Undo2 className="size-4" />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              </div>

              <Button asChild>
                <Link href="/dashboard/catalogue/nouveau">Ajouter un produit</Link>
              </Button>
            </div>

            <div className="grid gap-3 rounded-[1.35rem] border border-border/70 bg-muted/16 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(240px,0.9fr)]">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
                  <FolderKanban className="size-4" />
                  Gamme
                </p>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    React.startTransition(() => {
                      setSelectedCategory(value)
                      setSelectedSubcategory("all")
                    })
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-[1rem] bg-background">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {availableCategoryOptions.map((category) => (
                      <SelectItem key={category.slug} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
                  <FolderKanban className="size-4" />
                  Famille
                </p>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger className="h-11 w-full rounded-[1rem] bg-background">
                    <SelectValue placeholder="Toutes les familles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les familles</SelectItem>
                    {availableSubcategoryOptions.map((subcategory) => (
                      <SelectItem key={subcategory.slug} value={subcategory.slug}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
                  <SlidersHorizontal className="size-4" />
                  Tri de la liste
                </p>
                <Select
                  value={selectedSort}
                  onValueChange={(value) => {
                    if (isCatalogSort(value)) {
                      setSelectedSort(value)
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-[1rem] bg-background">
                    <SelectValue placeholder="Choisir un tri" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div
            className="rounded-[1.3rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm"
            aria-live="polite"
          >
            <span className="font-medium">{filteredProducts.length} fiche(s)</span>
            <span className="text-muted-foreground">
              {normalizedQuery.length > 0
                ? ` correspondent à "${deferredQuery.trim()}".`
                : " visibles dans le catalogue admin."}
            </span>
            <span className="ml-2 text-muted-foreground">
              Tri actuel :{" "}
              <span className="font-medium text-foreground">
                {sortOptions.find((option) => option.value === selectedSort)?.label.toLowerCase()}
              </span>
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.3rem] border border-border/70 bg-muted/20 p-4"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {quickResults.length > 0 ? (
        <Card className="border-primary/20 bg-primary/[0.04]">
          <CardHeader className="border-b border-primary/15">
            <CardTitle>Accès direct aux meilleures correspondances</CardTitle>
            <CardDescription>
              Ouvrez directement la fiche d&apos;édition du bon article sans parcourir toute
              la table.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 lg:grid-cols-2">
            {quickResults.map((product, index) => (
              <article
                key={product.id}
                className="rounded-[1.3rem] border border-border/70 bg-card/92 p-4 shadow-[0_20px_60px_-48px_rgba(23,19,18,0.38)]"
              >
                <div className="flex items-start gap-4">
                  <div className="size-20 overflow-hidden rounded-[1.1rem] border border-border/70 bg-muted/20">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {index === 0 ? <Badge>Résultat prioritaire</Badge> : null}
                      <ProductBadges product={product} />
                    </div>

                    <div>
                      <p className="truncate text-base font-semibold">{product.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {product.brand} - Ref. {product.sku}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.categoryName}
                        {product.subcategoryName ? ` / ${product.subcategoryName}` : ""}
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Dernière mise à jour{" "}
                      {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
                    </p>

                    <ProductPriceBreakdown product={product} />

                    <ProductActions product={product} />
                  </div>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {filteredProducts.length === 0 ? (
        <Card className="border-border/70 bg-card/92">
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-base font-medium">Aucun article ne correspond à la recherche.</p>
            <p className="text-sm text-muted-foreground">
              Essayez un autre nom, une référence SKU, un slug ou réinitialisez le filtre.
            </p>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  React.startTransition(() => {
                    setQuery("")
                    setScope("all")
                    setSelectedCategory("all")
                    setSelectedSubcategory("all")
                    setSelectedSort("updated")
                  })
                }}
              >
                <Undo2 className="size-4" />
                Revenir à tout le catalogue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 xl:hidden">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.5rem] border border-border/70 bg-card/92 p-5 shadow-[0_20px_60px_-48px_rgba(23,19,18,0.38)]"
              >
                <div className="flex items-start gap-4">
                  <div className="size-20 overflow-hidden rounded-[1.1rem] border border-border/70 bg-muted/20">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <Link
                        href={getProductHref(product)}
                        className="inline-flex items-center gap-2 text-base font-semibold text-foreground transition hover:text-primary"
                      >
                        {product.name}
                        <PencilLine className="size-4" />
                      </Link>
                      <p className="truncate text-sm text-muted-foreground">
                        {product.brand} - Ref. {product.sku}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.slug}
                      </p>
                    </div>

                    <ProductBadges product={product} />

                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <p>{product.categoryName}</p>
                      <p>
                        MAJ{" "}
                        {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
                      </p>
                    </div>

                    <ProductPriceBreakdown product={product} />

                    <ProductActions product={product} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden gap-4 xl:grid">
            {filteredProducts.map((product) => (
              <DesktopProductRow key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
