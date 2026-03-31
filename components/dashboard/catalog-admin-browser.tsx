"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ExternalLink, PencilLine, Search, Undo2, X } from "lucide-react"

import type { CatalogEntry } from "@/lib/catalog/data"
import { buildCatalogProductHref } from "@/lib/catalog/shared"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

type CatalogScope = "all" | "active" | "inactive" | "rentable"

const scopeOptions: Array<{ value: CatalogScope; label: string }> = [
  { value: "all", label: "Tous" },
  { value: "active", label: "Publies" },
  { value: "inactive", label: "Brouillons" },
  { value: "rentable", label: "Location" },
]

function isCatalogScope(value: string): value is CatalogScope {
  return scopeOptions.some((option) => option.value === value)
}

function matchesScope(product: CatalogEntry, scope: CatalogScope) {
  switch (scope) {
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

function ProductBadges({ product }: { product: CatalogEntry }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={product.isActive ? "default" : "secondary"}>
        {product.isActive ? "Publie" : "Brouillon"}
      </Badge>
      {product.isRentable ? <Badge variant="outline">Location</Badge> : null}
      {product.documents.length > 0 ? (
        <Badge variant="outline">{product.documents.length} doc(s)</Badge>
      ) : null}
    </div>
  )
}

function ProductActions({
  product,
  compact = false,
}: {
  product: CatalogEntry
  compact?: boolean
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
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

  const deferredQuery = React.useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredProducts = products
    .map((product, index) => ({
      product,
      index,
      score: getSearchScore(product, normalizedQuery),
    }))
    .filter(({ product, score }) => {
      if (!matchesScope(product, scope)) {
        return false
      }

      return normalizedQuery.length === 0 || score > 0
    })
    .sort((left, right) => {
      if (normalizedQuery.length > 0 && right.score !== left.score) {
        return right.score - left.score
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
    active: products.filter((product) => product.isActive).length,
    inactive: products.filter((product) => !product.isActive).length,
    rentable: products.filter((product) => product.isRentable).length,
  }

  const stats = [
    {
      label: "Resultats visibles",
      value: filteredProducts.length,
      detail:
        normalizedQuery.length > 0
          ? `sur ${products.length} fiches`
          : "liste complete triee par mise a jour",
    },
    {
      label: "Publies",
      value: filteredProducts.filter((product) => product.isActive).length,
      detail: "fiches actives dans la vue",
    },
    {
      label: "Brouillons",
      value: filteredProducts.filter((product) => !product.isActive).length,
      detail: "a finaliser ou corriger",
    },
    {
      label: "Location",
      value: filteredProducts.filter((product) => product.isRentable).length,
      detail: "produits disponibles a la location",
    },
  ]

  const quickResults = normalizedQuery.length > 0 ? filteredProducts.slice(0, 4) : []

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Trouver et modifier un article</CardTitle>
          <CardDescription>
            Recherche instantanee sur le nom, la reference, le slug, la marque, la
            categorie et les documents pour ouvrir la bonne fiche sans passer par un
            filtre a soumettre.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="w-full max-w-3xl space-y-4">
              <div>
                <label htmlFor="catalog-admin-search" className="mb-2 block text-sm font-medium">
                  Trouver un article a modifier
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="catalog-admin-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Nom, SKU, slug, marque, categorie ou document"
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
                  Astuce: une recherche par SKU ou slug remonte la bonne fiche en tete.
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
                {(query || scope !== "all") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      React.startTransition(() => {
                        setQuery("")
                        setScope("all")
                      })
                    }}
                  >
                    <Undo2 className="size-4" />
                    Reinitialiser
                  </Button>
                )}
              </div>
            </div>

            <Button asChild>
              <Link href="/dashboard/catalogue/nouveau">Ajouter un produit</Link>
            </Button>
          </div>

          <div
            className="rounded-[1.3rem] border border-border/70 bg-muted/20 px-4 py-3 text-sm"
            aria-live="polite"
          >
            <span className="font-medium">{filteredProducts.length} fiche(s)</span>
            <span className="text-muted-foreground">
              {normalizedQuery.length > 0
                ? ` correspondent a "${deferredQuery.trim()}".`
                : " visibles dans le catalogue admin."}
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
            <CardTitle>Acces direct aux meilleures correspondances</CardTitle>
            <CardDescription>
              Ouvrez directement la fiche d&apos;edition du bon article sans parcourir toute
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
                      {index === 0 ? <Badge>Resultat prioritaire</Badge> : null}
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
                      Derniere mise a jour{" "}
                      {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
                    </p>

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
            <p className="text-base font-medium">Aucun article ne correspond a la recherche.</p>
            <p className="text-sm text-muted-foreground">
              Essayez un autre nom, une reference SKU, un slug ou reinitialisez le filtre.
            </p>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  React.startTransition(() => {
                    setQuery("")
                    setScope("all")
                  })
                }}
              >
                <Undo2 className="size-4" />
                Revenir a tout le catalogue
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

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <p>{product.categoryName}</p>
                      <p className="sm:text-right">
                        {currencyFormatter.format(product.price)}
                        {product.isRentable && product.rentalPriceDaily
                          ? ` - ${currencyFormatter.format(product.rentalPriceDaily)} / jour`
                          : ""}
                      </p>
                      <p>
                        MAJ{" "}
                        {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
                      </p>
                    </div>

                    <ProductActions product={product} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Card className="hidden border-border/70 bg-card/92 xl:flex">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Gamme</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Etat</TableHead>
                    <TableHead>MAJ</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="whitespace-normal">
                        <Link
                          href={getProductHref(product)}
                          className="group -mx-2 flex items-center gap-4 rounded-[1.2rem] px-2 py-2 transition hover:bg-muted/30"
                        >
                          <div className="size-16 overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="size-full object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium transition group-hover:text-primary">
                                {product.name}
                              </p>
                              <PencilLine className="size-3.5 text-primary/80" />
                            </div>
                            <p className="truncate text-sm text-muted-foreground">
                              {product.brand} - Ref. {product.sku}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{product.slug}</p>
                            <p className="mt-1 text-xs font-medium text-primary/80">
                              Ouvrir l&apos;editeur produit
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{product.categoryName}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.subcategoryName ?? "Sans sous-categorie"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {currencyFormatter.format(product.price)}
                          </p>
                          {product.isRentable && product.rentalPriceDaily ? (
                            <p className="text-xs text-muted-foreground">
                              {currencyFormatter.format(product.rentalPriceDaily)} / jour
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <ProductBadges product={product} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {product.updatedAt
                          ? dateFormatter.format(new Date(product.updatedAt))
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActions product={product} compact />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
