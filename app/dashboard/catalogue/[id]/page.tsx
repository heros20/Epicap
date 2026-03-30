import { notFound } from "next/navigation"

import { CatalogProductForm } from "@/components/dashboard/catalog-product-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteCatalogProductAction } from "@/lib/catalog/actions"
import { getAdminCatalogProductById, getCatalogProductHref } from "@/lib/catalog/data"
import { requireRole } from "@/lib/auth/server"
import { pickFirstSearchParam } from "@/lib/catalog/shared"

export default async function DashboardCatalogueEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole(["admin", "super_admin"], "/dashboard/catalogue")

  const { id } = await params
  const product = await getAdminCatalogProductById(Number(id))

  if (!product) {
    notFound()
  }

  const resolvedSearchParams = await searchParams
  const error = pickFirstSearchParam(resolvedSearchParams.error)
  const success = pickFirstSearchParam(resolvedSearchParams.success)

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Edition produit</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Publie" : "Brouillon"}
              </Badge>
              {product.isRentable ? <Badge variant="outline">Location</Badge> : null}
            </div>
            <h2 className="mt-3 text-2xl font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.brand} · Ref. {product.sku}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href={getCatalogProductHref(product)} target="_blank">
                Voir la fiche publique
              </a>
            </Button>
            <form action={deleteCatalogProductAction}>
              <input type="hidden" name="productId" value={product.id} />
              <Button variant="destructive" type="submit">
                Supprimer
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <CatalogProductForm product={product} error={error} success={success} />
    </div>
  )
}
