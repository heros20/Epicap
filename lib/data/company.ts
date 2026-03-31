import { agencies } from "@/lib/data/navigation"

const headOffice = agencies.find((agency) => agency.isHeadOffice) ?? agencies[0]

export const companyInfo = {
  legalName: "EPICAP SAS",
  brandName: "Epicap",
  tagline: "Matériel de désamiantage, vente, maintenance et location",
  heroTitle:
    "Équipements de protection individuelle et collective contre l'amiante et les autres polluants",
  summary:
    "Epicap SAS est le spécialiste de la fourniture, de la location et de la maintenance de matériel et d'équipements de protection contre l'amiante et les autres polluants.",
  experience: "Plus de 15 ans d'expérience terrain",
  catalogs: "Catalogue vente et catalogue location",
  phone: headOffice.phone,
  email: headOffice.email,
  address: `${headOffice.address}, ${headOffice.postalCode} ${headOffice.city}`,
  headOffice,
} as const

export const companyOfferings = [
  "Équipements de protection individuelle",
  "Équipements de protection collective",
  "Consommables et matériels pour le confinement et le traitement de l'amiante en place",
  "Location d'unités de décontamination mobiles",
  "Location d'unités de production d'air respirable",
  "Location de sas de décontamination démontables",
  "Location d'unités de production et de filtration d'eau",
] as const

export const companyStats = [
  { value: "15+", label: "ans d'expérience terrain" },
  { value: String(agencies.length), label: "implantations en France" },
  { value: "2", label: "catalogues Epicap" },
  { value: "3", label: "services terrain clés" },
] as const

export const manufacturerHighlights = [
  "3M",
  "BLS",
  "BULKAIR",
  "CUBAIR",
  "HONEYWELL",
  "HUSQVARNA",
  "KASCO",
  "NUMATIC",
  "RAPID",
  "RSG Safety",
] as const

export const serviceDetails = {
  location: {
    title: "Location de matériel de protection collective",
    eyebrow: "Catalogue location",
    description:
      "Epicap propose une offre de location dédiée aux chantiers de désamiantage avec des matériels prêts à être déployés sur site.",
    intro:
      "Le catalogue location officiel couvre notamment les unités mobiles EPIROLL, les sas EPICAB, les extracteurs EPIAIR, les contrôleurs de dépression BULKAIR et les unités AQUARIUS.",
    points: [
      "Location d'EPIROLL 5C gaz avec réserve d'eau, EPIROLL 750 3 compartiments et unités mobiles de décontamination.",
      "Location de sas personnel 5 compartiments conformes ED6307 et de sas matériel 3 compartiments.",
      "Location d'unités de chauffage et filtration AQUARIUS, d'unités de filtration et d'extracteurs 650 m3/h.",
      "Location de contrôleurs de dépression pour le suivi des chantiers en jour calendaire.",
    ],
    highlights: ["EPIROLL", "EPICAB", "EPIAIR", "AQUARIUS", "BULKAIR"],
  },
  maintenance: {
    title: "Maintenance des systèmes respiratoires 3M, SCOTT et KASCO",
    eyebrow: "Respiratoire",
    description:
      "Epicap assure la maintenance des systèmes respiratoires utilisés sur les chantiers amiante avec un maillage d'agences et une documentation dédiée.",
    intro:
      "Le site officiel met en avant la maintenance des systèmes respiratoires 3M, SCOTT et KASCO pour les zones Nord, Normandie, Île-de-France, Est, Sud-Est, Bretagne et Rhône-Alpes.",
    points: [
      "Prise en charge des appareils de ventilation assistée et des systèmes à adduction d'air.",
      "Attestation 3M / SCOTT et agrément KASCO disponibles avec le tarif de maintenance.",
      "Couverture nationale via le réseau d'implantations Epicap.",
      "Service utile pour maintenir la conformité et la disponibilité des APR sur chantier.",
    ],
    priceFrom: "à partir de 85,00 € HT",
    highlights: ["3M", "SCOTT", "KASCO", "Phantom Vision", "CUBAIR"],
  },
  "fit-test": {
    title: "Test d'ajustement FIT TEST",
    eyebrow: "Test quantitatif",
    description:
      "Epicap propose un test d'ajustement quantitatif pour vérifier l'étanchéité des masques avant mise en service sur chantier.",
    intro:
      "Le service FIT TEST mis en avant sur epicap.com s'appuie sur une technologie à pression négative contrôlée OHD Quantifit.",
    points: [
      "Simulation d'un taux de respiration supérieur à 90 litres d'air par minute.",
      "Mesure d'une éventuelle fuite en 8 secondes.",
      "Méthode plus pratique que d'autres appareils de test quantitatif selon la présentation Epicap.",
      "Personnel rasé obligatoire pour réaliser le test d'ajustement.",
    ],
    priceFrom: "à partir de 70,00 € HT",
    highlights: ["OHD Quantifit", "Étanchéité", "Conformité chantier", "Masques complets"],
  },
} as const
