import { agencies } from "@/lib/data/navigation"

export function getAgencyDepartmentCode(postalCode: string) {
  return postalCode.slice(0, 2)
}

export function formatAgencyOptionValue(agency: (typeof agencies)[number]) {
  return `${agency.name} - ${agency.city} (${agency.region})`
}

export function formatAgencyOptionLabel(agency: (typeof agencies)[number]) {
  return `${agency.name} - ${agency.city} (${getAgencyDepartmentCode(agency.postalCode)})`
}
