"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getProfileDisplayName, isAdminRole, ROLE_LABELS } from "@/lib/auth/types"

function getInitials(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function HeaderAuthControls({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter()
  const { user, profile, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    if (mobile) {
      return (
        <div className="grid gap-2">
          <Button asChild className="w-full rounded-full">
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link href="/inscription">Créer un compte</Link>
          </Button>
        </div>
      )
    }

    return (
      <>
        <Button asChild variant="ghost" className="hidden rounded-full px-4 md:inline-flex">
          <Link href="/connexion">Connexion</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="hidden rounded-full border-border/70 px-4 xl:inline-flex"
        >
          <Link href="/inscription">Créer un compte</Link>
        </Button>
      </>
    )
  }

  const displayName = getProfileDisplayName(profile, user.email)
  const initials = getInitials(displayName || "EP")
  const roleLabel = profile ? ROLE_LABELS[profile.role] : "Compte"

  if (mobile) {
    return (
      <div className="rounded-[1.35rem] border border-border/70 bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 border border-border/70">
            <AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          {profile?.company?.name || profile?.company_name ? (
            <Badge variant="outline">{profile.company?.name ?? profile.company_name}</Badge>
          ) : null}
        </div>
        <div className="mt-4 grid gap-2">
          <Button asChild className="w-full rounded-full">
            <Link href="/dashboard">Ouvrir mon espace</Link>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full"
            onClick={() => router.push("/auth/signout")}
          >
            Déconnexion
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto rounded-full px-2 py-1.5">
          <div className="flex items-center gap-3 rounded-full border border-border/70 bg-background px-2 py-1.5 shadow-sm">
            <Avatar className="size-9 border border-border/70">
              <AvatarFallback className="bg-primary/12 text-sm font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-0 text-left xl:block">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl border-border/70 p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <div className="px-3 pb-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            {profile?.company?.name || profile?.company_name ? (
              <Badge variant="outline">{profile.company?.name ?? profile.company_name}</Badge>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <LayoutDashboard className="size-4" />
          Tableau de bord
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/profil")}>
          <UserRound className="size-4" />
          Mon profil
        </DropdownMenuItem>
        {profile && isAdminRole(profile.role) ? (
          <DropdownMenuItem onClick={() => router.push("/dashboard/equipe")}>
            <ShieldCheck className="size-4" />
            Administration
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => router.push("/auth/signout")}
        >
          <LogOut className="size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
