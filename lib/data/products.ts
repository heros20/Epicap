// Mock product data for Epicap e-commerce
// Will be replaced by Supabase data later

export interface Product {
  id: number
  sku: string
  slug: string
  name: string
  shortDescription: string
  description: string
  price: number
  compareAtPrice?: number
  categorySlug: string
  categoryName: string
  subcategorySlug?: string
  brand: string
  image: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  isNew?: boolean
  isFeatured?: boolean
  isRentable?: boolean
  rentalPriceDaily?: number
  badge?: string
  specs: { name: string; value: string }[]
  relatedProducts?: number[]
}

export const products: Product[] = [
  // EPI - Equipements de protection individuelle
  {
    id: 1,
    sku: "EPI-COMB-001",
    slug: "combinaison-tyvek-classic-xpert-type-5-6",
    name: "Combinaison Tyvek Classic Xpert Type 5/6",
    shortDescription: "Combinaison de protection contre les particules et projections légères",
    description: "La combinaison Tyvek Classic Xpert offre une protection fiable contre les particules sèches et les projections légères. Certifiée Type 5/6, elle est idéale pour les travaux de désamiantage. Tissu respirant et léger pour un confort optimal.",
    price: 8.90,
    categorySlug: "epi",
    categoryName: "Equipements de protection individuelle",
    subcategorySlug: "combinaisons-jetables",
    brand: "DuPont",
    image: "/images/products/combinaison-tyvek.jpg",
    images: ["/images/products/combinaison-tyvek.jpg"],
    inStock: true,
    stockQuantity: 500,
    badge: "Best-seller",
    isFeatured: true,
    specs: [
      { name: "Type", value: "5/6" },
      { name: "Matière", value: "Tyvek" },
      { name: "Tailles disponibles", value: "S à 3XL" },
      { name: "Couleur", value: "Blanc" },
      { name: "Conditionnement", value: "25 pièces/carton" },
    ],
    relatedProducts: [2, 3, 4],
  },
  {
    id: 2,
    sku: "EPI-MASQ-001",
    slug: "masque-complet-3m-serie-6800",
    name: "Masque complet 3M série 6800",
    shortDescription: "Masque complet réutilisable pour protection respiratoire",
    description: "Masque complet 3M série 6800 offrant une excellente protection respiratoire. Compatible avec une large gamme de filtres 3M. Jupe faciale en silicone pour un ajustement confortable et étanche.",
    price: 189,
    categorySlug: "epi",
    categoryName: "Equipements de protection individuelle",
    subcategorySlug: "masques-filtres",
    brand: "3M",
    image: "/images/products/masque-3m.jpg",
    images: ["/images/products/masque-3m.jpg"],
    inStock: true,
    stockQuantity: 45,
    isFeatured: true,
    specs: [
      { name: "Type", value: "Masque complet" },
      { name: "Taille", value: "M (6800)" },
      { name: "Matière jupe", value: "Silicone" },
      { name: "Oculaire", value: "Polycarbonate anti-rayures" },
      { name: "Certification", value: "EN 136:1998" },
    ],
    relatedProducts: [3, 5],
  },
  {
    id: 3,
    sku: "EPI-FILT-001",
    slug: "filtre-p3-3m-2138",
    name: "Filtres P3 3M 2138 (paire)",
    shortDescription: "Filtres particules P3 avec charbon actif",
    description: "Filtres P3 avec couche de charbon actif contre les particules et vapeurs organiques. Compatibles avec les demi-masques et masques complets 3M séries 6000, 7000 et FF-400.",
    price: 18.50,
    categorySlug: "epi",
    categoryName: "Equipements de protection individuelle",
    subcategorySlug: "masques-filtres",
    brand: "3M",
    image: "/images/products/filtres-p3.jpg",
    images: ["/images/products/filtres-p3.jpg"],
    inStock: true,
    stockQuantity: 200,
    specs: [
      { name: "Classe", value: "P3" },
      { name: "Protection", value: "Particules + vapeurs organiques" },
      { name: "Compatibilité", value: "Séries 6000, 7000, FF-400" },
      { name: "Conditionnement", value: "Paire" },
    ],
    relatedProducts: [2],
  },
  {
    id: 4,
    sku: "EPI-GANT-001",
    slug: "gants-nitrile-bleu-usage-unique",
    name: "Gants nitrile bleu usage unique",
    shortDescription: "Gants nitrile non poudrés, boîte de 100",
    description: "Gants en nitrile bleu non poudrés. Excellente résistance aux produits chimiques et aux perforations. Texture micro-rugueuse pour une meilleure préhension.",
    price: 12.90,
    categorySlug: "epi",
    categoryName: "Equipements de protection individuelle",
    subcategorySlug: "gants-protection",
    brand: "Ansell",
    image: "/images/products/gants-nitrile.jpg",
    images: ["/images/products/gants-nitrile.jpg"],
    inStock: true,
    stockQuantity: 150,
    specs: [
      { name: "Matière", value: "Nitrile" },
      { name: "Tailles", value: "S à XL" },
      { name: "Épaisseur", value: "0.12mm" },
      { name: "Longueur", value: "240mm" },
      { name: "Conditionnement", value: "100 gants/boîte" },
    ],
  },
  {
    id: 5,
    sku: "EPI-SURB-001",
    slug: "surbottes-jetables-antiderapantes",
    name: "Surbottes jetables antidérapantes",
    shortDescription: "Surbottes CPE avec semelle antidérapante, lot de 50 paires",
    description: "Surbottes jetables en CPE avec semelle antidérapante. Protection contre les projections et les poussières. Élastique à la cheville pour un maintien optimal.",
    price: 24.90,
    categorySlug: "epi",
    categoryName: "Equipements de protection individuelle",
    subcategorySlug: "chaussures-surbottes",
    brand: "Epicap",
    image: "/images/products/surbottes.jpg",
    images: ["/images/products/surbottes.jpg"],
    inStock: true,
    stockQuantity: 80,
    specs: [
      { name: "Matière", value: "CPE" },
      { name: "Hauteur", value: "40cm" },
      { name: "Semelle", value: "Antidérapante" },
      { name: "Conditionnement", value: "50 paires/carton" },
    ],
  },

  // Aspirateurs
  {
    id: 6,
    sku: "ASP-THE-001",
    slug: "aspirateur-the-nilfisk-attix-761-2m-xc",
    name: "Aspirateur THE Nilfisk Attix 761-2M XC",
    shortDescription: "Aspirateur industriel THE certifié amiante classe M",
    description: "Aspirateur industriel Nilfisk Attix 761-2M XC certifié THE (Très Haute Efficacité) pour l'aspiration de poussières dangereuses dont l'amiante. Système de décolmatage automatique XC. Cuve inox 30L.",
    price: 2890,
    compareAtPrice: 3200,
    categorySlug: "aspirateurs",
    categoryName: "Aspirateurs",
    subcategorySlug: "aspirateurs-the",
    brand: "Nilfisk",
    image: "/images/products/aspirateur-the.jpg",
    images: ["/images/products/aspirateur-the.jpg"],
    inStock: true,
    stockQuantity: 12,
    isNew: true,
    isFeatured: true,
    isRentable: true,
    rentalPriceDaily: 85,
    specs: [
      { name: "Classe", value: "M (THE)" },
      { name: "Puissance", value: "1400W" },
      { name: "Dépression", value: "254 mbar" },
      { name: "Débit d'air", value: "302 m³/h" },
      { name: "Capacité cuve", value: "30L" },
      { name: "Poids", value: "18kg" },
    ],
    relatedProducts: [7, 8],
  },
  {
    id: 7,
    sku: "ASP-THE-002",
    slug: "aspirateur-the-ruwac-ds-1220-m",
    name: "Aspirateur THE Ruwac DS 1220 M",
    shortDescription: "Aspirateur THE industriel compact et puissant",
    description: "Aspirateur THE Ruwac DS 1220 M certifié pour l'amiante. Conception robuste et compacte. Système de filtration haute performance. Idéal pour les chantiers de désamiantage.",
    price: 2450,
    categorySlug: "aspirateurs",
    categoryName: "Aspirateurs",
    subcategorySlug: "aspirateurs-the",
    brand: "Ruwac",
    image: "/images/products/aspirateur-ruwac.jpg",
    images: ["/images/products/aspirateur-ruwac.jpg"],
    inStock: true,
    stockQuantity: 8,
    isRentable: true,
    rentalPriceDaily: 75,
    specs: [
      { name: "Classe", value: "M (THE)" },
      { name: "Puissance", value: "1200W" },
      { name: "Dépression", value: "230 mbar" },
      { name: "Débit d'air", value: "280 m³/h" },
      { name: "Capacité cuve", value: "25L" },
    ],
    relatedProducts: [6, 8],
  },
  {
    id: 8,
    sku: "ASP-ACC-001",
    slug: "sac-filtre-the-nilfisk-attix",
    name: "Sacs filtres THE pour Nilfisk Attix (x5)",
    shortDescription: "Sacs filtres THE compatibles Attix 761/961",
    description: "Lot de 5 sacs filtres THE pour aspirateurs Nilfisk Attix 761 et 961. Filtration très haute efficacité certifiée. Fermeture hermétique pour évacuation sécurisée.",
    price: 89,
    categorySlug: "aspirateurs",
    categoryName: "Aspirateurs",
    subcategorySlug: "filtres-sacs",
    brand: "Nilfisk",
    image: "/images/products/sacs-the.jpg",
    images: ["/images/products/sacs-the.jpg"],
    inStock: true,
    stockQuantity: 50,
    specs: [
      { name: "Compatibilité", value: "Attix 761, 961" },
      { name: "Classe filtration", value: "THE" },
      { name: "Conditionnement", value: "5 sacs" },
    ],
    relatedProducts: [6],
  },

  // Extracteurs d'air
  {
    id: 9,
    sku: "EXT-THE-001",
    slug: "extracteur-air-the-3000-m3h",
    name: "Extracteur d'air THE 3000 m³/h",
    shortDescription: "Extracteur THE haute performance pour zones confinées",
    description: "Extracteur d'air THE (Très Haute Efficacité) avec débit de 3000 m³/h. Idéal pour la mise en dépression des zones de travail amiante. Filtration HEPA H14. Variateur de vitesse intégré.",
    price: 1850,
    categorySlug: "extracteurs-air",
    categoryName: "Extracteurs d'air",
    subcategorySlug: "extracteurs-the",
    brand: "Heylo",
    image: "/images/products/extracteur-the.jpg",
    images: ["/images/products/extracteur-the.jpg"],
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
    isRentable: true,
    rentalPriceDaily: 55,
    specs: [
      { name: "Débit max", value: "3000 m³/h" },
      { name: "Filtration", value: "HEPA H14" },
      { name: "Puissance", value: "750W" },
      { name: "Niveau sonore", value: "62 dB(A)" },
      { name: "Dimensions", value: "60x60x90cm" },
    ],
    relatedProducts: [10, 11],
  },
  {
    id: 10,
    sku: "EXT-THE-002",
    slug: "deprimogene-5000-m3h",
    name: "Déprimogène THE 5000 m³/h",
    shortDescription: "Déprimogène grande capacité pour chantiers importants",
    description: "Déprimogène THE grande capacité 5000 m³/h. Conçu pour les chantiers de désamiantage de grande envergure. Double filtration HEPA. Châssis renforcé sur roulettes.",
    price: 3200,
    categorySlug: "extracteurs-air",
    categoryName: "Extracteurs d'air",
    subcategorySlug: "deprimogenes",
    brand: "Heylo",
    image: "/images/products/deprimogene.jpg",
    images: ["/images/products/deprimogene.jpg"],
    inStock: true,
    stockQuantity: 6,
    isRentable: true,
    rentalPriceDaily: 95,
    specs: [
      { name: "Débit max", value: "5000 m³/h" },
      { name: "Filtration", value: "Double HEPA H14" },
      { name: "Puissance", value: "1500W" },
      { name: "Niveau sonore", value: "68 dB(A)" },
    ],
    relatedProducts: [9, 11],
  },
  {
    id: 11,
    sku: "EXT-GAI-001",
    slug: "gaine-souple-pvc-diametre-300",
    name: "Gaine souple PVC Ø300mm (10m)",
    shortDescription: "Gaine de ventilation flexible pour extracteurs",
    description: "Gaine souple en PVC armé diamètre 300mm. Longueur 10m. Compatible avec tous les extracteurs et déprimogènes standards. Résistante et flexible.",
    price: 125,
    categorySlug: "extracteurs-air",
    categoryName: "Extracteurs d'air",
    subcategorySlug: "gaines-raccords",
    brand: "Epicap",
    image: "/images/products/gaine-pvc.jpg",
    images: ["/images/products/gaine-pvc.jpg"],
    inStock: true,
    stockQuantity: 30,
    specs: [
      { name: "Diamètre", value: "300mm" },
      { name: "Longueur", value: "10m" },
      { name: "Matière", value: "PVC armé" },
      { name: "Température max", value: "+60°C" },
    ],
    relatedProducts: [9, 10],
  },

  // Unités de décontamination
  {
    id: 12,
    sku: "DEC-U3C-001",
    slug: "unite-decontamination-3-compartiments",
    name: "Unité de décontamination 3 compartiments",
    shortDescription: "Unité mobile de décontamination conforme SS3/SS4",
    description: "Unité de décontamination mobile 3 compartiments conforme aux normes SS3 et SS4. Comprend : sas d'entrée, douche, sas de sortie. Eau chaude intégrée. Sur châssis remorquable.",
    price: 18500,
    categorySlug: "unites-decontamination",
    categoryName: "Unités de décontamination",
    subcategorySlug: "unites-3-compartiments",
    brand: "Epicap",
    image: "/images/products/unite-3c.jpg",
    images: ["/images/products/unite-3c.jpg"],
    inStock: true,
    stockQuantity: 3,
    isRentable: true,
    rentalPriceDaily: 250,
    specs: [
      { name: "Compartiments", value: "3" },
      { name: "Conformité", value: "SS3/SS4" },
      { name: "Eau chaude", value: "Oui (300L)" },
      { name: "Dimensions", value: "6x2.5x2.5m" },
    ],
    relatedProducts: [13],
  },
  {
    id: 13,
    sku: "DEC-U5C-001",
    slug: "unite-decontamination-5-compartiments",
    name: "Unité de décontamination 5 compartiments",
    shortDescription: "Unité de décontamination haut de gamme",
    description: "Unité de décontamination 5 compartiments pour chantiers exigeants. Vestiaires séparés, double douche, système de traitement d'eau. Conforme réglementation amiante.",
    price: 32000,
    categorySlug: "unites-decontamination",
    categoryName: "Unités de décontamination",
    subcategorySlug: "unites-5-compartiments",
    brand: "Epicap",
    image: "/images/products/unite-5c.jpg",
    images: ["/images/products/unite-5c.jpg"],
    inStock: true,
    stockQuantity: 2,
    isRentable: true,
    rentalPriceDaily: 400,
    specs: [
      { name: "Compartiments", value: "5" },
      { name: "Douches", value: "2" },
      { name: "Traitement eau", value: "Intégré" },
      { name: "Dimensions", value: "9x2.5x2.5m" },
    ],
    relatedProducts: [12],
  },

  // Confinement
  {
    id: 14,
    sku: "CON-FIL-001",
    slug: "film-polyethylene-200-microns",
    name: "Film polyéthylène 200µ (4x25m)",
    shortDescription: "Film PE épais pour confinement zones amiante",
    description: "Film polyéthylène 200 microns pour confinement des zones de travail amiante. Dimensions 4x25m. Haute résistance à la déchirure. Qualité professionnelle.",
    price: 85,
    categorySlug: "confinement",
    categoryName: "Confinement",
    subcategorySlug: "films-baches",
    brand: "Epicap",
    image: "/images/products/film-pe.jpg",
    images: ["/images/products/film-pe.jpg"],
    inStock: true,
    stockQuantity: 100,
    specs: [
      { name: "Épaisseur", value: "200µ" },
      { name: "Dimensions", value: "4x25m" },
      { name: "Surface", value: "100m²" },
      { name: "Couleur", value: "Translucide" },
    ],
    relatedProducts: [15],
  },
  {
    id: 15,
    sku: "CON-ADH-001",
    slug: "ruban-adhesif-polyethylene-75mm",
    name: "Ruban adhésif polyéthylène 75mm (33m)",
    shortDescription: "Ruban adhésif haute performance pour confinement",
    description: "Ruban adhésif polyéthylène largeur 75mm, longueur 33m. Adhésion forte sur films PE. Déchirable à la main. Idéal pour étanchéifier les jonctions de confinement.",
    price: 8.90,
    categorySlug: "confinement",
    categoryName: "Confinement",
    subcategorySlug: "rubans-adhesifs",
    brand: "Tesa",
    image: "/images/products/ruban-pe.jpg",
    images: ["/images/products/ruban-pe.jpg"],
    inStock: true,
    stockQuantity: 200,
    specs: [
      { name: "Largeur", value: "75mm" },
      { name: "Longueur", value: "33m" },
      { name: "Support", value: "PE" },
      { name: "Couleur", value: "Transparent" },
    ],
    relatedProducts: [14],
  },

  // Conditionnement déchets
  {
    id: 16,
    sku: "DEC-BIG-001",
    slug: "big-bag-amiante-1m3",
    name: "Big Bag amiante 1m³",
    shortDescription: "Big bag homologué pour déchets amiante",
    description: "Big bag homologué pour le conditionnement des déchets amiantés. Capacité 1m³. Double enveloppe avec doublure interne PE. Sangles de levage renforcées.",
    price: 35,
    categorySlug: "conditionnement-dechets",
    categoryName: "Conditionnement déchets",
    subcategorySlug: "big-bags-amiante",
    brand: "Epicap",
    image: "/images/products/big-bag.jpg",
    images: ["/images/products/big-bag.jpg"],
    inStock: true,
    stockQuantity: 150,
    specs: [
      { name: "Capacité", value: "1m³" },
      { name: "Charge max", value: "1000kg" },
      { name: "Doublure", value: "PE intégrée" },
      { name: "Homologation", value: "ADR" },
    ],
    relatedProducts: [17],
  },
  {
    id: 17,
    sku: "DEC-SAC-001",
    slug: "sacs-dechets-amiante-70l",
    name: "Sacs déchets amiante 70L (x100)",
    shortDescription: "Sacs PE rouge imprimés \"Amiante\"",
    description: "Sacs polyéthylène rouge 70L pour déchets amiantés. Impression réglementaire \"AMIANTE - DANGER\". Épaisseur 100µ. Lot de 100 sacs.",
    price: 95,
    categorySlug: "conditionnement-dechets",
    categoryName: "Conditionnement déchets",
    subcategorySlug: "sacs-dechets",
    brand: "Epicap",
    image: "/images/products/sacs-amiante.jpg",
    images: ["/images/products/sacs-amiante.jpg"],
    inStock: true,
    stockQuantity: 80,
    specs: [
      { name: "Capacité", value: "70L" },
      { name: "Épaisseur", value: "100µ" },
      { name: "Couleur", value: "Rouge" },
      { name: "Conditionnement", value: "100 sacs" },
    ],
    relatedProducts: [16],
  },

  // Hygiène & Sécurité
  {
    id: 18,
    sku: "HYG-DOU-001",
    slug: "douche-portative-autonome",
    name: "Douche portative autonome",
    shortDescription: "Douche d'urgence autonome 15L",
    description: "Douche portative autonome pour rinçage d'urgence. Réservoir 15L avec pommeau réglable. Idéale pour les chantiers sans point d'eau. Sac de transport inclus.",
    price: 145,
    categorySlug: "hygiene-securite",
    categoryName: "Hygiène & Sécurité",
    subcategorySlug: "douches-lavage",
    brand: "Plum",
    image: "/images/products/douche-portable.jpg",
    images: ["/images/products/douche-portable.jpg"],
    inStock: true,
    stockQuantity: 25,
    specs: [
      { name: "Capacité", value: "15L" },
      { name: "Autonomie", value: "≈5 min" },
      { name: "Poids à vide", value: "2kg" },
      { name: "Accessoires", value: "Sac de transport" },
    ],
  },
  {
    id: 19,
    sku: "HYG-SIG-001",
    slug: "panneau-danger-amiante",
    name: "Panneau \"Danger Amiante\" (x5)",
    shortDescription: "Panneaux signalétiques réglementaires",
    description: "Lot de 5 panneaux de signalisation \"Danger - Amiante\". Format A4. PVC rigide 2mm. Impression conforme à la réglementation. Perforations pour fixation.",
    price: 29.90,
    categorySlug: "hygiene-securite",
    categoryName: "Hygiène & Sécurité",
    subcategorySlug: "signalisation",
    brand: "Epicap",
    image: "/images/products/panneau-amiante.jpg",
    images: ["/images/products/panneau-amiante.jpg"],
    inStock: true,
    stockQuantity: 60,
    specs: [
      { name: "Format", value: "A4 (210x297mm)" },
      { name: "Matière", value: "PVC 2mm" },
      { name: "Conditionnement", value: "5 panneaux" },
      { name: "Conformité", value: "Réglementation française" },
    ],
  },
  {
    id: 20,
    sku: "HYG-SEC-001",
    slug: "trousse-secours-chantier",
    name: "Trousse de secours chantier BTP",
    shortDescription: "Trousse premiers secours complète 10-20 personnes",
    description: "Trousse de premiers secours complète pour chantiers BTP. Conforme au Code du travail. Contenu pour 10 à 20 personnes. Mallette rigide avec poignée.",
    price: 75,
    categorySlug: "hygiene-securite",
    categoryName: "Hygiène & Sécurité",
    subcategorySlug: "premiers-secours",
    brand: "Holthaus",
    image: "/images/products/trousse-secours.jpg",
    images: ["/images/products/trousse-secours.jpg"],
    inStock: true,
    stockQuantity: 20,
    specs: [
      { name: "Capacité", value: "10-20 personnes" },
      { name: "Conformité", value: "Code du travail" },
      { name: "Dimensions", value: "35x25x12cm" },
      { name: "Contenu", value: "62 éléments" },
    ],
  },
]

// Get all unique brands
export const brands = [...new Set(products.map(p => p.brand))].sort()

// Helper functions
export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug)
}

export function getProductsBySubcategory(categorySlug: string, subcategorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug && p.subcategorySlug === subcategorySlug)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.isFeatured)
}

export function getRelatedProducts(productId: number): Product[] {
  const product = products.find(p => p.id === productId)
  if (!product?.relatedProducts) return []
  return products.filter(p => product.relatedProducts?.includes(p.id))
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.shortDescription.toLowerCase().includes(lowerQuery) ||
    p.sku.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery)
  )
}
