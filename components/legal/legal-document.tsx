import Link from "next/link"
import { Fragment } from "react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import type { LegalDocumentSection } from "@/lib/data/legal"

interface LegalDocumentProps {
  eyebrow: string
  title: string
  description: string
  intro?: string[]
  sections: LegalDocumentSection[]
}

const urlPattern = /(https?:\/\/[^\s]+)/g

function renderLinkedText(text: string) {
  return text.split(urlPattern).map((part, index) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {part}
        </a>
      )
    }

    return <Fragment key={`${part}-${index}`}>{part}</Fragment>
  })
}

function TextBlock({ text }: { text: string }) {
  return <p className="text-sm leading-7 text-muted-foreground">{renderLinkedText(text)}</p>
}

export function LegalDocument({
  eyebrow,
  title,
  description,
  intro = [],
  sections,
}: LegalDocumentProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(255,133,28,0.12),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-10 lg:py-14">
            <Badge className="mb-4 border border-primary/20 bg-primary/8 text-primary">
              {eyebrow}
            </Badge>
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
            {intro.length > 0 && (
              <div className="mt-6 max-w-4xl space-y-3 rounded-[1.5rem] border border-border/70 bg-card/80 p-6 shadow-[0_18px_48px_-36px_rgba(15,16,18,0.16)] backdrop-blur-sm">
                {intro.map((paragraph) => (
                  <TextBlock key={paragraph} text={paragraph} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="space-y-5">
              {sections.map((section) => (
                <article
                  key={section.title}
                  className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-[0_18px_48px_-38px_rgba(15,16,18,0.14)] lg:p-8"
                >
                  <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
                  {section.paragraphs && section.paragraphs.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <TextBlock key={paragraph} text={paragraph} />
                      ))}
                    </div>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-muted-foreground marker:text-primary">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{renderLinkedText(bullet)}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
                Contacter Epicap
              </Link>
              <Link href="/a-propos" className="underline-offset-4 hover:underline">
                À propos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
