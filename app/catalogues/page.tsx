import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

import { CatalogueBook } from "@/components/catalogues/catalogue-book"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { catalogues, type CatalogueId } from "@/lib/data/catalogues"

export const metadata: Metadata = {
  title: "Catalogues en ligne",
  description:
    "Feuilletez les catalogues Epicap produits et location directement en ligne.",
}

export default async function CataloguesPage({
  searchParams,
}: {
  searchParams: Promise<{ catalogue?: string }>
}) {
  const params = await searchParams
  const requestedCatalogue = params.catalogue
  const initialCatalogueId: CatalogueId = catalogues.some((catalogue) => catalogue.id === requestedCatalogue)
    ? (requestedCatalogue as CatalogueId)
    : "produits"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,#ffffff,#f7f8fa)] py-6 lg:py-8">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.55fr)_minmax(0,1.45fr)] lg:items-center">
              <div>
                <div className="mb-3 flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <BookOpen className="size-6" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Catalogues
                </p>
                <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight tracking-normal lg:text-4xl">
                  Les catalogues Epicap
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground lg:text-base">
                  Choisissez le catalogue produits ou location, puis feuilletez-le directement sur le site.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button asChild className="rounded-md">
                    <Link href="#lecture">
                      Feuilleter maintenant
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-md">
                    <Link href="/boutique">
                      Voir la boutique
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {catalogues.map((catalogue) => {
                  const Icon = catalogue.icon

                  return (
                    <Link
                      key={catalogue.id}
                      href={`${catalogue.href}#lecture`}
                      className="group grid min-h-[260px] overflow-hidden rounded-lg border border-border/70 bg-card transition-colors hover:border-primary/40 sm:grid-cols-[0.72fr_1fr]"
                    >
                      <div className="relative min-h-56 bg-[#d9dde3] p-3">
                        <Image
                          src={catalogue.coverImage}
                          alt={`Couverture ${catalogue.title.toLowerCase()}`}
                          fill
                          sizes="(min-width: 1024px) 220px, (min-width: 640px) 35vw, 100vw"
                          className="object-cover object-top p-3 transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="flex flex-col p-5">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
                            <Icon className="size-5" />
                          </div>
                          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          {catalogue.eyebrow}
                        </p>
                        <h2 className="mt-2 text-xl font-bold">{catalogue.title}</h2>
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                          {catalogue.description}
                        </p>
                        <span className="mt-auto pt-5 text-sm font-semibold text-primary">
                          Ouvrir le catalogue
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <div id="lecture">
          <CatalogueBook initialCatalogueId={initialCatalogueId} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
