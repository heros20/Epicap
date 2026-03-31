import { Metadata } from "next"

import { LegalDocument } from "@/components/legal/legal-document"
import { legalNoticeIntro, legalNoticeSections } from "@/lib/data/legal"

export const metadata: Metadata = {
  title: "Mentions légales & Politique de confidentialité",
  description:
    "Mentions légales, protection des données personnelles, cookies et informations de contact d'EPICAP SAS.",
}

export default function LegalNoticePage() {
  return (
    <LegalDocument
      eyebrow="Informations légales"
      title="Mentions légales & Politique de confidentialité"
      description="Cette page regroupe les informations éditeur, les conditions d'utilisation du site, la collecte des données personnelles, les cookies et les moyens d'exercer vos droits."
      intro={legalNoticeIntro}
      sections={legalNoticeSections}
    />
  )
}
