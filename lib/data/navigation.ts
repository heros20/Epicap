// Navigation data for Epicap e-commerce
// Based on actual epicap.com categories

export const categories = [
  {
    name: "Equipements de protection individuelle",
    slug: "epi",
    description: "Masques, combinaisons, gants et équipements de protection contre l'amiante",
    subcategories: [
      { name: "Masques et filtres", slug: "masques-filtres" },
      { name: "Combinaisons jetables", slug: "combinaisons-jetables" },
      { name: "Combinaisons ventilées", slug: "combinaisons-ventilees" },
      { name: "Gants de protection", slug: "gants-protection" },
      { name: "Chaussures et surbottes", slug: "chaussures-surbottes" },
    ],
  },
  {
    name: "Aspirateurs",
    slug: "aspirateurs",
    description: "Aspirateurs industriels THE certifiés pour l'amiante",
    subcategories: [
      { name: "Aspirateurs THE", slug: "aspirateurs-the" },
      { name: "Aspirateurs eau et poussière", slug: "aspirateurs-eau-poussiere" },
      { name: "Accessoires aspirateurs", slug: "accessoires-aspirateurs" },
      { name: "Filtres et sacs", slug: "filtres-sacs" },
    ],
  },
  {
    name: "Extracteurs d'air",
    slug: "extracteurs-air",
    description: "Extracteurs et déprimogènes pour zones confinées",
    subcategories: [
      { name: "Extracteurs THE", slug: "extracteurs-the" },
      { name: "Déprimogènes", slug: "deprimogenes" },
      { name: "Gaines et raccords", slug: "gaines-raccords" },
    ],
  },
  {
    name: "Unités de décontamination",
    slug: "unites-decontamination",
    description: "Unités mobiles de décontamination pour chantiers amiante",
    subcategories: [
      { name: "Unités 3 compartiments", slug: "unites-3-compartiments" },
      { name: "Unités 5 compartiments", slug: "unites-5-compartiments" },
      { name: "Accessoires décontamination", slug: "accessoires-decontamination" },
    ],
  },
  {
    name: "Confinement",
    slug: "confinement",
    description: "Matériel de confinement et protection des zones de travail",
    subcategories: [
      { name: "Films et bâches", slug: "films-baches" },
      { name: "Rubans et adhésifs", slug: "rubans-adhesifs" },
      { name: "Sas et tunnels", slug: "sas-tunnels" },
    ],
  },
  {
    name: "Outillage",
    slug: "outillage",
    description: "Outillage professionnel pour le désamiantage",
    subcategories: [
      { name: "Outillage électroportatif", slug: "outillage-electroportatif" },
      { name: "Outillage manuel", slug: "outillage-manuel" },
      { name: "Échelles et échafaudages", slug: "echelles-echafaudages" },
    ],
  },
  {
    name: "Conditionnement déchets",
    slug: "conditionnement-dechets",
    description: "Big bags, sacs et containers pour déchets amiante",
    subcategories: [
      { name: "Big bags amiante", slug: "big-bags-amiante" },
      { name: "Sacs déchets", slug: "sacs-dechets" },
      { name: "Étiquetage", slug: "etiquetage" },
    ],
  },
  {
    name: "Hygiène & Sécurité",
    slug: "hygiene-securite",
    description: "Produits d'hygiène et équipements de sécurité",
    subcategories: [
      { name: "Douches et lavage", slug: "douches-lavage" },
      { name: "Signalisation", slug: "signalisation" },
      { name: "Premiers secours", slug: "premiers-secours" },
    ],
  },
] as const

export const services = [
  {
    name: "Location de matériel",
    slug: "location",
    description: "Location courte et longue durée de matériel professionnel",
  },
  {
    name: "Maintenance & SAV",
    slug: "maintenance",
    description: "Service après-vente et maintenance de vos équipements",
  },
  {
    name: "Formation",
    slug: "formation",
    description: "Formations à l'utilisation du matériel de désamiantage",
  },
] as const

export const agencies = [
  {
    name: "Paris / Île-de-France",
    slug: "paris",
    city: "Bonneuil-sur-Marne",
    phone: "01 45 13 72 00",
  },
  {
    name: "Lyon / Rhône-Alpes",
    slug: "lyon",
    city: "Vénissieux",
    phone: "04 78 70 51 00",
  },
  {
    name: "Marseille / PACA",
    slug: "marseille",
    city: "Vitrolles",
    phone: "04 42 89 42 00",
  },
  {
    name: "Nantes / Grand Ouest",
    slug: "nantes",
    city: "Saint-Herblain",
    phone: "02 40 92 42 00",
  },
  {
    name: "Lille / Nord",
    slug: "lille",
    city: "Lesquin",
    phone: "03 20 62 92 00",
  },
  {
    name: "Bordeaux / Sud-Ouest",
    slug: "bordeaux",
    city: "Mérignac",
    phone: "05 56 34 92 00",
  },
  {
    name: "Strasbourg / Est",
    slug: "strasbourg",
    city: "Entzheim",
    phone: "03 88 64 92 00",
  },
] as const

export type Category = typeof categories[number]
export type Service = typeof services[number]
export type Agency = typeof agencies[number]
