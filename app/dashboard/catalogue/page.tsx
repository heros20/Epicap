import Image from "next/image"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { requireRole } from "@/lib/auth/server"
import { getAdminCatalogProducts, getCatalogProductHref } from "@/lib/catalog/data"
import { pickFirstSearchParam } from "@/lib/catalog/shared"

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
})

export default async function DashboardCataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole(["admin", "super_admin"], "/dashboard/catalogue")

  const params = await searchParams
  const query = pickFirstSearchParam(params.q)?.trim().toLowerCase() ?? ""
  const scope = pickFirstSearchParam(params.scope) ?? "all"
  const error = pickFirstSearchParam(params.error)
  const success = pickFirstSearchParam(params.success)

  const products = await getAdminCatalogProducts()
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.categoryName.toLowerCase().includes(query)

    if (!matchesQuery) {
      return false
    }

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
  })

  const stats = [
    {
      label: "Produits",
      value: products.length,
    },
    {
      label: "Publies",
      value: products.filter((product) => product.isActive).length,
    },
    {
      label: "Location",
      value: products.filter((product) => product.isRentable).length,
    },
    {
      label: "Documents",
      value: products.filter((product) => product.documents.length > 0).length,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Catalogue produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.3rem] border border-border/70 bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>

          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}

          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
              <div>
                <label htmlFor="catalog-search" className="mb-2 block text-sm font-medium">
                  Rechercher
                </label>
                <Input
                  id="catalog-search"
                  name="q"
                  defaultValue={query}
                  placeholder="Titre, SKU, marque ou categorie"
                />
              </div>
              <div>
                <label htmlFor="scope" className="mb-2 block text-sm font-medium">
                  Filtre
                </label>
                <select
                  id="scope"
                  name="scope"
                  defaultValue={scope}
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                >
                  <option value="all">Tous</option>
                  <option value="active">Publies</option>
                  <option value="inactive">Brouillons</option>
                  <option value="rentable">Location</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="mt-auto">
                  Filtrer
                </Button>
                <Button type="button" variant="outline" asChild className="mt-auto">
                  <Link href="/dashboard/catalogue">Reset</Link>
                </Button>
              </div>
            </form>

            <Button asChild>
              <Link href="/dashboard/catalogue/nouveau">Ajouter un produit</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
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
                  <TableCell>
                    <div className="flex items-center gap-4">
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
                      <div className="min-w-0">
                        <p className="truncate font-medium">{product.name}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {product.brand} · Ref. {product.sku}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.subcategoryName ?? "Sans sous-categorie"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{currencyFormatter.format(product.price)}</p>
                      {product.isRentable && product.rentalPriceDaily ? (
                        <p className="text-xs text-muted-foreground">
                          {currencyFormatter.format(product.rentalPriceDaily)} / jour
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Publie" : "Brouillon"}
                      </Badge>
                      {product.isRentable ? <Badge variant="outline">Location</Badge> : null}
                      {product.documents.length > 0 ? (
                        <Badge variant="outline">{product.documents.length} doc(s)</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.updatedAt ? dateFormatter.format(new Date(product.updatedAt)) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={getCatalogProductHref(product)} target="_blank">
                          Voir
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/dashboard/catalogue/${product.id}`}>Modifier</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    Aucun produit ne correspond au filtre courant.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageBox({
  tone,
  message,
}: {
  tone: "error" | "success"
  message: string
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-destructive/20 bg-destructive/6 text-destructive"
          : "border-success/20 bg-success/8 text-success"
      }`}
    >
      {message}
    </div>
  )
}
