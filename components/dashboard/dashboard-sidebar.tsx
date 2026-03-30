"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Factory,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  LogOut,
  Mail,
  Menu,
  ShoppingBag,
  ReceiptText,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react"
import type { ReactNode } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DASHBOARD_NAV_GROUP_LABELS,
  getProfileDisplayName,
  getVisibleDashboardGroups,
  getVisibleDashboardItems,
  ROLE_LABELS,
  type AuthUser,
  type ProfileWithCompany,
} from "@/lib/auth/types"
import { cn } from "@/lib/utils"

const NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/profil": UserRound,
  "/dashboard/commandes": ReceiptText,
  "/dashboard/devis": FileText,
  "/dashboard/catalogue": ShoppingBag,
  "/dashboard/equipe": Users,
  "/dashboard/clients": Building2,
}

const NAV_PRIORITY: Record<string, boolean> = {
  "/dashboard": true,
  "/dashboard/commandes": true,
  "/dashboard/devis": true,
}

function getInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function DashboardSidebar({
  user,
  profile,
}: {
  user: AuthUser
  profile: ProfileWithCompany
}) {
  return (
    <div className="space-y-5">
      <NavigationPanel user={user} profile={profile} />
    </div>
  )
}

export function DashboardMobileNavigation({
  user,
  profile,
}: {
  user: AuthUser
  profile: ProfileWithCompany
}) {
  const pathname = usePathname()
  const currentItem =
    getVisibleDashboardItems(profile.role).find((item) => item.href === pathname) ??
    getVisibleDashboardItems(profile.role)[0]
  const [open, setOpen] = useState(false)

  return (
    <Card className="border-border/70 bg-card/92 xl:hidden">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
            {currentItem ? DASHBOARD_NAV_GROUP_LABELS[currentItem.group] : "Dashboard"}
          </p>
          <p className="truncate text-base font-semibold">
            {currentItem?.label ?? "Navigation"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {currentItem?.description ?? "Acces rapides au cockpit Epicap"}
          </p>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <Menu className="size-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[92vw] max-w-sm border-border/70 p-0">
            <SheetHeader className="border-b border-border/70 bg-muted/25">
              <SheetTitle>Navigation dashboard</SheetTitle>
              <SheetDescription>
                Acces rapide aux vues Epicap selon votre role.
              </SheetDescription>
            </SheetHeader>
            <div className="h-full overflow-y-auto p-4">
              <NavigationPanel user={user} profile={profile} mobile onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}

function NavigationPanel({
  user,
  profile,
  mobile = false,
  onNavigate,
}: {
  user: AuthUser
  profile: ProfileWithCompany
  mobile?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const displayName = getProfileDisplayName(profile, user.email)
  const companyName = profile.company?.name ?? profile.company_name
  const groups = getVisibleDashboardGroups(profile.role)

  return (
    <>
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-[0_22px_54px_-42px_rgba(15,16,18,0.32)]">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.22),transparent_38%),linear-gradient(135deg,#111317_0%,#1b1e24_100%)] p-6 text-background">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border border-background/15">
              <AvatarFallback className="bg-background/10 text-base font-semibold text-background">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{displayName}</p>
              <p className="truncate text-sm text-background/70">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="border border-primary/20 bg-primary/20 text-background">
              {ROLE_LABELS[profile.role]}
            </Badge>
            {companyName ? (
              <Badge variant="outline" className="border-background/20 text-background">
                {companyName}
              </Badge>
            ) : null}
          </div>
        </div>
        <CardContent className="space-y-3 p-5">
          <InfoRow icon={<Mail className="size-4 text-primary" />} label={user.email ?? "Email non renseigne"} />
          <InfoRow
            icon={<BriefcaseBusiness className="size-4 text-primary" />}
            label={profile.job_title || "Fonction a completer"}
          />
          <InfoRow
            icon={<Factory className="size-4 text-primary" />}
            label={companyName || "Societe a completer"}
          />
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-4">
          {groups.map((group) => (
            <section key={group.key}>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-primary/80">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = NAV_ICONS[item.href] ?? ShieldCheck
                  const isActive = pathname === item.href
                  const isPriority = NAV_PRIORITY[item.href]

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-[1.15rem] border px-4 py-3 transition-all",
                        isActive
                          ? "border-primary/30 bg-primary/8 shadow-[0_16px_32px_-24px_rgba(255,133,28,0.36)]"
                          : isPriority
                            ? "border-primary/18 bg-[linear-gradient(135deg,rgba(255,133,28,0.08),rgba(255,255,255,0))] hover:border-primary/30 hover:bg-primary/6"
                            : "border-transparent hover:border-border/70 hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex size-10 items-center justify-center rounded-xl",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : isPriority
                                ? "bg-primary/18 text-primary"
                                : "bg-muted text-foreground",
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{item.label}</p>
                            {isPriority ? (
                              <Badge variant="outline" className="px-2 py-0 text-[10px] uppercase tracking-[0.18em]">
                                Focus
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-3 p-4">
          <Button asChild variant="outline" className="w-full justify-between rounded-full">
            <Link href="/">
              Retour au site
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button
            variant="secondary"
            className={cn("w-full rounded-full", mobile && "mb-2")}
            onClick={() => {
              onNavigate?.()
              router.push("/auth/signout")
            }}
          >
            <LogOut className="size-4" />
            Deconnexion
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function InfoRow({
  icon,
  label,
}: {
  icon: ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/25 px-3 py-2.5 text-sm">
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/12">
        {icon}
      </div>
      <p className="min-w-0 truncate">{label}</p>
    </div>
  )
}
