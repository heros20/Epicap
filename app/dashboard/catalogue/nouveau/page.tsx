import { CatalogProductForm } from "@/components/dashboard/catalog-product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/server"
import { pickFirstSearchParam } from "@/lib/catalog/shared"

export default async function DashboardCatalogueNewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole(["admin", "super_admin"], "/dashboard/catalogue/nouveau")

  const params = await searchParams
  const error = pickFirstSearchParam(params.error)
  const success = pickFirstSearchParam(params.success)

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Nouveau produit</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="max-w-3xl text-sm text-muted-foreground">
            Creez une fiche catalogue directement depuis le dashboard Epicap. La publication,
            les visuels, les documents et la location seront ensuite reflectes sur le site public.
          </p>
        </CardContent>
      </Card>

      <CatalogProductForm error={error} success={success} />
    </div>
  )
}
