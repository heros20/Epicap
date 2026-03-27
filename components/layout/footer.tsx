import Link from "next/link"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Linkedin,
  Clock,
  CreditCard,
  Truck,
  Shield,
  HeadphonesIcon
} from "lucide-react"

import { categories, agencies } from "@/lib/data/navigation"

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Reassurance Bar */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Truck className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Livraison rapide</p>
                <p className="text-xs text-background/60">France et Europe</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Paiement sécurisé</p>
                <p className="text-xs text-background/60">CB, virement, mandat</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Service client</p>
                <p className="text-xs text-background/60">Experts à votre écoute</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Garantie qualité</p>
                <p className="text-xs text-background/60">Produits certifiés</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">EPICAP</span>
              </div>
            </Link>
            <p className="text-sm text-background/70 mb-4 max-w-sm leading-relaxed">
              Spécialiste français du désamiantage et de la dépollution depuis plus de 30 ans. 
              Vente et location de matériel professionnel pour les entreprises du BTP.
            </p>
            <div className="space-y-2">
              <a href="tel:0145137200" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                <Phone className="size-4" />
                01 45 13 72 00
              </a>
              <a href="mailto:contact@epicap.com" className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                <Mail className="size-4" />
                contact@epicap.com
              </a>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Clock className="size-4" />
                Lun-Ven : 8h-18h
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Nos produits</h3>
            <ul className="space-y-2">
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link 
                    href={`/boutique/${category.slug}`}
                    className="text-sm text-background/70 hover:text-primary transition-colors"
                  >
                    {category.name.length > 25 
                      ? category.name.split(" ").slice(0, 3).join(" ") 
                      : category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/boutique"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir tout le catalogue
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/location" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Location de matériel
                </Link>
              </li>
              <li>
                <Link href="/maintenance" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Maintenance & SAV
                </Link>
              </li>
              <li>
                <Link href="/formation" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Formations
                </Link>
              </li>
              <li>
                <Link href="/devis" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Demande de devis
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Guides techniques
                </Link>
              </li>
            </ul>
            
            <h3 className="font-semibold mb-4 mt-6">Informations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/a-propos" className="text-sm text-background/70 hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/agences" className="text-sm text-background/70 hover:text-primary transition-colors">
                  Nos agences
                </Link>
              </li>
            </ul>
          </div>

          {/* Agencies */}
          <div>
            <h3 className="font-semibold mb-4">Nos agences</h3>
            <ul className="space-y-3">
              {agencies.slice(0, 5).map((agency) => (
                <li key={agency.slug}>
                  <Link 
                    href={`/agences/${agency.slug}`}
                    className="flex items-start gap-2 text-sm text-background/70 hover:text-primary transition-colors group"
                  >
                    <MapPin className="size-3.5 mt-0.5 flex-shrink-0" />
                    <span>{agency.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/agences"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Voir toutes les agences
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-background/60">
              <span>&copy; {new Date().getFullYear()} Epicap. Tous droits réservés.</span>
              <Link href="/mentions-legales" className="hover:text-primary transition-colors">
                Mentions légales
              </Link>
              <Link href="/cgv" className="hover:text-primary transition-colors">
                CGV
              </Link>
              <Link href="/confidentialite" className="hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.linkedin.com/company/epicap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
              <a 
                href="https://www.facebook.com/epicap" 
                target="_blank" 
                rel="noopener noreferrer"
                className="size-8 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
