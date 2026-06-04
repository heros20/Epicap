import { notFound } from "next/navigation"

import { AdminSubmitButton } from "@/components/dashboard/admin-submit-button"
import { CatalogProductForm } from "@/components/dashboard/catalog-product-form"
import { PendingLinkButton } from "@/components/dashboard/pending-link-button"
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
      <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(33,186,146,0.16),transparent_28%),linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
        <CardHeader className="border-b border-background/10">
          <div className="flex flex-wrap gap-2">
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? "Publié" : "Brouillon"}
            </Badge>
            <Badge
              className={
                product.isRentable
                  ? "border border-emerald-300/20 bg-emerald-400/12 text-background"
                  : "border border-orange-300/20 bg-orange-400/12 text-background"
              }
            >
              {product.isRentable ? "Vente + location" : "Vente"}
            </Badge>
          </div>
          <CardTitle className="mt-3 text-3xl">Édition produit</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p className="mt-1 text-sm text-background/72">
              {product.brand} - Réf. {product.sku}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 px-4 py-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-background/66">
                  Vente
                </p>
                <p className="mt-2 font-semibold">{product.price} €</p>
              </div>
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-background/66">
                  Location
                </p>
                <p className="mt-2 font-semibold">
                  {product.isRentable && product.rentalPriceDaily
                    ? `${product.rentalPriceDaily} € / jour`
                    : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <a href={getCatalogProductHref(product)} target="_blank" rel="noreferrer">
                Voir la fiche publique
              </a>
            </Button>
            <PendingLinkButton
              href="/dashboard/catalogue"
              variant="secondary"
              pendingLabel="Retour..."
            >
              Retour catalogue
            </PendingLinkButton>
          </div>
        </CardContent>
      </Card>

      <CatalogProductForm product={product} error={error} success={success} />

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="border-b border-destructive/10">
          <CardTitle>Zone de suppression</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Supprimez cette fiche uniquement si elle ne doit plus exister dans le catalogue admin.
            Les médias rattachés à cette fiche seront également retirés du stockage.
          </div>
          <form action={deleteCatalogProductAction}>
            <input type="hidden" name="productId" value={product.id} />
            <AdminSubmitButton variant="destructive" pendingLabel="Suppression...">
              Supprimer le produit
            </AdminSubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
