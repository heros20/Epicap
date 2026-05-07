"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { Building2, FileText, Package2, ShieldCheck } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { safeTrack } from "@/lib/analytics/events"
import { initialRequestActionState } from "@/lib/commerce/request-action-state"
import { submitQuoteRequestAction } from "@/lib/commerce/request-actions"
import {
  safeParseQuoteRequestFormData,
  toFieldErrors,
  type CustomerType,
  type QuoteRequestType,
  type RequestFieldErrors,
} from "@/lib/commerce/request-validation"
import { useCart } from "@/lib/cart/use-cart"
import type { Product } from "@/lib/data/products"

interface QuoteRequestFormProps {
  requestedProduct?: Product
  preferredRequestType?: QuoteRequestType
  sourcePage?: string
  contextLabel?: string
  includeCartByDefault?: boolean
}

export function QuoteRequestForm({
  requestedProduct,
  preferredRequestType = "mixed",
  sourcePage,
  contextLabel,
  includeCartByDefault = false,
}: QuoteRequestFormProps) {
  const { user, profile } = useAuth()
  const { items } = useCart()
  const hasCompanyProfile = Boolean(profile?.company?.name ?? profile?.company_name)
  const [customerType, setCustomerType] = React.useState<CustomerType>(
    hasCompanyProfile ? "company" : "individual",
  )
  const [requestType, setRequestType] = React.useState<QuoteRequestType>(
    preferredRequestType,
  )
  const [includeCart, setIncludeCart] = React.useState(includeCartByDefault)
  const [clientFieldErrors, setClientFieldErrors] = React.useState<RequestFieldErrors>({})
  const [state, formAction, pending] = useActionState(
    submitQuoteRequestAction,
    initialRequestActionState,
  )

  const cartPayload = React.useMemo(
    () =>
      includeCart
        ? JSON.stringify(
            items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          )
        : "",
    [includeCart, items],
  )

  const defaultCompanyName = profile?.company?.name ?? profile?.company_name ?? ""
  const defaultContactName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || ""
  const defaultEmail = user?.email ?? profile?.email ?? ""
  const defaultPhone = profile?.phone ?? ""
  const companyDiscount = Number(profile?.company?.discount_percentage ?? 0)
  const activeFieldErrors =
    Object.keys(clientFieldErrors).length > 0
      ? clientFieldErrors
      : state.fieldErrors ?? {}
  const hasCatalogContext = Boolean(requestedProduct) || (includeCart && items.length > 0)
  const requestTypeLabel =
    requestType === "purchase"
      ? "Achat"
      : requestType === "rental"
        ? "Location"
        : requestType === "maintenance"
          ? "Maintenance"
          : requestType === "fit-test"
            ? "FIT TEST"
            : "Mixte"

  React.useEffect(() => {
    safeTrack("Quote Form Viewed", {
      source_page: sourcePage || "devis",
      context_label: contextLabel || undefined,
      request_type: requestType,
      customer_type: customerType,
      with_product: Boolean(requestedProduct),
      with_cart: includeCart && items.length > 0,
    })
  }, [
    contextLabel,
    customerType,
    includeCart,
    items.length,
    requestType,
    requestedProduct,
    sourcePage,
  ])

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const validation = safeParseQuoteRequestFormData(new FormData(event.currentTarget))

    if (!validation.success) {
      event.preventDefault()
      setClientFieldErrors(toFieldErrors(validation.error))
      return
    }

    setClientFieldErrors({})
  }, [])

  const handleFieldChange = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const target = event.target
      if (
        !(target instanceof HTMLInputElement) &&
        !(target instanceof HTMLTextAreaElement) &&
        !(target instanceof HTMLSelectElement)
      ) {
        return
      }

      const fieldName = target.name
      if (!fieldName || !clientFieldErrors[fieldName]) {
        return
      }

      setClientFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        delete nextErrors[fieldName]
        return nextErrors
      })
    },
    [clientFieldErrors],
  )

  return (
    <div className="space-y-6">
      {state.status === "success" ? (
        <Card className="border-success/25 bg-success/8 p-0">
          <CardContent className="space-y-4 p-6">
            <Badge className="border border-success/30 bg-success/12 text-success">
              Demande transmise
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold">Référence {state.reference}</h2>
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
                    ? "À confirmer"
                    : formatPrice(state.shippingAmount ?? 0)
                }
              />
              <SuccessChip
                label="Montant estimé"
                value={
                  state.hasQuoteOnlyItems
                    ? "Affinage commercial"
                    : formatPrice(state.total ?? 0)
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {state.status === "error" || Object.keys(activeFieldErrors).length > 0 ? (
        <Card className="border-destructive/25 bg-destructive/6 p-0">
          <CardContent className="p-4 text-sm text-destructive">
            {state.status === "error"
              ? state.message
              : "Corrigez les champs signalés avant d'envoyer la demande."}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-0">
          <CardContent className="space-y-6 p-6 lg:p-8">
            <div>
              <h2 className="text-xl font-semibold">Décrire votre besoin</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                La demande est connectée au back-office Epicap. Les erreurs sont indiquées champ
                par champ, et le parcours accepte aussi bien les entreprises que les particuliers.
              </p>
            </div>

            <form
              action={formAction}
              className="space-y-6"
              noValidate
              onSubmit={handleSubmit}
              onChange={handleFieldChange}
            >
              <input type="hidden" name="sourcePage" value={sourcePage ?? ""} />
              <input type="hidden" name="contextLabel" value={contextLabel ?? ""} />
              <input type="hidden" name="productSlug" value={requestedProduct?.slug ?? ""} />
              <input type="hidden" name="cartPayload" value={cartPayload} />

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Profil d'achat"
                  htmlFor="customerType"
                  className="md:col-span-2"
                  hint="Entreprise pour une société, Particulier pour un achat en nom propre."
                  error={activeFieldErrors.customerType}
                >
                  <select
                    id="customerType"
                    name="customerType"
                    value={customerType}
                    onChange={(event) => setCustomerType(event.target.value as CustomerType)}
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="company">Entreprise</option>
                    <option value="individual">Particulier</option>
                  </select>
                </Field>
                <Field
                  label="Nom du contact"
                  htmlFor="contactName"
                  error={activeFieldErrors.contactName}
                  required
                >
                  <Input
                    id="contactName"
                    name="contactName"
                    defaultValue={defaultContactName}
                    aria-invalid={Boolean(activeFieldErrors.contactName)}
                    placeholder={
                      customerType === "company" ? "Responsable chantier" : "Nom et prénom"
                    }
                    required
                  />
                </Field>
                {customerType === "company" ? (
                  <Field
                    label="Société"
                    htmlFor="companyName"
                    hint="Obligatoire pour une demande entreprise."
                    error={activeFieldErrors.companyName}
                    required
                  >
                    <Input
                      id="companyName"
                      name="companyName"
                      defaultValue={defaultCompanyName}
                      aria-invalid={Boolean(activeFieldErrors.companyName)}
                      placeholder="Nom de la société"
                      required
                    />
                  </Field>
                ) : (
                  <Field
                    label="Statut"
                    htmlFor="customerType-individual"
                    hint="Aucune société n'est requise pour un particulier."
                  >
                    <div
                      id="customerType-individual"
                      className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
                    >
                    Cette demande sera enregistrée comme particulier.
                    </div>
                  </Field>
                )}
                <Field
                  label="Email"
                  htmlFor="contactEmail"
                  error={activeFieldErrors.contactEmail}
                  required
                >
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={defaultEmail}
                    aria-invalid={Boolean(activeFieldErrors.contactEmail)}
                    placeholder="contact@exemple.fr"
                    required
                  />
                </Field>
                <Field
                  label="Téléphone"
                  htmlFor="contactPhone"
                  error={activeFieldErrors.contactPhone}
                  required
                >
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    defaultValue={defaultPhone}
                    aria-invalid={Boolean(activeFieldErrors.contactPhone)}
                    placeholder="+33 6 12 34 56 78"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Type de demande"
                  htmlFor="requestType"
                  error={activeFieldErrors.requestType}
                  required
                >
                  <select
                    id="requestType"
                    name="requestType"
                    value={requestType}
                    onChange={(event) =>
                      setRequestType(event.target.value as QuoteRequestType)
                    }
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="purchase">Achat</option>
                    <option value="rental">Location</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="fit-test">FIT TEST</option>
                    <option value="mixed">Mixte</option>
                  </select>
                </Field>
                <Field label="Agence / zone" htmlFor="requestedAgency">
                  <Input
                    id="requestedAgency"
                    name="requestedAgency"
                    placeholder="Ile-de-France, Normandie, multi-sites..."
                  />
                </Field>
                <Field label="Délai souhaité" htmlFor="requestedDelay">
                  <Input
                    id="requestedDelay"
                    name="requestedDelay"
                    placeholder="48h, semaine prochaine, urgent..."
                  />
                </Field>
                <Field
                  label="Durée location (jours)"
                  htmlFor="rentalDays"
                  hint={
                    requestType === "rental"
                      ? "Obligatoire pour une demande de location."
                      : "Laissez vide si la demande ne concerne pas une location."
                  }
                  error={activeFieldErrors.rentalDays}
                  required={requestType === "rental"}
                >
                  <Input
                    id="rentalDays"
                    name="rentalDays"
                    type="number"
                    min={1}
                    max={365}
                    aria-invalid={Boolean(activeFieldErrors.rentalDays)}
                    placeholder={requestType === "rental" ? "Nombre de jours" : "Optionnel"}
                    required={requestType === "rental"}
                  />
                </Field>
              </div>

              {requestedProduct ? (
                <div className="rounded-[1.2rem] border border-border/70 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <Package2 className="size-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{requestedProduct.name}</p>
                      <p className="text-sm text-muted-foreground">
                      Produit préchargé depuis le catalogue.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 max-w-[180px]">
                    <Field
                      label="Quantité"
                      htmlFor="productQuantity"
                      compact
                      error={activeFieldErrors.productQuantity}
                    >
                      <Input
                        id="productQuantity"
                        name="productQuantity"
                        type="number"
                        min={1}
                        max={999}
                        aria-invalid={Boolean(activeFieldErrors.productQuantity)}
                        defaultValue={1}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.2rem] border border-border/70 bg-muted/20 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={includeCart}
                    onChange={(event) => setIncludeCart(event.target.checked)}
                    className="mt-1 size-4 rounded border-border"
                  />
                  <div>
                    <p className="text-sm font-semibold">Joindre le panier actuel</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {items.length > 0
                        ? `${items.length} ligne(s) du panier peuvent être ajoutées à la demande.`
                        : "Aucun article n'est actuellement présent dans le panier local."}
                    </p>
                  </div>
                </label>
              </div>

              <Field
                label="Contexte chantier et besoin"
                htmlFor="message"
                hint={
                  hasCatalogContext
                    ? "Optionnel si le produit ou le panier suffit. Si vous ajoutez un commentaire, soyez précis."
                    : "Obligatoire si aucun produit ni panier n'est joint à la demande."
                }
                error={activeFieldErrors.message}
                required={!hasCatalogContext}
              >
                <Textarea
                  id="message"
                  name="message"
                  aria-invalid={Boolean(activeFieldErrors.message)}
                  placeholder="Nature du chantier, quantités, délais, arbitrage achat/location, contraintes d'accès, besoin de maintenance ou FIT TEST..."
                  className="min-h-36"
                  required={!hasCatalogContext}
                />
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {customerType === "company" && profile?.company?.payment_terms ? (
                    <span>Conditions société actuelles : {profile.company.payment_terms}</span>
                  ) : customerType === "individual" ? (
                    <span>Les particuliers peuvent aussi demander un devis ou une commande.</span>
                  ) : (
                    <span>Un compte Epicap permet un meilleur suivi des demandes.</span>
                  )}
                </div>
                <SubmitButton pending={pending} />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="p-0">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold">Contexte de la demande</p>
                  <p className="text-sm text-muted-foreground">
                    Origine et éléments déjà connus.
                  </p>
                </div>
              </div>
              <InfoRow label="Parcours" value={contextLabel ?? "Demande libre"} />
              <InfoRow label="Type recommandé" value={requestTypeLabel} />
              <InfoRow
                label="Produit lié"
                value={requestedProduct?.name ?? "Aucun produit préchargé"}
              />
              <InfoRow label="Compte" value={user ? "Identifié" : "Public non connecté"} />
            </CardContent>
          </Card>

          <Card className="p-0">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                  <Building2 className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold">Profil de demande</p>
                  <p className="text-sm text-muted-foreground">
                    Le formulaire et les conditions s&apos;adaptent au profil choisi.
                  </p>
                </div>
              </div>
              <InfoRow
                label="Profil"
                value={customerType === "company" ? "Entreprise" : "Particulier"}
              />
              <InfoRow
                label="Compte"
                value={
                  customerType === "company"
                    ? defaultCompanyName || "À renseigner dans le formulaire"
                    : "Aucune société requise"
                }
              />
              <InfoRow
                label="Conditions"
                value={
                  customerType === "company" && companyDiscount > 0
                    ? `Remise ${companyDiscount.toFixed(0)}%`
                    : "Tarification standard"
                }
              />
              <InfoRow
                label="Panier joint"
                value={includeCart && items.length > 0 ? "Oui" : "Non"}
              />
            </CardContent>
          </Card>

          {includeCart && items.length > 0 ? (
            <Card className="p-0">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12">
                    <Package2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">Articles joints</p>
                    <p className="text-sm text-muted-foreground">
                      Extraits du panier local au moment de l&apos;envoi.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {items.slice(0, 5).map((item) => (
                    <div
                      key={item.product.id}
                      className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm"
                    >
                      <p className="font-medium">{item.product.name}</p>
                      <p className="mt-1 text-muted-foreground">
                        {item.product.brand} - x{item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
                {items.length > 5 ? (
                  <p className="text-sm text-muted-foreground">
                    + {items.length - 5} autre(s) ligne(s) dans la demande.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-primary/20 bg-primary/6 p-0">
            <CardContent className="space-y-3 p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-primary" />
                <p className="font-semibold">Suivi commercial traçable</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Chaque demande crée une référence exploitable côté dashboard. Le besoin n&apos;est
                plus perdu dans un simple lien email.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/connexion">Se connecter pour suivre ses demandes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
  compact = false,
  className,
  hint,
  error,
  required = false,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
  compact?: boolean
  className?: string
  hint?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      <div className={compact ? "mt-1.5" : "mt-2"}>{children}</div>
      {error ? (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Transmission..." : "Transmettre la demande"}
    </Button>
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
