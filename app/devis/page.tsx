import Link from "next/link"
import { Metadata } from "next"
import { ArrowRight, FileText, Mail, Phone } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { companyInfo } from "@/lib/data/company"

export const metadata: Metadata = {
  title: "Demande de devis",
  description:
    "Demande de devis Epicap pour vente, location, maintenance respiratoire, FIT TEST et besoins chantier de désamiantage.",
}

export default function QuotePage() {
  const requestItems = [
    "Type de chantier ou environnement concerné",
    "Famille de produit ou service souhaité",
    "Quantité et délai attendus",
    "Besoin en achat, location, maintenance ou FIT TEST",
    "Agence ou zone géographique concernée",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              Demande de devis
            </Badge>
            <h1 className="mb-4 text-3xl font-bold lg:text-5xl">Préparer votre demande</h1>
            <p className="max-w-3xl text-muted-foreground">
              Cette page remplace désormais les liens morts du projet et oriente clairement vers
              les canaux Epicap pour les demandes de vente, location, maintenance respiratoire et
              FIT TEST.
            </p>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <Card className="p-0">
                <CardContent className="p-6 lg:p-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12">
                      <FileText className="size-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Informations utiles</h2>
                      <p className="text-sm text-muted-foreground">
                        Plus le besoin est cadré, plus la réponse Epicap sera rapide.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {requestItems.map((item) => (
                      <div
                        key={item}
                        className="rounded-xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-0">
                <CardContent className="space-y-5 p-6 lg:p-8">
                  <div>
                    <h2 className="text-xl font-semibold">Envoyer votre demande</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Le projet n&apos;intègre pas de formulaire connecté. Les coordonnées officielles
                      Epicap sont désormais accessibles ici.
                    </p>
                  </div>

                  <Button asChild className="w-full">
                    <a href={`mailto:${companyInfo.email}?subject=Demande de devis Epicap`}>
                      <Mail className="mr-2 size-4" />
                      {companyInfo.email}
                    </a>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}>
                      <Phone className="mr-2 size-4" />
                      {companyInfo.phone}
                    </a>
                  </Button>

                  <Button variant="outline" asChild className="w-full">
                    <Link href="/agences">
                      Voir les agences
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
