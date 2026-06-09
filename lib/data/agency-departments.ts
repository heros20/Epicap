import { formatAgencyOptionValue } from "@/lib/data/agencies"
import { agencies } from "@/lib/data/navigation"

export interface DepartmentOption {
  code: string
  name: string
  agencySlug: string
}

const departmentNames: Record<string, string> = {
  "01": "Ain",
  "02": "Aisne",
  "03": "Allier",
  "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes",
  "07": "Ardèche",
  "08": "Ardennes",
  "09": "Ariège",
  "10": "Aube",
  "11": "Aude",
  "12": "Aveyron",
  "13": "Bouches-du-Rhône",
  "14": "Calvados",
  "15": "Cantal",
  "16": "Charente",
  "17": "Charente-Maritime",
  "18": "Cher",
  "19": "Corrèze",
  "21": "Côte-d'Or",
  "22": "Côtes-d'Armor",
  "23": "Creuse",
  "24": "Dordogne",
  "25": "Doubs",
  "26": "Drôme",
  "27": "Eure",
  "28": "Eure-et-Loir",
  "29": "Finistère",
  "30": "Gard",
  "31": "Haute-Garonne",
  "32": "Gers",
  "33": "Gironde",
  "34": "Hérault",
  "35": "Ille-et-Vilaine",
  "36": "Indre",
  "37": "Indre-et-Loire",
  "38": "Isère",
  "39": "Jura",
  "40": "Landes",
  "41": "Loir-et-Cher",
  "42": "Loire",
  "43": "Haute-Loire",
  "44": "Loire-Atlantique",
  "45": "Loiret",
  "46": "Lot",
  "47": "Lot-et-Garonne",
  "48": "Lozère",
  "49": "Maine-et-Loire",
  "50": "Manche",
  "51": "Marne",
  "52": "Haute-Marne",
  "53": "Mayenne",
  "54": "Meurthe-et-Moselle",
  "55": "Meuse",
  "56": "Morbihan",
  "57": "Moselle",
  "58": "Nièvre",
  "59": "Nord",
  "60": "Oise",
  "61": "Orne",
  "62": "Pas-de-Calais",
  "63": "Puy-de-Dôme",
  "64": "Pyrénées-Atlantiques",
  "65": "Hautes-Pyrénées",
  "66": "Pyrénées-Orientales",
  "67": "Bas-Rhin",
  "68": "Haut-Rhin",
  "69": "Rhône",
  "70": "Haute-Saône",
  "71": "Saône-et-Loire",
  "72": "Sarthe",
  "73": "Savoie",
  "74": "Haute-Savoie",
  "75": "Paris",
  "76": "Seine-Maritime",
  "77": "Seine-et-Marne",
  "78": "Yvelines",
  "79": "Deux-Sèvres",
  "80": "Somme",
  "81": "Tarn",
  "82": "Tarn-et-Garonne",
  "83": "Var",
  "84": "Vaucluse",
  "85": "Vendée",
  "86": "Vienne",
  "87": "Haute-Vienne",
  "88": "Vosges",
  "89": "Yonne",
  "90": "Territoire de Belfort",
  "91": "Essonne",
  "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis",
  "94": "Val-de-Marne",
  "95": "Val-d'Oise",
  "2A": "Corse-du-Sud",
  "2B": "Haute-Corse",
}

const assignments: Record<string, string[]> = {
  escaudain: ["02", "08", "51", "59", "60", "62", "80"],
  "ile-de-france": ["75", "77", "78", "91", "92", "93", "94", "95"],
  est: ["10", "21", "25", "39", "52", "54", "55", "57", "67", "68", "70", "88", "89", "90"],
  normandie: ["14", "18", "27", "28", "36", "37", "41", "45", "50", "53", "61", "72", "76"],
  "grand-ouest": ["16", "17", "22", "29", "35", "44", "49", "56", "79", "85", "86"],
  "rhone-alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "58", "63", "69", "71", "73", "74"],
  "sud-est": ["04", "05", "06", "11", "13", "30", "34", "48", "66", "83", "84", "2A", "2B"],
  "sud-ouest": ["09", "12", "19", "23", "24", "31", "32", "33", "40", "46", "47", "64", "65", "81", "82", "87"],
}

export const departmentOptions: DepartmentOption[] = Object.entries(assignments)
  .flatMap(([agencySlug, codes]) =>
    codes.map((code) => ({
      code,
      name: departmentNames[code],
      agencySlug,
    })),
  )
  .sort((left, right) => left.code.localeCompare(right.code, "fr", { numeric: true }))

export function formatDepartmentOptionLabel(department: Pick<DepartmentOption, "code" | "name">) {
  return `${department.code} - ${department.name}`
}

export function getDepartmentByCode(code: string) {
  return departmentOptions.find((department) => department.code === code)
}

export function getAgencyForDepartmentCode(code: string) {
  const department = getDepartmentByCode(code)
  return department ? agencies.find((agency) => agency.slug === department.agencySlug) : undefined
}

export function getAgencyLabelForDepartmentCode(code: string) {
  const agency = getAgencyForDepartmentCode(code)
  return agency ? formatAgencyOptionValue(agency) : ""
}
