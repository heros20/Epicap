export function normalizeSearchText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
}

export function matchesSearchText(
  query: string,
  ...candidates: Array<string | null | undefined>
) {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) {
    return false
  }

  return candidates.some((candidate) => normalizeSearchText(candidate).includes(normalizedQuery))
}
