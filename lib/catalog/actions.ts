"use server"

import { revalidatePath } from "next/cache"
import { redirect, unstable_rethrow } from "next/navigation"
import { z } from "zod"

import {
  CATALOG_ASSET_BUCKET,
  buildCatalogProductHref,
  isValidCategorySlug,
  isValidSubcategorySlug,
} from "@/lib/catalog/shared"
import { requireRole } from "@/lib/auth/server"
import type { ProductDocument } from "@/lib/data/products"
import type { Database, Json } from "@/types/supabase"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const catalogProductSchema = z
  .object({
    productId: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    name: z.string().trim().min(3, "Le titre du produit est requis."),
    sku: z.string().trim().min(2, "La reference SKU est requise."),
    slug: z
      .string()
      .trim()
      .min(3, "Le slug est requis.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Le slug doit être compatible URL."),
    brand: z.string().trim().min(2, "La marque est requise."),
    categorySlug: z.string().trim().refine(isValidCategorySlug, "Catégorie invalide."),
    subcategorySlug: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    shortDescription: z.string().trim().min(10, "Ajoutez un résumé court."),
    description: z.string().trim().min(20, "Ajoutez une description complete."),
    price: z.coerce.number().min(0, "Le prix doit être positif."),
    compareAtPrice: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    stockQuantity: z.coerce.number().int().min(0, "Le stock doit être positif."),
    badge: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
    sourceUrl: z.preprocess(
      emptyToUndefined,
      z.string().trim().url("URL source invalide.").optional(),
    ),
    rentalPriceDaily: z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional()),
    specsText: z.string().optional().default(""),
    inStock: z.boolean(),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isRentable: z.boolean(),
  })
  .refine(
    (value) =>
      !value.subcategorySlug || isValidSubcategorySlug(value.categorySlug, value.subcategorySlug),
    {
      path: ["subcategorySlug"],
      message: "Sous-categorie invalide pour cette gamme.",
    },
  )
  .refine((value) => !value.isRentable || (value.rentalPriceDaily ?? 0) > 0, {
    path: ["rentalPriceDaily"],
    message: "Renseignez un tarif journalier pour les produits louables.",
  })

const deleteSchema = z.object({
  productId: z.coerce.number().int().positive("Produit introuvable."),
})

function buildRedirect(pathname: string, key: "error" | "success", message: string) {
  const url = new URL(pathname, "http://localhost")
  url.searchParams.set(key, message)
  return `${url.pathname}?${url.searchParams.toString()}`
}

function getEditorPath(productId?: number) {
  return productId ? `/dashboard/catalogue/${productId}` : "/dashboard/catalogue/nouveau"
}

function asRecord(value: Json | null | undefined) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null
}

function asString(value: Json | undefined) {
  return typeof value === "string" ? value : undefined
}

function asStringArray(value: Json | null | undefined) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string")
}

function normalizeDocuments(value: Json | null | undefined): ProductDocument[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      const record = asRecord(item)
      if (!record) {
        return null
      }

      const url = asString(record.url)
      if (!url) {
        return null
      }

      const document: ProductDocument = {
        name: asString(record.name) ?? "Document",
        description: asString(record.description) ?? "",
        url,
        sizeLabel: asString(record.sizeLabel) ?? "",
        fileName: asString(record.fileName) ?? "",
        fileType: asString(record.fileType) ?? "",
        path: asString(record.path),
      }

      return document
    })
    .filter((item): item is ProductDocument => item !== null)
}

function parseSpecsText(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":")
      if (separatorIndex === -1) {
        return null
      }

      const name = line.slice(0, separatorIndex).trim()
      const specValue = line.slice(separatorIndex + 1).trim()

      if (!name || !specValue) {
        return null
      }

      return {
        name,
        value: specValue,
      }
    })
    .filter((item): item is { name: string; value: string } => Boolean(item))
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0
}

function toUploadFiles(values: FormDataEntryValue[]) {
  return values.filter((value): value is File => isUploadFile(value))
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
}

function toDocumentTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || fileName
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  if (size >= 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }

  return `${size} B`
}

function detectFileType(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop()?.toUpperCase() : null
  return extension ?? file.type.split("/").pop()?.toUpperCase() ?? "Fichier"
}

function getStoragePathFromUrl(url: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return null
  }

  const prefix = `${supabaseUrl}/storage/v1/object/public/${CATALOG_ASSET_BUCKET}/`
  if (!url.startsWith(prefix)) {
    return null
  }

  return decodeURIComponent(url.slice(prefix.length))
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  slug: string,
  file: File,
) {
  const fileName = sanitizeFileName(file.name)
  const objectPath = `products/${slug}/images/${Date.now()}-${crypto.randomUUID()}-${fileName}`
  const { error } = await supabase.storage.from(CATALOG_ASSET_BUCKET).upload(objectPath, file, {
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(`Upload image impossible: ${error.message}`)
  }

  const { data } = supabase.storage.from(CATALOG_ASSET_BUCKET).getPublicUrl(objectPath)
  return {
    path: objectPath,
    publicUrl: data.publicUrl,
  }
}

async function uploadDocument(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  slug: string,
  file: File,
) {
  const fileName = sanitizeFileName(file.name)
  const objectPath = `products/${slug}/documents/${Date.now()}-${crypto.randomUUID()}-${fileName}`
  const { error } = await supabase.storage.from(CATALOG_ASSET_BUCKET).upload(objectPath, file, {
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(`Upload document impossible: ${error.message}`)
  }

  const { data } = supabase.storage.from(CATALOG_ASSET_BUCKET).getPublicUrl(objectPath)
  return {
    path: objectPath,
    publicUrl: data.publicUrl,
    document: {
      name: toDocumentTitle(file.name),
      description: toDocumentTitle(file.name),
      url: data.publicUrl,
      sizeLabel: formatFileSize(file.size),
      fileName: file.name,
      fileType: detectFileType(file),
      path: objectPath,
    } satisfies ProductDocument,
  }
}

async function removeStoragePaths(
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"],
  paths: string[],
) {
  const uniquePaths = [...new Set(paths.filter(Boolean))]
  if (uniquePaths.length === 0) {
    return
  }

  for (let index = 0; index < uniquePaths.length; index += 100) {
    await supabase.storage
      .from(CATALOG_ASSET_BUCKET)
      .remove(uniquePaths.slice(index, index + 100))
  }
}

function collectProductPaths(product: Pick<ProductRow, "image" | "images" | "documents">) {
  const imagePaths = asStringArray(product.images)
    .map((image) => getStoragePathFromUrl(image))
    .filter((value): value is string => Boolean(value))

  if (product.image) {
    const coverPath = getStoragePathFromUrl(product.image)
    if (coverPath) {
      imagePaths.push(coverPath)
    }
  }

  const documentPaths = normalizeDocuments(product.documents)
    .map((document) => document.path ?? getStoragePathFromUrl(document.url))
    .filter((value): value is string => Boolean(value))

  return [...imagePaths, ...documentPaths]
}

function revalidateCatalogPages(product?: Pick<ProductRow, "category_slug" | "subcategory_slug" | "slug"> | null) {
  const paths = new Set<string>([
    "/",
    "/boutique",
    "/location",
    "/maintenance",
    "/fit-test",
    "/dashboard/catalogue",
  ])

  if (product) {
    paths.add(`/boutique/${product.category_slug}`)
    paths.add(
      buildCatalogProductHref({
        categorySlug: product.category_slug,
        subcategorySlug: product.subcategory_slug,
        slug: product.slug,
      }),
    )
  }

  for (const path of paths) {
    revalidatePath(path)
  }
}

export async function saveCatalogProductAction(formData: FormData) {
  const rawValues = {
    productId: formData.get("productId"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    slug: formData.get("slug"),
    brand: formData.get("brand"),
    categorySlug: formData.get("categorySlug"),
    subcategorySlug: formData.get("subcategorySlug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    stockQuantity: formData.get("stockQuantity"),
    badge: formData.get("badge"),
    sourceUrl: formData.get("sourceUrl"),
    rentalPriceDaily: formData.get("rentalPriceDaily"),
    specsText: formData.get("specsText"),
    inStock: formData.get("inStock") === "on",
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isRentable: formData.get("isRentable") === "on",
  }

  const parsed = catalogProductSchema.safeParse(rawValues)
  const editorPath = getEditorPath(
    typeof rawValues.productId === "string" ? Number(rawValues.productId) : undefined,
  )

  if (!parsed.success) {
    redirect(
      buildRedirect(
        editorPath,
        "error",
        parsed.error.issues[0]?.message ?? "Produit invalide.",
      ),
    )
  }

  const authState = await requireRole(["admin", "super_admin"], "/dashboard/catalogue")
  const { supabase } = authState

  const coverImage = formData.get("coverImage")
  const galleryImages = toUploadFiles(formData.getAll("galleryImages"))
  const documentFiles = toUploadFiles(formData.getAll("documentFiles"))
  const removeImages = new Set(
    formData.getAll("removeImages").filter((value): value is string => typeof value === "string"),
  )
  const removeDocuments = new Set(
    formData
      .getAll("removeDocuments")
      .filter((value): value is string => typeof value === "string"),
  )

  let previousProduct: Pick<
    ProductRow,
    | "id"
    | "slug"
    | "category_slug"
    | "subcategory_slug"
    | "image"
    | "images"
    | "documents"
    | "source_url"
  > | null = null

  if (parsed.data.productId) {
    const { data } = await supabase
      .from("products")
      .select("id, slug, category_slug, subcategory_slug, image, images, documents, source_url")
      .eq("id", parsed.data.productId)
      .maybeSingle()

    previousProduct = data ?? null

    if (!previousProduct) {
      redirect(buildRedirect("/dashboard/catalogue", "error", "Produit introuvable."))
    }
  }

  const previousImages = previousProduct ? asStringArray(previousProduct.images) : []
  const previousDocuments = previousProduct ? normalizeDocuments(previousProduct.documents) : []
  const existingImages = previousImages.filter((image) => !removeImages.has(image))
  const existingDocuments = previousDocuments.filter((document) => !removeDocuments.has(document.url))

  const uploadedPaths: string[] = []

  try {
    const nextImages = [...existingImages]

    if (isUploadFile(coverImage)) {
      const uploadedCover = await uploadImage(supabase, parsed.data.slug, coverImage)
      uploadedPaths.push(uploadedCover.path)
      nextImages.unshift(uploadedCover.publicUrl)
    }

    for (const imageFile of galleryImages) {
      const uploadedImage = await uploadImage(supabase, parsed.data.slug, imageFile)
      uploadedPaths.push(uploadedImage.path)
      nextImages.push(uploadedImage.publicUrl)
    }

    const nextDocuments = [...existingDocuments]
    for (const documentFile of documentFiles) {
      const uploadedDocument = await uploadDocument(supabase, parsed.data.slug, documentFile)
      uploadedPaths.push(uploadedDocument.path)
      nextDocuments.push(uploadedDocument.document)
    }

    const payload: Database["public"]["Tables"]["products"]["Insert"] = {
      sku: parsed.data.sku,
      slug: parsed.data.slug,
      name: parsed.data.name,
      short_description: parsed.data.shortDescription,
      description: parsed.data.description,
      price: parsed.data.price,
      compare_at_price: parsed.data.compareAtPrice ?? null,
      category_slug: parsed.data.categorySlug,
      subcategory_slug: parsed.data.subcategorySlug ?? null,
      brand: parsed.data.brand,
      image: nextImages[0] ?? null,
      images: nextImages,
      in_stock: parsed.data.inStock,
      is_active: parsed.data.isActive,
      is_featured: parsed.data.isFeatured,
      is_new: false,
      is_rentable: parsed.data.isRentable,
      rental_price_daily: parsed.data.isRentable ? parsed.data.rentalPriceDaily ?? null : null,
      badge: parsed.data.badge ?? null,
      specs: parseSpecsText(parsed.data.specsText),
      documents: nextDocuments as unknown as Json,
      stock_quantity: parsed.data.stockQuantity,
      related_product_ids: [],
      source_url: parsed.data.sourceUrl ?? null,
    }

    const response = previousProduct
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", previousProduct.id)
          .select("id, slug, category_slug, subcategory_slug")
          .single()
      : await supabase
          .from("products")
          .insert(payload)
          .select("id, slug, category_slug, subcategory_slug")
          .single()

    if (response.error || !response.data) {
      throw new Error(response.error?.message ?? "Enregistrement impossible.")
    }

    const removedPaths = [
      ...[...removeImages].map((url) => getStoragePathFromUrl(url)).filter((value): value is string => Boolean(value)),
      ...previousDocuments
        .filter((document) => removeDocuments.has(document.url))
        .map((document) => document.path ?? getStoragePathFromUrl(document.url))
        .filter((value): value is string => Boolean(value)),
    ]

    await removeStoragePaths(supabase, removedPaths)

    revalidateCatalogPages(previousProduct)
    revalidateCatalogPages(response.data)

    redirect(
      buildRedirect(
        `/dashboard/catalogue/${response.data.id}`,
        "success",
        previousProduct ? "Produit mis à jour." : "Produit créé.",
      ),
    )
  } catch (error) {
    unstable_rethrow(error)

    await removeStoragePaths(supabase, uploadedPaths)

    redirect(
      buildRedirect(
        editorPath,
        "error",
        error instanceof Error ? error.message : "Enregistrement impossible.",
      ),
    )
  }
}

export async function deleteCatalogProductAction(formData: FormData) {
  const parsed = deleteSchema.safeParse({
    productId: formData.get("productId"),
  })

  if (!parsed.success) {
    redirect(buildRedirect("/dashboard/catalogue", "error", "Produit introuvable."))
  }

  const { supabase } = await requireRole(["admin", "super_admin"], "/dashboard/catalogue")
  const { data: product } = await supabase
    .from("products")
    .select("id, slug, category_slug, subcategory_slug, image, images, documents")
    .eq("id", parsed.data.productId)
    .maybeSingle()

  if (!product) {
    redirect(buildRedirect("/dashboard/catalogue", "error", "Produit introuvable."))
  }

  const { error } = await supabase.from("products").delete().eq("id", product.id)

  if (error) {
    redirect(buildRedirect(`/dashboard/catalogue/${product.id}`, "error", error.message))
  }

  await removeStoragePaths(supabase, collectProductPaths(product))
  revalidateCatalogPages(product)
  redirect(buildRedirect("/dashboard/catalogue", "success", "Produit supprime."))
}
