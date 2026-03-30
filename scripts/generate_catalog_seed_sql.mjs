import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const sourcePath = path.join(repoRoot, "lib", "data", "epicap-catalog.generated.json")
const outputPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260330235600_seed_epicap_catalog.sql",
)

const catalog = JSON.parse(fs.readFileSync(sourcePath, "utf8"))

function sqlString(value) {
  if (value === null || value === undefined) {
    return "null"
  }

  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlBoolean(value) {
  return value ? "true" : "false"
}

function sqlNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "null"
  }

  return String(Number(value))
}

function sqlJson(value) {
  return `${sqlString(JSON.stringify(value ?? []))}::jsonb`
}

function sqlBigintArray(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "'{}'::bigint[]"
  }

  return `array[${value.map((item) => Number(item)).join(", ")}]::bigint[]`
}

const topLevelCategories = catalog.categories.map((category, index) => ({
  name: category.name,
  slug: category.slug,
  description: category.description ?? null,
  parentSlug: null,
  sortOrder: index + 1,
}))

const subcategories = catalog.categories.flatMap((category, categoryIndex) =>
  category.subcategories.map((subcategory, subcategoryIndex) => ({
    name: subcategory.name,
    slug: subcategory.slug,
    description: null,
    parentSlug: category.slug,
    sortOrder: (categoryIndex + 1) * 100 + subcategoryIndex + 1,
  })),
)

const categoryRows = [...topLevelCategories, ...subcategories]
const uniqueSkuCounts = new Map()
const uniqueSlugCounts = new Map()

function makeUniqueKey(value, counts) {
  const baseValue = String(value ?? "").trim()
  const nextCount = (counts.get(baseValue) ?? 0) + 1
  counts.set(baseValue, nextCount)

  if (nextCount === 1) {
    return baseValue
  }

  return `${baseValue}-${nextCount}`
}

const normalizedProducts = catalog.products.map((product) => ({
  ...product,
  sku: makeUniqueKey(product.sku, uniqueSkuCounts),
  slug: makeUniqueKey(product.slug, uniqueSlugCounts),
}))

const productColumns = [
  "sku",
  "slug",
  "name",
  "short_description",
  "description",
  "price",
  "compare_at_price",
  "category_slug",
  "subcategory_slug",
  "brand",
  "image",
  "images",
  "in_stock",
  "stock_quantity",
  "is_new",
  "is_featured",
  "is_rentable",
  "rental_price_daily",
  "badge",
  "specs",
  "documents",
  "related_product_ids",
  "source_url",
  "is_active",
]

const categoryValues = categoryRows
  .map(
    (category) =>
      `  (${[
        sqlString(category.name),
        sqlString(category.slug),
        sqlString(category.description),
        sqlString(category.parentSlug),
        sqlNumber(category.sortOrder),
        "true",
      ].join(", ")})`,
  )
  .join(",\n")

const productValues = normalizedProducts
  .map((product) => {
    const rentalPriceDaily =
      product.isRentable && product.rentalPriceDaily == null
        ? Math.max(1, Math.round(Number(product.price ?? 0) * 5) / 100)
        : product.rentalPriceDaily

    const values = [
      sqlString(product.sku),
      sqlString(product.slug),
      sqlString(product.name),
      sqlString(product.shortDescription ?? product.name),
      sqlString(product.description ?? product.shortDescription ?? product.name),
      sqlNumber(product.price ?? 0),
      sqlNumber(product.compareAtPrice),
      sqlString(product.categorySlug),
      sqlString(product.subcategorySlug),
      sqlString(product.brand ?? "Epicap"),
      sqlString(product.image),
      sqlJson(product.images ?? []),
      sqlBoolean(Boolean(product.inStock)),
      sqlNumber(product.stockQuantity ?? 0),
      sqlBoolean(Boolean(product.isNew)),
      sqlBoolean(Boolean(product.isFeatured)),
      sqlBoolean(Boolean(product.isRentable)),
      sqlNumber(rentalPriceDaily),
      sqlString(product.badge),
      sqlJson(product.specs ?? []),
      sqlJson(product.documents ?? []),
      sqlBigintArray(product.relatedProducts ?? []),
      sqlString(product.sourceUrl),
      "true",
    ]

    return `  (${values.join(", ")})`
  })
  .join(",\n")

const sql = `-- Generated from lib/data/epicap-catalog.generated.json
-- Products: ${catalog.products.length}
-- Categories: ${catalog.categories.length}

truncate table public.products restart identity cascade;
truncate table public.product_categories cascade;

insert into public.product_categories (
  name,
  slug,
  description,
  parent_slug,
  sort_order,
  is_active
)
values
${categoryValues};

insert into public.products (
  ${productColumns.join(",\n  ")}
)
values
${productValues};

select setval(
  pg_get_serial_sequence('public.products', 'id'),
  coalesce((select max(id) from public.products), 1),
  true
);
`

fs.writeFileSync(outputPath, sql, "utf8")

console.log(`Wrote ${outputPath}`)
