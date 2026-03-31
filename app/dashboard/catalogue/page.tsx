import { CatalogAdminBrowser } from "@/components/dashboard/catalog-admin-browser"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireRole } from "@/lib/auth/server"
import { getAdminCatalogProducts } from "@/lib/catalog/data"
import { pickFirstSearchParam } from "@/lib/catalog/shared"

export default async function DashboardCataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole(["admin", "super_admin"], "/dashboard/catalogue")

  const params = await searchParams
  const query = pickFirstSearchParam(params.q)?.trim() ?? ""
  const scope = pickFirstSearchParam(params.scope) ?? "all"
  const error = pickFirstSearchParam(params.error)
  const success = pickFirstSearchParam(params.success)

  const products = await getAdminCatalogProducts()

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
      <Card className="overflow-hidden border-primary/20 bg-[radial-gradient(circle_at_top_right,rgba(24,180,156,0.14),transparent_30%),linear-gradient(135deg,#111317_0%,#1a1d22_100%)] text-background">
        <CardHeader className="border-b border-background/10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border border-background/14 bg-background/10 text-background">
              Back-office catalogue
            </Badge>
            <Badge className="border border-emerald-300/20 bg-emerald-400/12 text-background">
              Vente et location
            </Badge>
          </div>
          <CardTitle className="mt-3 text-3xl">Catalogue produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <p className="max-w-3xl text-sm leading-7 text-background/74">
            Le pilotage catalogue passe en mode cockpit: lecture instantanee des fiches,
            separation nette entre offre vente et offre location, acces direct a la
            creation et edition, puis suppression maitrisee depuis la fiche detaillee.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.3rem] border border-background/12 bg-background/8 p-4"
              >
                <p className="text-sm text-background/68">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold text-background">{stat.value}</p>
              </div>
            ))}
          </div>

          {error ? <MessageBox tone="error" message={error} /> : null}
          {success ? <MessageBox tone="success" message={success} /> : null}
        </CardContent>
      </Card>

      <CatalogAdminBrowser products={products} initialQuery={query} initialScope={scope} />
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
