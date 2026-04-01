"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { Building2, ClipboardList, ShieldCheck, Truck } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { safeTrack } from "@/lib/analytics/events"
import { getPricingSnapshot } from "@/lib/commerce/pricing"
import { initialRequestActionState } from "@/lib/commerce/request-action-state"
import { submitOrderRequestAction } from "@/lib/commerce/request-actions"
import { useCart } from "@/lib/cart/use-cart"

export function OrderRequestForm() {
  const { user, profile } = useAuth()
  const { items } = useCart()
  const [state, formAction, pending] = useActionState(
    submitOrderRequestAction,
    initialRequestActionState,
  )
  const defaultCompanyName = profile?.company?.name ?? profile?.company_name ?? ""
  const defaultContactName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || ""
  const defaultEmail = user?.email ?? profile?.email ?? ""
  const defaultPhone = profile?.phone ?? ""
  const companyDiscountRate = Number(profile?.company?.discount_percentage ?? 0)
  const pricing = React.useMemo(
    () =>
      getPricingSnapshot(
        items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
        companyDiscountRate,
      ),
    [companyDiscountRate, items],
  )
  const cartPayload = React.useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      ),
    [items],
  )

  React.useEffect(() => {
    safeTrack("Checkout Viewed", {
      authenticated: Boolean(user),
      cart_items: items.length,
      logistics_mode: pricing.logisticsMode,
      quote_only_items: pricing.hasQuoteOnlyItems,
      company_discount_rate: companyDiscountRate || undefined,
    })
  }, [companyDiscountRate, items.length, pricing.hasQuoteOnlyItems, pricing.logisticsMode, user])

  return (
    <div className="space-y-6">
      {state.status === "success" ? (
        <Card className="border-success/25 bg-success/8 p-0">
          <CardContent className="space-y-4 p-6">
            <Badge className="border border-success/30 bg-success/12 text-success">
              Demande de commande creee
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold">Reference {state.reference}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{state.message}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SuccessChip label="Sous-total" value={formatPrice(state.subtotal ?? 0)} />
              <SuccessChip
                label="Remise"
                value={
                  state.discountAmount && state.discountAmount > 0
                    ? `-${formatPrice(state.discountAmount)}`
                    : "Aucune"
                }
              />
              <SuccessChip
                label="Logistique"
                value={
                  state.logisticsMode === "manual"
                    ? "A confirmer"
                    : formatPrice(state.shippingAmount ?? 0)
                }
              />
              <SuccessChip
                label="Total estime"
                value={
                  state.hasQuoteOnlyItems
                    ? "Affinage commercial"
                    : formatPrice(state.total ?? 0)
                }
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/dashboard/commandes">Voir le suivi</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/panier">Retour au panier</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "error" ? (
        <Card className="border-destructive/25 bg-destructive/6 p-0">
          <CardContent className="p-4 text-sm text-destructive">{state.message}</CardContent>
        </Card>
      ) : null}

      {state.status === "success" ? null : (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="p-0">
            <CardContent className="space-y-6 p-6 lg:p-8">
              <div>
                <h2 className="text-xl font-semibold">Transmettre la demande de commande</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Le tunnel ne simule plus un paiement. La demande est creee en base puis reprise
                  par Epicap pour confirmation stock, transport et conditions B2B.
                </p>
              </div>

              <form action={formAction} className="space-y-6">
                <input type="hidden" name="cartPayload" value={cartPayload} />

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nom du contact" htmlFor="contactName">
                    <Input
                      id="contactName"
                      name="contactName"
                      defaultValue={defaultContactName}
                      placeholder="Responsable chantier"
                      required
                    />
                  </Field>
                  <Field label="Societe" htmlFor="companyName">
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={defaultCompanyName}
                      placeholder="Entreprise"
                      required
                    />
                  </Field>
                  <Field label="Email" htmlFor="contactEmail">
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      defaultValue={defaultEmail}
                      placeholder="contact@entreprise.fr"
                      required
                    />
                  </Field>
                  <Field label="Telephone" htmlFor="contactPhone">
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      defaultValue={defaultPhone}
                      placeholder="+33 6 12 34 56 78"
                      required
                    />
                  </Field>
                  <Field label="SIRET" htmlFor="siret">
                    <Input id="siret" name="siret" placeholder="12345678901234" />
                  </Field>
                  <Field label="Reference chantier" htmlFor="siteReference">
                    <Input
                      id="siteReference"
                      name="siteReference"
                      placeholder="CHANTIER-2026-042"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Adresse" htmlFor="address" className="md:col-span-3">
                    <Input
                      id="address"
                      name="address"
                      placeholder="12 rue des Entrepreneurs"
                      required
                    />
                  </Field>
                  <Field label="Code postal" htmlFor="postalCode">
                    <Input id="postalCode" name="postalCode" placeholder="75001" required />
                  </Field>
                  <Field label="Ville" htmlFor="city">
                    <Input id="city" name="city" placeholder="Paris" required />
                  </Field>
                  <Field label="Pays" htmlFor="country">
                    <Input id="country" name="country" defaultValue="France" required />
                  </Field>
                </div>

                <Field label="Mode de reglement" htmlFor="paymentMethod">
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    defaultValue={
                      profile?.company?.payment_terms ? "account-terms" : "bank-transfer"
                    }
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="bank-transfer">Virement bancaire</option>
                    <option value="account-terms">Conditions de compte</option>
                    <option value="card-review">Validation CB par conseiller</option>
                  </select>
                </Field>

                <Field label="Consignes logistiques" htmlFor="notes">
                  <Textarea
                    id="notes"
                    name="notes"
                    className="min-h-32"
                    placeholder="Acces chantier, horaires, livraison agence ou site, contraintes de manutention, besoin de retrait..."
                  />
                </Field>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    {profile?.company?.payment_terms ? (
                      <span>Conditions societes actuelles: {profile.company.payment_terms}</span>
                    ) : (
                      <span>
                        Vous pouvez aussi convertir le panier en demande de devis si besoin.
                      </span>
                    )}
                  </div>
                  <Button type="submit" size="lg" disabled={pending}>
                    {pending ? "Transmission..." : "Transmettre la commande"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="p-0">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                    <ClipboardList className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Etat de la demande</p>
                    <p className="text-sm text-muted-foreground">
                      Montant indicatif avant validation Epicap.
                    </p>
                  </div>
                </div>
                <InfoRow label="Articles" value={`${items.length} ligne(s)`} />
                <InfoRow
                  label="Logistique"
                  value={pricing.logisticsMode === "manual" ? "A confirmer" : "Estimee"}
                />
                <InfoRow
                  label="Produits sur devis"
                  value={pricing.hasQuoteOnlyItems ? "Oui" : "Non"}
                />
                <InfoRow label="Compte" value={user ? "Connecte" : "Public non connecte"} />
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                    <Building2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Conditions B2B</p>
                    <p className="text-sm text-muted-foreground">
                      Les remises et termes de compte sont integres au recapitulatif.
                    </p>
                  </div>
                </div>
                <InfoRow label="Societe" value={defaultCompanyName || "A renseigner"} />
                <InfoRow
                  label="Remise societe"
                  value={companyDiscountRate > 0 ? `${companyDiscountRate.toFixed(0)}%` : "Aucune"}
                />
                <InfoRow
                  label="Reglement"
                  value={profile?.company?.payment_terms || "Validation a definir"}
                />
              </CardContent>
            </Card>

            <Card className="p-0">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                    <Truck className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Recapitulatif</p>
                    <p className="text-sm text-muted-foreground">
                      Estimation calculee a partir du panier courant.
                    </p>
                  </div>
                </div>
                <InfoRow label="Sous-total HT" value={formatPrice(pricing.subtotal)} />
                <InfoRow
                  label="Remise"
                  value={
                    pricing.discountAmount > 0
                      ? `-${formatPrice(pricing.discountAmount)}`
                      : "Aucune"
                  }
                />
                <InfoRow
                  label="Logistique"
                  value={
                    pricing.logisticsMode === "manual"
                      ? "A confirmer"
                      : pricing.shippingAmount === 0
                        ? "Offerte"
                        : formatPrice(pricing.shippingAmount)
                  }
                />
                <InfoRow label="TVA estimee" value={formatPrice(pricing.taxAmount)} />
                <InfoRow
                  label="Total estime"
                  value={
                    pricing.hasQuoteOnlyItems
                      ? "Affinage commercial"
                      : formatPrice(pricing.total)
                  }
                />
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/6 p-0">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="size-5 text-primary" />
                  <p className="font-semibold">Besoin d&apos;un chiffrage plus large ?</p>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Pour basculer un panier complexe, une location ou un besoin multisites, la
                  demande de devis reste disponible avec les memes references.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/devis?cart=1&source=checkout">Basculer en demande de devis</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  )
}

function SuccessChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-success/20 bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}
