import type { MetadataRoute } from "next"

import { getCatalogProducts } from "@/lib/catalog/data"
import { agencies, categories, services } from "@/lib/data/navigation"

const BASE_URL = "https://epicap.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalogProducts()
  const staticRoutes = [
    "",
    "/boutique",
    "/devis",
    "/location",
    "/maintenance",
    "/fit-test",
    "/contact",
    "/agences",
    "/a-propos",
    "/conditions-generales-de-vente",
    "/mentions-legales",
  ]

  return [
    ...staticRoutes.map((path) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency: (
        path === "" || path === "/boutique" ? "weekly" : "monthly"
      ) as MetadataRoute.Sitemap[number]["changeFrequency"],
      priority: path === "" ? 1 : 0.8,
    })),
    ...categories.map((category) => ({
      url: `${BASE_URL}/boutique/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...services.map((service) => ({
      url: `${BASE_URL}/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...agencies.map((agency) => ({
      url: `${BASE_URL}/agences/${agency.slug}`,
      changeFrequency: "monthly" as const,
      priority: agency.isHeadOffice ? 0.7 : 0.6,
    })),
    ...products.map((product) => ({
      url: `${BASE_URL}/boutique/${product.subcategorySlug ? `${product.categorySlug}/${product.subcategorySlug}` : product.categorySlug}/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: product.isFeatured ? 0.8 : 0.6,
    })),
  ]
}
