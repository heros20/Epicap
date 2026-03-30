import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

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
    <form action={saveCatalogProductAction} encType="multipart/form-data" className="space-y-6">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}

      {error ? <MessageBox tone="error" message={error} /> : null}
      {success ? <MessageBox tone="success" message={success} /> : null}

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
          <Field label="Categorie" htmlFor="categorySlug">
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
            <Field label="Resume court" htmlFor="shortDescription">
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
            <Field label="Description detaillee" htmlFor="description">
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
          <CardTitle>Tarifs, stock et publication</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-2 xl:grid-cols-4">
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
          <Field label="Location / jour" htmlFor="rentalPriceDaily">
            <Input
              id="rentalPriceDaily"
              name="rentalPriceDaily"
              type="number"
              min="0"
              step="0.01"
              defaultValue={product?.rentalPriceDaily ?? ""}
            />
          </Field>
          <div className="space-y-3 xl:col-span-3">
            <label className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-muted/25 px-4 py-3 text-sm">
              <input
                type="checkbox"
                name="inStock"
                defaultChecked={product?.inStock ?? true}
                className="size-4"
              />
              Produit marque comme disponible
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-muted/25 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={product?.isActive ?? true}
                  className="size-4"
                />
                Publie sur le site
              </label>
              <label className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-muted/25 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="isFeatured"
                  defaultChecked={product?.isFeatured ?? false}
                  className="size-4"
                />
                Mise en avant
              </label>
              <label className="flex items-center gap-3 rounded-[1.1rem] border border-border/70 bg-muted/25 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="isRentable"
                  defaultChecked={product?.isRentable ?? false}
                  className="size-4"
                />
                Disponible en location
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/92">
        <CardHeader className="border-b border-border/70">
          <CardTitle>Caracteristiques et documents</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-6 lg:grid-cols-2">
          <Field
            label="Caracteristiques"
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
