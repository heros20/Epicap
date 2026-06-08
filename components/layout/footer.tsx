import Link from "next/link"
import { Clock, Mail, MapPin, Phone, Shield, Truck, Wrench } from "lucide-react"

import { BrandLogo } from "@/components/layout/brand-logo"
import { companyInfo } from "@/lib/data/company"
import { agencies, categories, services } from "@/lib/data/navigation"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="bg-[radial-gradient(circle_at_top,rgba(255,133,28,0.18),transparent_42%)]">
        <div className="border-b border-background/10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureItem
                icon={<Truck className="size-5 text-primary" />}
                title="Vente & location"
                description="Catalogue vente et catalogue location"
              />
              <FeatureItem
                icon={<Wrench className="size-5 text-primary" />}
                title="Maintenance respiratoire"
                description="3M et KASCO"
              />
              <FeatureItem
                icon={<Shield className="size-5 text-primary" />}
                title="FIT TEST"
                description="Contrôle d'ajustement des masques"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12">
            <div>
              <Link
                href="/"
                className="mb-5 inline-flex rounded-2xl border border-white/12 bg-white px-4 py-3 shadow-[0_18px_44px_-28px_rgba(0,0,0,0.55)]"
              >
                <BrandLogo className="h-12 w-[180px] lg:h-14 lg:w-[210px]" />
              </Link>
              <p className="mb-4 max-w-sm text-sm leading-relaxed text-background/72">
                {companyInfo.summary} Siège social à {companyInfo.headOffice.city} et réseau
                d&apos;implantations en France.
              </p>
              <div className="space-y-2">
                <a
                  href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
                >
                  <Phone className="size-4" />
                  {companyInfo.phone}
                </a>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
                >
                  <Mail className="size-4" />
                  {companyInfo.email}
                </a>
                <div className="flex items-start gap-2 text-sm text-background/70">
                  <MapPin className="mt-0.5 size-4" />
                  <span>{companyInfo.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-background/70">
                  <Clock className="size-4" />
                  {companyInfo.headOffice.hours}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-background/70">
                Catalogue
              </h3>
              <ul className="space-y-2.5">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/boutique/${category.slug}`}
                      className="text-sm text-background/72 transition-colors hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/boutique" className="text-sm font-medium text-primary hover:underline">
                    Voir tout le catalogue
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-background/70">
                Services
              </h3>
              <ul className="space-y-2.5">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/${service.slug}`}
                      className="text-sm text-background/72 transition-colors hover:text-primary"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/devis" className="text-sm text-background/72 transition-colors hover:text-primary">
                    Demande de devis
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-background/72 transition-colors hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="text-sm text-background/72 transition-colors hover:text-primary">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mentions-legales"
                    className="text-sm text-background/72 transition-colors hover:text-primary"
                  >
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/conditions-generales-de-vente"
                    className="text-sm text-background/72 transition-colors hover:text-primary"
                  >
                    Conditions générales de vente
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-background/70">
                Agences
              </h3>
              <ul className="space-y-3">
                {agencies.map((agency) => (
                  <li key={agency.slug}>
                    <Link
                      href={`/agences/${agency.slug}`}
                      className="group flex items-start gap-2 text-sm text-background/72 transition-colors hover:text-primary"
                    >
                      <MapPin className="mt-0.5 size-3.5 flex-shrink-0" />
                      <span>
                        {agency.name} - {agency.city}
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/agences" className="text-sm font-medium text-primary hover:underline">
                    Voir toutes les agences
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10 bg-black/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-background/60">
              <span>&copy; {new Date().getFullYear()} {companyInfo.legalName}. Tous droits réservés.</span>
              <Link href="/a-propos" className="transition-colors hover:text-primary">
                À propos
              </Link>
              <Link href="/contact" className="transition-colors hover:text-primary">
                Contact
              </Link>
              <Link href="/agences" className="transition-colors hover:text-primary">
                Agences
              </Link>
              <Link href="/mentions-legales" className="transition-colors hover:text-primary">
                Mentions légales
              </Link>
              <Link href="/conditions-generales-de-vente" className="transition-colors hover:text-primary">
                CGV
              </Link>
            </div>
            <div className="text-xs text-background/60">
              {companyInfo.headOffice.city} - {companyInfo.headOffice.address}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/18">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-background/60">{description}</p>
      </div>
    </div>
  )
}
