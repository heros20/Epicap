import type { Product } from "@/lib/data/products"

export interface CartRecommendation {
  reason: string
  product: Product
}

const pf10Filter: Product = {
  id: 173,
  sku: "01141PF10P3",
  slug: "filtre-a-particules-solides-et-liquides-pro2000-pf10p3",
  name: "Filtre à Particules solides et liquides, PRO2000 PF10P3",
  shortDescription: "Filtre à particules solides et liquides PRO2000 PF10P3.",
  description: "Filtre à particules solides et liquides PRO2000 PF10P3.",
  price: 7.9,
  categorySlug: "decontamination",
  categoryName: "Décontamination",
  subcategorySlug: "pediluve",
  brand: "3M",
  image: "https://epicap.com/1942-large_default/filtre-a-particules-solides-et-liquides-pro2000-pf10p3.jpg",
  images: ["https://epicap.com/1942-large_default/filtre-a-particules-solides-et-liquides-pro2000-pf10p3.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const cf22Filter: Product = {
  id: 281,
  sku: "01141PF10A2P3",
  slug: "filtre-particulea2p3-gaz-et-vapeurs-organique-scott-cf22",
  name: "Filtre particule,A2P3 gaz et vapeurs organique 3M™ CF22",
  shortDescription: "Filtre particule A2P3 gaz et vapeurs organique 3M SCOTT CF22.",
  description: "Filtre particule A2P3 gaz et vapeurs organique 3M SCOTT CF22.",
  price: 22.55,
  categorySlug: "equipements-de-protection-respiratoire",
  categoryName: "Équipements de protection respiratoire",
  subcategorySlug: "3m-proflow-sc-amiante",
  brand: "3M",
  image: "https://epicap.com/1101-large_default/filtre-particulea2p3-gaz-et-vapeurs-organique-scott-cf22.jpg",
  images: ["https://epicap.com/1101-large_default/filtre-particulea2p3-gaz-et-vapeurs-organique-scott-cf22.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const phantomFilter: Product = {
  id: 276,
  sku: "01141PF251",
  slug: "filtre-p3-pf-251-2-type-psl-particules-solides-et-liquides-pour-phantom",
  name: "Filtre P3 Pour PHANTOM PF 251/2 type PSL-particules solides et liquides",
  shortDescription: "Filtre P3 PF 251/2 pour PHANTOM.",
  description: "Filtre P3 PF 251/2 type PSL particules solides et liquides pour PHANTOM.",
  price: 15.4,
  categorySlug: "equipements-de-protection-respiratoire",
  categoryName: "Équipements de protection respiratoire",
  subcategorySlug: "3m-phantom-vision",
  brand: "3M",
  image: "https://epicap.com/1467-large_default/filtre-p3-pf-251-2-type-psl-particules-solides-et-liquides-pour-phantom.jpg",
  images: ["https://epicap.com/1467-large_default/filtre-p3-pf-251-2-type-psl-particules-solides-et-liquides-pour-phantom.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const visionVisorFilm: Product = {
  id: 275,
  sku: "01124VISIONPROT",
  slug: "film-pelables-pour-visiere-de-masque-vision-scott3m",
  name: "Film pelables pour visière de masque VISION SCOTT/3M",
  shortDescription: "Films pelables pour visière de masque VISION SCOTT/3M.",
  description: "Films pelables pour visière de masque VISION SCOTT/3M.",
  price: 10.5,
  categorySlug: "equipements-de-protection-respiratoire",
  categoryName: "Équipements de protection respiratoire",
  subcategorySlug: "3m-phantom-vision",
  brand: "3M",
  image: "https://epicap.com/2565-large_default/film-pelables-pour-visiere-de-masque-vision-scott3m-.jpg",
  images: ["https://epicap.com/2565-large_default/film-pelables-pour-visiere-de-masque-vision-scott3m-.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const cubairHoneywellFilter: Product = {
  id: 320,
  sku: "01134P3DP",
  slug: "filtre-p3-honeywell-double-pas-de-vis-rd40-pour-cubair",
  name: "Filtre P3 Honeywell double pas de vis RD40 pour CUBAIR et MC 91",
  shortDescription: "Filtre P3 Honeywell double pas de vis RD40 pour CUBAIR.",
  description: "Filtre P3 Honeywell double pas de vis RD40 pour CUBAIR et MC 91.",
  price: 18,
  categorySlug: "equipements-de-protection-respiratoire",
  categoryName: "Équipements de protection respiratoire",
  subcategorySlug: "systeme-cubair-evolution-adduction-d-air",
  brand: "SPERIAN",
  image: "https://epicap.com/656-large_default/filtre-p3-honeywell-double-pas-de-vis-rd40-pour-cubair.jpg",
  images: ["https://epicap.com/656-large_default/filtre-p3-honeywell-double-pas-de-vis-rd40-pour-cubair.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const cubairScottFilter: Product = {
  id: 321,
  sku: "01134P3DPS",
  slug: "filtre-pro2000-pf-dt-scott-double-raccord-dn-40-pour-cubair",
  name: "Filtre PRO2000 PF-DT SCOTT double raccord DN 40 pour CUBAIR",
  shortDescription: "Filtre PRO2000 PF-DT SCOTT double raccord DN 40 pour CUBAIR.",
  description: "Filtre PRO2000 PF-DT SCOTT double raccord DN 40 pour CUBAIR.",
  price: 18,
  categorySlug: "equipements-de-protection-respiratoire",
  categoryName: "Équipements de protection respiratoire",
  subcategorySlug: "systeme-cubair-evolution-adduction-d-air",
  brand: "3M",
  image: "https://epicap.com/1023-large_default/filtre-pro2000-pf-dt-scott-double-raccord-dn-40-pour-cubair.jpg",
  images: ["https://epicap.com/1023-large_default/filtre-pro2000-pf-dt-scott-double-raccord-dn-40-pour-cubair.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

const numaticH13Cartridge: Product = {
  id: 60,
  sku: "0222HZC390LC",
  slug: "cartouche-de-filtration-jetable-securisee-h13-numatic-hzc390l-tuyau",
  name: "Cartouche de filtration jetable sécurisée H13 NUMATIC HZC390L + tuyau",
  shortDescription: "Cartouche de filtration jetable sécurisée H13 NUMATIC HZC390L avec tuyau.",
  description: "Cartouche de filtration jetable sécurisée H13 NUMATIC HZC390L avec tuyau.",
  price: 415,
  categorySlug: "aspirateurs-ponceuses-rectifieuses-de-sol",
  categoryName: "Aspirateurs, ponceuses et rectifieuses de sol",
  subcategorySlug: "numatic-aspirateurs-industriels-de-desamiantage",
  brand: "NUMATIC",
  image: "https://epicap.com/1800-large_default/cartouche-de-filtration-jetable-securisee-h13-numatic-hzc390l-tuyau.jpg",
  images: ["https://epicap.com/1800-large_default/cartouche-de-filtration-jetable-securisee-h13-numatic-hzc390l-tuyau.jpg"],
  inStock: true,
  stockQuantity: 999,
  specs: [],
  documents: [],
}

function includesAny(value: string, patterns: string[]) {
  return patterns.some((pattern) => value.includes(pattern))
}

function uniqueRecommendations(product: Product, recommendations: CartRecommendation[]) {
  const seen = new Set<number>([product.id])

  return recommendations.filter((recommendation) => {
    if (seen.has(recommendation.product.id) || recommendation.product.stockQuantity <= 0) {
      return false
    }

    seen.add(recommendation.product.id)
    return true
  })
}

export function getCartRecommendations(product: Product): CartRecommendation[] {
  const searchable = [
    product.slug,
    product.name,
    product.shortDescription,
    product.brand,
    product.subcategorySlug ?? "",
  ]
    .join(" ")
    .toLowerCase()

  const recommendations: CartRecommendation[] = []

  if (includesAny(searchable, ["vision-2", "vision2", "promask", "proflow"])) {
    recommendations.push(
      { product: pf10Filter, reason: "Cartouche compatible pour les masques 3M/Scott" },
      { product: cf22Filter, reason: "Alternative A2P3 pour gaz et vapeurs organiques" },
    )
  }

  if (includesAny(searchable, ["phantom"])) {
    recommendations.push(
      { product: phantomFilter, reason: "Filtre dédié au système PHANTOM" },
      { product: visionVisorFilm, reason: "Protection de visière à prévoir avec le masque" },
    )
  }

  if (includesAny(searchable, ["cubair", "optifit", "mc-91", "mc 91"])) {
    recommendations.push(
      { product: cubairHoneywellFilter, reason: "Filtre RD40 compatible CUBAIR et MC 91" },
      { product: cubairScottFilter, reason: "Filtre double raccord pour CUBAIR" },
    )
  }

  if (
    includesAny(searchable, ["hzc390l", "hzc 390", "numatic"]) &&
    !includesAny(searchable, ["cartouche", "filtration-jetable"])
  ) {
    recommendations.push({
      product: numaticH13Cartridge,
      reason: "Consommable H13 à prévoir avec l'aspirateur",
    })
  }

  return uniqueRecommendations(product, recommendations).slice(0, 2)
}

export function getProductHref(product: Product) {
  const categoryPath = product.subcategorySlug
    ? `${product.categorySlug}/${product.subcategorySlug}`
    : product.categorySlug

  return `/boutique/${categoryPath}/${product.slug}`
}
