import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { CircleDollarSign, PackageCheck, Truck } from "lucide-react"

import { saveCatalogProductAction } from "@/lib/catalog/actions"
import {
  catalogCategoryOptions,
  catalogSubcategoryOptions,
} from "@/lib/catalog/shared"
import type { CatalogEntry } from "@/lib/catalog/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CatalogProductForm({
  product,
  error,
  success,
}: {
  product?: CatalogEntry | null
  error?: string
  success?: string
}) {
  const specsText = product?.specs.map((spec) => `${spec.name}: ${spec.value}`).join("\n") ?? ""

  return (
    <form action={saveCatalogProductAction} className="space-y-6">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}

      {error ? <MessageBox tone="error" message={error} /> : null}
      {success ? <MessageBox tone="success" message={success} /> : null}

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Positionnement commercial</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 p-6 md:grid-cols-3">
          <OverviewTile
            icon={<CircleDollarSign className="size-4 text-orange-700" />}
            title="Mode"
            value={product?.isRentable ? "Vente + location" : "Vente"}
            helper={
              product?.isRentable
                ? "La fiche affiche un prix achat et un tarif journalier."
                : "La fiche est configuree en offre vente uniquement."
            }
            tone="sale"
          />
          <OverviewTile
            icon={<PackageCheck className="size-4 text-primary" />}
            title="Publication"
            value={product?.isActive ?? true ? "Publie" : "Brouillon"}
            helper={
              product?.inStock ?? true
                ? "Le produit est marque comme disponible."
                : "Le produit reste visible mais non disponible."
            }
            tone="neutral"
          />
          <OverviewTile
            icon={<Truck className="size-4 text-emerald-700" />}
            title="Medias"
            value={`${product?.images.length ?? 0} image(s)`}
            helper={`${product?.documents.length ?? 0} document(s) rattaché(s) à la fiche.`}
            tone="rental"
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Identite produit</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2">
          <Field label="Titre" htmlFor="name">
            <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
          </Field>
          <Field label="Marque" htmlFor="brand">
            <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} required />
          </Field>
          <Field label="SKU" htmlFor="sku">
            <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} required />
          </Field>
          <Field label="Slug" htmlFor="slug">
            <Input id="slug" name="slug" defaultValue={product?.slug ?? ""} required />
          </Field>
          <Field label="Catégorie" htmlFor="categorySlug">
            <select
              id="categorySlug"
              name="categorySlug"
              defaultValue={product?.categorySlug ?? catalogCategoryOptions[0]?.slug}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            >
              {catalogCategoryOptions.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sous-categorie" htmlFor="subcategorySlug">
            <select
              id="subcategorySlug"
              name="subcategorySlug"
              defaultValue={product?.subcategorySlug ?? ""}
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
            >
              <option value="">Aucune</option>
              {catalogSubcategoryOptions.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {subcategory.categoryName} - {subcategory.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="lg:col-span-2">
            <Field label="Résumé court" htmlFor="shortDescription">
              <Textarea
                id="shortDescription"
                name="shortDescription"
                defaultValue={product?.shortDescription ?? ""}
                rows={3}
                required
              />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Description détaillée" htmlFor="description">
              <Textarea
                id="description"
                name="description"
                defaultValue={product?.description ?? ""}
                rows={10}
                required
              />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Source Epicap ou constructeur" htmlFor="sourceUrl">
              <Input id="sourceUrl" name="sourceUrl" defaultValue={product?.sourceUrl ?? ""} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Offre commerciale et publication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.35rem] border border-orange-300/25 bg-orange-50/60 p-5">
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700">
                  Canal vente
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prix achat, stock et badge marketing visibles sur la fiche publique.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Prix HT" htmlFor="price">
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product?.price ?? 0}
                    required
                  />
                </Field>
                <Field label="Prix compare" htmlFor="compareAtPrice">
                  <Input
                    id="compareAtPrice"
                    name="compareAtPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product?.compareAtPrice ?? ""}
                  />
                </Field>
                <Field label="Stock" htmlFor="stockQuantity">
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    defaultValue={product?.stockQuantity ?? 0}
                    required
                  />
                </Field>
                <Field label="Badge" htmlFor="badge">
                  <Input id="badge" name="badge" defaultValue={product?.badge ?? ""} />
                </Field>
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-emerald-300/25 bg-emerald-50/60 p-5">
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Canal location
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Activez la location pour faire remonter la fiche dans le catalogue et sur la
                  page dédiée.
                </p>
              </div>
              <label className="flex items-center gap-3 rounded-[1.1rem] border border-emerald-300/25 bg-white/70 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="isRentable"
                  defaultChecked={product?.isRentable ?? false}
                  className="size-4"
                />
                Disponible en location
              </label>
              <div className="mt-4">
                <Field
                  label="Location / jour"
                  htmlFor="rentalPriceDaily"
                  description="Ce tarif est requis si la location est active."
                >
                  <Input
                    id="rentalPriceDaily"
                    name="rentalPriceDaily"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product?.rentalPriceDaily ?? ""}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <ToggleTile
              name="inStock"
              defaultChecked={product?.inStock ?? true}
              label="Produit disponible"
              description="État de disponibilité pour la vente."
            />
            <ToggleTile
              name="isActive"
              defaultChecked={product?.isActive ?? true}
              label="Publie sur le site"
              description="Visible dans le catalogue public."
            />
            <ToggleTile
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              label="Mise en avant"
              description="Eligible aux selections prioritaires."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Caractéristiques et documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <Field
            label="Caractéristiques"
            htmlFor="specsText"
            description="Une ligne par valeur, au format Nom: Valeur"
          >
            <Textarea id="specsText" name="specsText" defaultValue={specsText} rows={10} />
          </Field>

          <div className="space-y-6">
            <Field
              label="Photo principale"
              htmlFor="coverImage"
              description="La nouvelle photo principale passe en tete de galerie."
            >
              <Input id="coverImage" name="coverImage" type="file" accept="image/*" />
            </Field>

            <Field
              label="Galerie images"
              htmlFor="galleryImages"
              description="Ajoutez plusieurs images pour la fiche produit."
            >
              <Input id="galleryImages" name="galleryImages" type="file" accept="image/*" multiple />
            </Field>

            <Field
              label="Pieces jointes"
              htmlFor="documentFiles"
              description="PDF, DOCX, XLSX, CSV, ZIP ou autres documents utiles."
            >
              <Input
                id="documentFiles"
                name="documentFiles"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,image/*"
                multiple
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {product?.images.length ? (
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Galerie existante</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            {product.images.map((imageUrl, index) => (
              <label
                key={`${imageUrl}-${index}`}
                className="overflow-hidden rounded-[1.2rem] border border-border/70 bg-muted/20"
              >
                <Image
                  src={imageUrl}
                  alt={product.name}
                  width={960}
                  height={720}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <p className="font-medium">Image {index + 1}</p>
                    {index === 0 ? <Badge className="mt-2">Couverture</Badge> : null}
                  </div>
                  <span className="flex items-center gap-2">
                    <input type="checkbox" name="removeImages" value={imageUrl} className="size-4" />
                    Supprimer
                  </span>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {product?.documents.length ? (
        <Card className="border-border/70 bg-card/92">
          <CardHeader className="border-b border-border/70">
            <CardTitle>Documents existants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {product.documents.map((document) => (
              <label
                key={`${document.url}-${document.fileName}`}
                className="flex items-center justify-between gap-4 rounded-[1.1rem] border border-border/70 bg-muted/20 px-4 py-4 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{document.name}</p>
                  <p className="truncate text-muted-foreground">
                    {document.fileType || "Document"} {document.sizeLabel ? `- ${document.sizeLabel}` : ""}
                  </p>
                  <Link
                    href={document.url}
                    target="_blank"
                    className="mt-1 inline-block text-primary underline-offset-4 hover:underline"
                  >
                    Ouvrir le document
                  </Link>
                </div>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="removeDocuments"
                    value={document.url}
                    className="size-4"
                  />
                  Supprimer
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" asChild>
          <Link href="/dashboard/catalogue">Retour au catalogue</Link>
        </Button>
        <Button type="submit" size="lg">
          {product ? "Enregistrer le produit" : "Creer le produit"}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string
  htmlFor: string
  description?: string
  children: ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}

function OverviewTile({
  icon,
  title,
  value,
  helper,
  tone,
}: {
  icon: ReactNode
  title: string
  value: string
  helper: string
  tone: "sale" | "rental" | "neutral"
}) {
  const wrapperClass =
    tone === "sale"
      ? "border-orange-300/25 bg-orange-50/60"
      : tone === "rental"
        ? "border-emerald-300/25 bg-emerald-50/60"
        : "border-border/70 bg-muted/20"

  return (
    <div className={`rounded-[1.25rem] border p-4 ${wrapperClass}`}>
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <p className="mt-3 text-xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{helper}</p>
    </div>
  )
}

function ToggleTile({
  name,
  defaultChecked,
  label,
  description,
}: {
  name: string
  defaultChecked: boolean
  label: string
  description: string
}) {
  return (
    <label className="rounded-[1.15rem] border border-border/70 bg-muted/25 px-4 py-4">
      <span className="flex items-center gap-3">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4" />
        <span className="text-sm font-medium">{label}</span>
      </span>
      <span className="mt-3 block text-sm leading-6 text-muted-foreground">{description}</span>
    </label>
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
