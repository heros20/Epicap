import { Package, Truck } from "lucide-react"

export const catalogues = [
  {
    id: "produits",
    title: "Catalogue produits",
    eyebrow: "Vente",
    description:
      "Toutes les gammes Epicap pour les equipements de protection, le confinement, la decontamination et les consommables chantier.",
    href: "/catalogues?catalogue=produits",
    pdfUrl: "/catalogues/catalogue-produits-epicap.pdf",
    pageBaseUrl: "/catalogues/pages/produits/page-",
    coverImage: "/catalogues/pages/produits/page-001.jpg",
    pageCount: 68,
    icon: Package,
  },
  {
    id: "location",
    title: "Catalogue location",
    eyebrow: "Location",
    description:
      "Les materiels disponibles en location pour preparer un besoin temporaire, une intervention ou un chantier specifique.",
    href: "/catalogues?catalogue=location",
    pdfUrl: "/catalogues/catalogue-location-epicap.pdf",
    pageBaseUrl: "/catalogues/pages/location/page-",
    coverImage: "/catalogues/pages/location/page-001.jpg",
    pageCount: 12,
    icon: Truck,
  },
] as const

export type CatalogueId = (typeof catalogues)[number]["id"]
