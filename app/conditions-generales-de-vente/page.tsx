import { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { cgvIntro, cgvSections } from "@/lib/data/legal"

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente applicables aux commandes, prix, livraisons, paiements, garanties et réserves de propriété d'EPICAP SAS.",
}

export default function ConditionsGeneralesDeVentePage() {
  return (
    <LegalDocument
      eyebrow="Vente"
      title="Conditions générales de vente"
      description="Les présentes conditions générales de vente détaillent les règles applicables aux commandes, aux transports, aux paiements, aux garanties et au règlement des litiges."
      intro={cgvIntro}
      sections={cgvSections}
    />
  )
}
