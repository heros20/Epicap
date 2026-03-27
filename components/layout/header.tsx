"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  Phone,
  ChevronDown,
  MapPin,
  Truck,
  Wrench
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { categories, services, agencies } from "@/lib/data/navigation"

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [cartCount] = React.useState(0)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200",
      isScrolled 
        ? "bg-background/95 backdrop-blur-md border-b shadow-sm" 
        : "bg-background border-b"
    )}>
      {/* Top Bar */}
      <div className="bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/agences" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <MapPin className="size-3.5" />
                <span>7 agences en France</span>
              </Link>
              <Link href="/location" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Truck className="size-3.5" />
                <span>Location de matériel</span>
              </Link>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <a href="tel:0145137200" className="flex items-center gap-1.5 font-medium hover:text-primary transition-colors">
                <Phone className="size-3.5" />
                <span>01 45 13 72 00</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg lg:text-xl">E</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-bold text-foreground">EPICAP</span>
                <p className="text-xs text-muted-foreground leading-tight">Spécialiste désamiantage</p>
              </div>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Rechercher un produit, une référence..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="size-5" />
              <span className="sr-only">Rechercher</span>
            </Button>

            {/* Account */}
            <Link href="/compte">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="size-5" />
                <span className="sr-only">Mon compte</span>
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/panier">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Panier</span>
              </Button>
            </Link>

            {/* CTA Desktop */}
            <Button asChild className="hidden lg:flex">
              <Link href="/devis">Demander un devis</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <MobileNav />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:block border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <NavigationMenu className="h-12">
            <NavigationMenuList className="gap-0">
              {/* Produits Mega Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-12 rounded-none bg-transparent hover:bg-accent data-[state=open]:bg-accent">
                  Nos produits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[800px] grid-cols-3">
                    {categories.slice(0, 6).map((category) => (
                      <NavigationMenuLink key={category.slug} asChild>
                        <Link
                          href={`/boutique/${category.slug}`}
                          className="block select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none mb-1">{category.name}</div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {category.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                    <div className="col-span-3 pt-3 border-t mt-3">
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

              {/* Categories directes */}
              {categories.slice(0, 4).map((category) => (
                <NavigationMenuItem key={category.slug}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={`/boutique/${category.slug}`}
                      className="h-12 px-4 inline-flex items-center text-sm font-medium hover:text-primary transition-colors"
                    >
                      {category.name.split(" ").slice(0, 2).join(" ")}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {/* Services */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-12 rounded-none bg-transparent hover:bg-accent data-[state=open]:bg-accent">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    {services.map((service) => (
                      <NavigationMenuLink key={service.slug} asChild>
                        <Link
                          href={`/${service.slug}`}
                          className="flex items-start gap-3 select-none rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {service.slug === "location" && <Truck className="size-5 text-primary" />}
                            {service.slug === "maintenance" && <Wrench className="size-5 text-primary" />}
                            {service.slug === "formation" && <User className="size-5 text-primary" />}
                          </div>
                          <div>
                            <div className="text-sm font-medium leading-none mb-1">{service.name}</div>
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

              {/* Agences */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/agences"
                    className="h-12 px-4 inline-flex items-center text-sm font-medium hover:text-primary transition-colors"
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Catégories</p>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.slug}>
                <button
                  onClick={() => setOpenCategory(openCategory === category.slug ? null : category.slug)}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent text-left"
                >
                  <span className="text-sm font-medium">{category.name}</span>
                  <ChevronDown className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    openCategory === category.slug && "rotate-180"
                  )} />
                </button>
                {openCategory === category.slug && (
                  <div className="pl-4 pb-2 space-y-1">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/boutique/${category.slug}/${sub.slug}`}
                        className="block p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="p-4 border-t">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Services</p>
          <div className="space-y-1">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/${service.slug}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
              >
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {service.slug === "location" && <Truck className="size-4 text-primary" />}
                  {service.slug === "maintenance" && <Wrench className="size-4 text-primary" />}
                  {service.slug === "formation" && <User className="size-4 text-primary" />}
                </div>
                <span className="text-sm font-medium">{service.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Agences */}
        <div className="p-4 border-t">
          <Link
            href="/agences"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
          >
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="size-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium block">Nos agences</span>
              <span className="text-xs text-muted-foreground">7 agences en France</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t p-4 space-y-2">
        <Button asChild className="w-full">
          <Link href="/devis">Demander un devis</Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href="/compte">
            <User className="size-4 mr-2" />
            Mon compte
          </Link>
        </Button>
      </div>
    </div>
  )
}
