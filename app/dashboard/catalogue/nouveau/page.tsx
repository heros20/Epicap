import { CatalogProductForm } from "@/components/dashboard/catalog-product-form"
import { Badge } from "@/components/ui/badge"
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
      <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(33,186,146,0.16),transparent_28%),linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
        <CardHeader className="border-b border-background/10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-background/14 bg-background/10 text-background">
              Creation
            </Badge>
            <Badge className="border border-emerald-300/20 bg-emerald-400/12 text-background">
              Vente / location
            </Badge>
          </div>
          <CardTitle className="mt-3 text-3xl">Nouvelle fiche produit</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="max-w-3xl text-sm leading-7 text-background/74">
            Creez une reference depuis le cockpit Epicap, puis reglez clairement sa logique
            commerciale : vente seule ou vente + location, avec publication, médias et documents
            reliés à la même fiche.
          </p>
        </CardContent>
      </Card>

      <CatalogProductForm error={error} success={success} />
    </div>
  )
}
