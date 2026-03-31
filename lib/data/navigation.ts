import generatedCatalog from "./epicap-catalog.generated.json"

export interface Subcategory {
  name: string
  slug: string
}

export interface Category {
  name: string
  shortName: string
  slug: string
  description: string
  subcategories: Subcategory[]
}

export interface Service {
  name: string
  shortName: string
  slug: string
  description: string
}

export interface AgencyContact {
  name: string
  role: string
  phone?: string
  email?: string
}

export interface Agency {
  name: string
  slug: string
  city: string
  region: string
  address: string
  postalCode: string
  phone: string
  email: string
  hours: string
  contacts: AgencyContact[]
  isHeadOffice?: boolean
}

export const categories = generatedCatalog.categories as Category[]

export const services: Service[] = [
  {
    name: "Location de matériel",
    shortName: "Location",
    slug: "location",
    description:
      "Location de matériels de protection collective pour les chantiers de désamiantage : EPIROLL, EPICAB, EPIAIR, AQUARIUS et contrôleurs.",
  },
  {
    name: "Maintenance des systèmes respiratoires",
    shortName: "Maintenance",
    slug: "maintenance",
    description:
      "Maintenance des systèmes respiratoires 3M, SCOTT et KASCO avec couverture nationale et documentation constructeur.",
  },
  {
    name: "Test d'ajustement FIT TEST",
    shortName: "FIT TEST",
    slug: "fit-test",
    description:
      "Test quantitatif d'ajustement des masques avec technologie à pression négative contrôlée pour valider l'étanchéité avant chantier.",
  },
]

export const agencies: Agency[] = [
  {
    name: "Siège social",
    slug: "escaudain",
    city: "Escaudain",
    region: "Nord",
    address: "ZI des Six Mariannes, rue des Entrepreneurs",
    postalCode: "59124",
    phone: "03 27 48 82 82",
    email: "info@epicap.com",
    hours: "Lun-Jeu 08:00-17:00, Ven 08:00-16:00",
    contacts: [
      { name: "Nicolas Meriau", role: "Commercial" },
      { name: "Julie Banteur", role: "Assistante" },
      { name: "Manon Guelton", role: "Assistante" },
    ],
    isHeadOffice: true,
  },
  {
    name: "Rhône-Alpes",
    slug: "rhone-alpes",
    city: "Chabanière",
    region: "Auvergne-Rhône-Alpes",
    address: "2000 route de Lyon",
    postalCode: "69440",
    phone: "04 72 72 11 11",
    email: "rf@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "François Richez", role: "Responsable d'agence", phone: "06 32 00 77 88" },
      { name: "Florian Seigle", role: "Commercial", phone: "06 58 28 24 20", email: "fs@epicap.com" },
    ],
  },
  {
    name: "Île-de-France",
    slug: "ile-de-france",
    city: "Lieusaint",
    region: "Île-de-France",
    address: "Impasse du Luxembourg",
    postalCode: "77127",
    phone: "01 60 28 22 81",
    email: "agence-idf@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Élodie Vasseur", role: "Responsable d'agence", phone: "06 55 50 99 88" },
      { name: "Robin Pierre", role: "Commercial", phone: "06 65 50 99 88" },
      { name: "Jessica Crepillon", role: "Assistante" },
    ],
  },
  {
    name: "Est",
    slug: "est",
    city: "Lesménils",
    region: "Grand Est",
    address: "Rue des Hauts de Feye",
    postalCode: "54700",
    phone: "03 83 29 45 24",
    email: "agence-est@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Christophe Guillaume", role: "Responsable commercial + agence", phone: "07 62 24 20 15" },
      { name: "Damien Masson", role: "Assistant" },
    ],
  },
  {
    name: "Normandie",
    slug: "normandie",
    city: "Saint-Maclou",
    region: "Normandie",
    address: "700 rue Vannée",
    postalCode: "27210",
    phone: "02 32 20 36 41",
    email: "normandie@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Grégory Ledoux", role: "Responsable commercial + agence", phone: "06 99 57 03 19" },
    ],
  },
  {
    name: "Sud-Est",
    slug: "sud-est",
    city: "Cavaillon",
    region: "Provence-Alpes-Côte d'Azur",
    address: "419 route du Moulin de Losque",
    postalCode: "84300",
    phone: "04 88 60 51 08",
    email: "accueil.sudest@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Valéry Leignel", role: "Responsable commercial + agence", phone: "07 61 36 30 40" },
    ],
  },
  {
    name: "Grand-Ouest",
    slug: "grand-ouest",
    city: "Drefféac",
    region: "Pays de la Loire / Bretagne",
    address: "ZA des Pontereaux, impasse des Genêts",
    postalCode: "44530",
    phone: "02 59 10 19 81",
    email: "bretagne@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Jérôme Bigot", role: "Responsable commercial + agence", phone: "06 59 60 86 15", email: "bj@epicap.com" },
    ],
  },
  {
    name: "Sud-Ouest",
    slug: "sud-ouest",
    city: "Bassens",
    region: "Nouvelle-Aquitaine",
    address: "ZI des Guerlandes, bâtiment 7 B3",
    postalCode: "33530",
    phone: "05 54 07 35 71",
    email: "sudouest@epicap.com",
    hours: "Lun-Jeu 08:00-12:00 / 13:00-17:00, Ven 08:00-12:00 / 13:00-16:00",
    contacts: [
      { name: "Gérald Gras", role: "Responsable d'agence + commercial", phone: "06 58 31 30 12" },
    ],
  },
]
