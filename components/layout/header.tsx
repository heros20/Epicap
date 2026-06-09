"use client"

import * as React from "react"
import Link from "next/link"
import {
  ChevronDown,
  ClipboardCheck,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  Truck,
  Wrench,
} from "lucide-react"

import { HeaderAuthControls } from "@/components/auth/header-auth-controls"
import { BrandLogo } from "@/components/layout/brand-logo"
import { HeaderSearchBox } from "@/components/layout/header-search-box"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { safeTrack } from "@/lib/analytics/events"
import { useCart } from "@/lib/cart/use-cart"
import { companyInfo } from "@/lib/data/company"
import { agencies, categories, services } from "@/lib/data/navigation"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { itemCount } = useCart()

  React.useEffect(() => {
    const collapseAt = 56
    const expandAt = 4

    const handleScroll = () => {
      const scrollY = window.scrollY

      setIsScrolled((current) => {
        if (!current && scrollY > collapseAt) {
          return true
        }

        if (current && scrollY <= expandAt) {
          return false
        }

        return current
      })
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const desktopNavItemClassName =
    "inline-flex h-full min-h-12 items-center justify-center px-4 text-sm font-semibold leading-none text-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
  const desktopNavTriggerClassName =
    "h-full min-h-12 rounded-none bg-transparent px-4 text-sm font-semibold leading-none text-foreground hover:bg-accent/70 hover:text-foreground data-[state=open]:bg-accent/80 data-[state=open]:text-foreground"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/70 transition-all duration-300 [overflow-anchor:none]",
        isScrolled
          ? "bg-background/84 shadow-[0_18px_38px_-34px_rgba(15,16,18,0.24)] backdrop-blur-xl"
          : "bg-background/96",
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-foreground text-background transition-all duration-300",
          isScrolled ? "h-0 opacity-0" : "h-10 opacity-100",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/agences"
                className="flex items-center gap-1.5 text-background/80 transition-colors hover:text-primary"
              >
                <MapPin className="size-3.5" />
                <span>{agencies.length} agences en France</span>
              </Link>
              <Link
                href="/location"
                className="flex items-center gap-1.5 text-background/80 transition-colors hover:text-primary"
              >
                <Truck className="size-3.5" />
                <span>Location de matériel</span>
              </Link>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <a
                href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
                data-analytics-manual="true"
                onClick={() => safeTrack("Phone Clicked", { source_page: "header-topbar" })}
                className="flex items-center gap-1.5 font-medium transition-colors hover:text-primary"
              >
                <Phone className="size-3.5" />
                <span>{companyInfo.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-visible">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,133,28,0.8),transparent)]" />

        <div className="container relative mx-auto px-4">
          <div
            className={cn(
              "flex items-center justify-between gap-4 transition-[height] duration-300",
              isScrolled ? "h-14 lg:h-16" : "h-16 lg:h-20",
            )}
          >
            <Link href="/" className="flex-shrink-0">
              <BrandLogo
                priority
                className={cn(
                  "transition-[height,width] duration-300",
                  isScrolled
                    ? "h-9 w-[130px] sm:h-10 sm:w-[148px] lg:h-11 lg:w-[166px]"
                    : "h-11 w-[150px] sm:h-12 sm:w-[178px] lg:h-14 lg:w-[212px]",
                )}
              />
            </Link>

            <HeaderSearchBox className="mx-8 hidden max-w-xl flex-1 lg:flex" />

            <div className="flex items-center gap-2 lg:gap-3">
              <Button asChild variant="ghost" size="icon" className="rounded-full lg:hidden">
                <Link href="/boutique" aria-label="Rechercher dans le catalogue">
                  <Search className="size-5" />
                </Link>
              </Button>

              <Link href="/panier">
                <Button variant="ghost" size="icon" className="relative rounded-full">
                  <ShoppingCart className="size-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 size-5 rounded-full p-0 text-[10px] shadow-sm">
                      {itemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Panier</span>
                </Button>
              </Link>

              <Button asChild className="hidden rounded-full px-5 shadow-sm lg:flex">
                <Link
                  href="/devis?source=header"
                  data-analytics-manual="true"
                  onClick={() => safeTrack("Quote CTA Clicked", { source_page: "header" })}
                >
                  Demander un devis
                </Link>
              </Button>

              <HeaderAuthControls />

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full lg:hidden">
                    <Menu className="size-5" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 border-border/70 p-0">
                  <SheetHeader className="border-b border-border/70 bg-muted/40 p-4">
                    <SheetTitle className="text-left">
                      <BrandLogo className="h-10 w-[150px]" />
                    </SheetTitle>
                  </SheetHeader>
                  <MobileNav />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <nav className="hidden border-t border-border/60 bg-background/92 backdrop-blur-xl lg:block">
        <div className="container mx-auto px-4">
          <NavigationMenu
            className={cn("max-w-none transition-[height] duration-300", isScrolled ? "h-12" : "h-14")}
            viewport={false}
          >
            <NavigationMenuList className="h-full items-stretch gap-0">
              <NavigationMenuItem className="h-full">
                <NavigationMenuTrigger className={desktopNavTriggerClassName}>
                  Nos produits
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:left-0 md:translate-x-0">
                  <div className="grid w-[1120px] max-w-[calc(100vw-4rem)] grid-cols-4 gap-3 bg-popover p-6 text-popover-foreground">
                    {categories.map((category) => (
                      <NavigationMenuLink key={category.slug} asChild>
                        <Link
                          href={`/boutique/${category.slug}`}
                          className="block rounded-2xl border border-transparent p-4 leading-none text-foreground outline-none transition-colors hover:border-primary/20 hover:bg-accent/60 hover:text-foreground focus:border-primary/20 focus:bg-accent/60 focus:text-foreground"
                        >
                          <div className="mb-2 text-sm font-semibold leading-none">
                            {category.name}
                          </div>
                          <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
                            {category.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                    <div className="col-span-4 mt-3 border-t border-border/70 pt-4">
                      <Link
                        href="/boutique"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Voir tous les produits
                        <ChevronDown className="size-3 -rotate-90" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {categories.slice(0, 5).map((category) => (
                <NavigationMenuItem key={category.slug} className="h-full">
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/boutique/${category.slug}`}
                      className={desktopNavItemClassName}
                    >
                      {category.shortName}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem className="h-full">
                <NavigationMenuTrigger className={desktopNavTriggerClassName}>
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent className="md:right-0 md:left-auto md:translate-x-0">
                  <div className="grid w-[460px] gap-3 bg-popover p-6 text-popover-foreground">
                    {services.map((service) => (
                      <NavigationMenuLink key={service.slug} asChild>
                        <Link
                          href={`/${service.slug}`}
                          className="flex items-start gap-3 rounded-2xl border border-transparent p-4 leading-none text-foreground outline-none transition-colors hover:border-primary/20 hover:bg-accent/60 hover:text-foreground focus:border-primary/20 focus:bg-accent/60 focus:text-foreground"
                        >
                          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15">
                            {service.slug === "location" && <Truck className="size-5 text-primary" />}
                            {service.slug === "maintenance" && <Wrench className="size-5 text-primary" />}
                            {service.slug === "fit-test" && <ClipboardCheck className="size-5 text-primary" />}
                          </div>
                          <div>
                            <div className="mb-1 text-sm font-medium leading-none">{service.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {service.description}
                            </p>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="h-full">
                <NavigationMenuLink asChild>
                  <Link
                    href="/agences"
                    className={desktopNavItemClassName}
                  >
                    Nos agences
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  )
}

function MobileNav() {
  const [openCategory, setOpenCategory] = React.useState<string | null>(null)

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border/70 p-4">
          <HeaderSearchBox mobile />
        </div>

        <div className="p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Catégories
          </p>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.slug}>
                <button
                  onClick={() =>
                    setOpenCategory(openCategory === category.slug ? null : category.slug)
                  }
                  className="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors hover:bg-accent"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform",
                      openCategory === category.slug && "rotate-180",
                    )}
                  />
                </button>
                {openCategory === category.slug && (
                  <div className="space-y-1 pb-2 pl-4">
                    {category.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        href={`/boutique/${category.slug}?subcategory=${subcategory.slug}`}
                        className="block rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border/70 p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Services
          </p>
          <div className="space-y-1">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
              >
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
                  {service.slug === "location" && <Truck className="size-4 text-primary" />}
                  {service.slug === "maintenance" && <Wrench className="size-4 text-primary" />}
                  {service.slug === "fit-test" && <ClipboardCheck className="size-4 text-primary" />}
                </div>
                <span className="text-sm font-medium">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border/70 p-4">
          <Link
            href="/agences"
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-accent"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
              <MapPin className="size-4 text-primary" />
            </div>
            <div>
              <span className="block text-sm font-medium">Nos agences</span>
              <span className="text-xs text-muted-foreground">Réseau national Epicap</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/70 bg-muted/35 p-4">
        <HeaderAuthControls mobile />
        <Button asChild className="w-full rounded-full">
          <Link
            href="/devis?source=mobile-header"
            data-analytics-manual="true"
            onClick={() => safeTrack("Quote CTA Clicked", { source_page: "mobile-header" })}
          >
            Demander un devis
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full rounded-full">
          <a
            href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}
            data-analytics-manual="true"
            onClick={() => safeTrack("Phone Clicked", { source_page: "mobile-header" })}
          >
            <Phone className="mr-2 size-4" />
            {companyInfo.phone}
          </a>
        </Button>
      </div>
    </div>
  )
}
