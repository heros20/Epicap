import { NextResponse } from "next/server"

import { getCatalogProducts } from "@/lib/catalog/data"
import { categories, services } from "@/lib/data/navigation"

type SuggestionType = "product" | "category" | "subcategory" | "service"

interface SearchSuggestion {
  type: SuggestionType
  title: string
  description: string
  href: string
  badge: string
}

interface RankedSearchSuggestion extends SearchSuggestion {
  score: number
}

const MAX_SUGGESTIONS = 8

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function getMatchScore(query: string, candidate: string, weight: number) {
  const normalizedCandidate = normalize(candidate)
  if (!normalizedCandidate) {
    return 0
  }

  if (normalizedCandidate === query) {
    return 240 + weight
  }

  if (normalizedCandidate.startsWith(query)) {
    return 180 + weight
  }

  if (normalizedCandidate.includes(` ${query}`) || normalizedCandidate.includes(`-${query}`)) {
    return 140 + weight
  }

  if (normalizedCandidate.includes(query)) {
    return 100 + weight
  }

  return 0
}

function buildProductHref(categorySlug: string, subcategorySlug: string | undefined, productSlug: string) {
  return `/boutique/${categorySlug}/${subcategorySlug ? `${subcategorySlug}/` : ""}${productSlug}`
}

function dedupeSuggestions(suggestions: RankedSearchSuggestion[]) {
  const deduped = new Map<string, RankedSearchSuggestion>()

  for (const suggestion of suggestions) {
    const key = `${suggestion.type}:${suggestion.href}`
    const existingSuggestion = deduped.get(key)

    if (!existingSuggestion || suggestion.score > existingSuggestion.score) {
      deduped.set(key, suggestion)
    }
  }

  return [...deduped.values()]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""
  const normalizedQuery = normalize(query)

  if (normalizedQuery.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const products = await getCatalogProducts()

  const productSuggestions: RankedSearchSuggestion[] = products
    .flatMap((product) => {
      const score = Math.max(
        getMatchScore(normalizedQuery, product.name, 90),
        getMatchScore(normalizedQuery, product.brand, 45),
        getMatchScore(normalizedQuery, product.sku, 55),
        getMatchScore(normalizedQuery, product.shortDescription, 30),
      )

      if (score === 0) {
        return []
      }

      return [
        {
          type: "product" as const,
          title: product.name,
          description: `${product.brand} · Réf. ${product.sku}`,
          href: buildProductHref(product.categorySlug, product.subcategorySlug, product.slug),
          badge: "Produit",
          score,
        },
      ]
    })

  const categorySuggestions: RankedSearchSuggestion[] = categories
    .flatMap((category) => {
      const suggestions: RankedSearchSuggestion[] = []
      const categoryScore = Math.max(
        getMatchScore(normalizedQuery, category.name, 70),
        getMatchScore(normalizedQuery, category.shortName, 35),
      )

      if (categoryScore > 0) {
        suggestions.push({
          type: "category",
          title: category.name,
          description: category.description,
          href: `/boutique/${category.slug}`,
          badge: "Catégorie",
          score: categoryScore,
        })
      }

      for (const subcategory of category.subcategories) {
        const subcategoryScore = getMatchScore(normalizedQuery, subcategory.name, 60)
        if (subcategoryScore > 0) {
          suggestions.push({
            type: "subcategory",
            title: subcategory.name,
            description: category.name,
            href: `/boutique/${category.slug}?subcategory=${subcategory.slug}`,
            badge: "Sous-catégorie",
            score: subcategoryScore,
          })
        }
      }

      return suggestions
    })

  const serviceSuggestions: RankedSearchSuggestion[] = services
    .flatMap((service) => {
      const score = Math.max(
        getMatchScore(normalizedQuery, service.name, 65),
        getMatchScore(normalizedQuery, service.shortName, 35),
        getMatchScore(normalizedQuery, service.description, 20),
      )

      if (score === 0) {
        return []
      }

      return [
        {
          type: "service" as const,
          title: service.name,
          description: service.description,
          href: `/${service.slug}`,
          badge: "Service",
          score,
        },
      ]
    })

  const suggestions = dedupeSuggestions([
    ...productSuggestions,
    ...categorySuggestions,
    ...serviceSuggestions,
  ])
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "fr"))
    .slice(0, MAX_SUGGESTIONS)
    .map((suggestion) => ({
      type: suggestion.type,
      title: suggestion.title,
      description: suggestion.description,
      href: suggestion.href,
      badge: suggestion.badge,
    }))

  return NextResponse.json(
    { suggestions },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
