import { CatalogAdminBrowser } from "@/components/dashboard/catalog-admin-browser"
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
      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Catalogue produit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <p className="max-w-3xl text-sm text-muted-foreground">
            Retrouvez rapidement une fiche et ouvrez son editeur directement depuis
            la liste. La recherche et les raccourcis d&apos;edition ci-dessous sont
            penses pour eviter les allers-retours inutiles.
          </p>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.3rem] border border-border/70 bg-muted/20 p-4"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
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
