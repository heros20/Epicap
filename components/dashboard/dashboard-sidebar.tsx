"use client"

import type { ReactNode } from "react"
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
  Loader2,
  LogOut,
  Mail,
  Menu,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react"

import { PendingLinkButton } from "@/components/dashboard/pending-link-button"
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
  ROLE_LABELS,
  getProfileDisplayName,
  getVisibleDashboardGroups,
  getVisibleDashboardItems,
  isAdminRole,
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
  return <NavigationPanel user={user} profile={profile} />
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
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm xl:hidden">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            {currentItem ? DASHBOARD_NAV_GROUP_LABELS[currentItem.group] : "Tableau de bord"}
          </p>
          <p className="truncate text-base font-semibold">
            {currentItem?.label ?? "Navigation"}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {currentItem?.description ?? "Accès rapides au cockpit Epicap"}
          </p>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-md">
              <Menu className="size-4" />
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[92vw] max-w-sm border-border/70 p-0">
            <SheetHeader className="border-b border-border/70 bg-muted/25">
              <SheetTitle>Navigation du tableau de bord</SheetTitle>
              <SheetDescription>Accès rapide aux vues Epicap selon votre rôle.</SheetDescription>
            </SheetHeader>
            <div className="h-full overflow-y-auto p-4">
              <NavigationPanel
                user={user}
                profile={profile}
                mobile
                onNavigate={() => setOpen(false)}
              />
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
  return isAdminRole(profile.role) ? (
    <AdminNavigationPanel user={user} profile={profile} mobile={mobile} onNavigate={onNavigate} />
  ) : (
    <MemberNavigationPanel user={user} profile={profile} mobile={mobile} onNavigate={onNavigate} />
  )
}

function AdminNavigationPanel({
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
  const [signingOut, setSigningOut] = useState(false)
  const displayName = getProfileDisplayName(profile, user.email)
  const companyName = profile.company?.name ?? profile.company_name
  const groups = getVisibleDashboardGroups(profile.role)

  return (
    <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-950 px-4 py-5 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">
          Menu admin
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Avatar className="size-11 border border-white/15">
            <AvatarFallback className="bg-white/12 text-sm font-semibold text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-white/62">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className="rounded-md border border-emerald-300/20 bg-emerald-400/12 text-emerald-100">
            {ROLE_LABELS[profile.role]}
          </Badge>
          {companyName ? (
            <Badge className="rounded-md border border-white/12 bg-white/10 text-white">
              {companyName}
            </Badge>
          ) : null}
        </div>
      </div>

      <CardContent className="space-y-4 p-3">
        {groups.map((group) => (
          <section key={group.key}>
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = NAV_ICONS[item.href] ?? ShieldCheck
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-start gap-3 rounded-lg border px-3 py-3 transition-all",
                      isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-sm"
                        : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-white",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Contexte
          </p>
          <InfoRow icon={<Mail className="size-4" />} label={user.email ?? "Email non renseigné"} />
          <InfoRow
            icon={<BriefcaseBusiness className="size-4" />}
            label={profile.job_title || "Fonction à compléter"}
          />
          <InfoRow
            icon={<Factory className="size-4" />}
            label={companyName || "Société à compléter"}
          />
        </div>

        <PendingLinkButton
          href="/"
          variant="outline"
          className="w-full justify-between rounded-md"
          pendingLabel="Ouverture..."
          onClick={onNavigate}
        >
          Retour au site
          <ArrowUpRight className="size-4" />
        </PendingLinkButton>
        <Button
          variant="secondary"
          className={cn("w-full rounded-md", mobile && "mb-2")}
          disabled={signingOut}
          aria-busy={signingOut}
          onClick={() => {
            setSigningOut(true)
            onNavigate?.()
            router.push("/auth/signout")
          }}
        >
          {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          {signingOut ? "Déconnexion..." : "Déconnexion"}
        </Button>
      </CardContent>
    </Card>
  )
}

function MemberNavigationPanel({
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
  const [signingOut, setSigningOut] = useState(false)
  const displayName = getProfileDisplayName(profile, user.email)
  const companyName = profile.company?.name ?? profile.company_name
  const groups = getVisibleDashboardGroups(profile.role)

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-border/70 bg-card/90 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">{ROLE_LABELS[profile.role]}</Badge>
            {companyName ? <Badge variant="outline">{companyName}</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardContent className="space-y-4 p-4">
          {groups.map((group) => (
            <section key={group.key}>
              <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = NAV_ICONS[item.href] ?? ShieldCheck
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded-lg border px-4 py-3 transition-all",
                        isActive
                          ? "border-primary/30 bg-primary/8"
                          : "border-transparent hover:border-border/70 hover:bg-muted/40",
                      )}
                    >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-9 items-center justify-center rounded-md bg-muted">
                          <Icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </span>
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
          <PendingLinkButton
            href="/"
            variant="outline"
            className="w-full justify-between rounded-md"
            pendingLabel="Ouverture..."
            onClick={onNavigate}
          >
            Retour au site
            <ArrowUpRight className="size-4" />
          </PendingLinkButton>
          <Button
            variant="secondary"
            className={cn("w-full rounded-md", mobile && "mb-2")}
            disabled={signingOut}
            onClick={() => {
              setSigningOut(true)
              onNavigate?.()
              router.push("/auth/signout")
            }}
          >
            {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {signingOut ? "Déconnexion..." : "Déconnexion"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-xs text-slate-600">
      <span className="text-emerald-700">{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </div>
  )
}
