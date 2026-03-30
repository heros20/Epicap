"use client"

import type { FormEvent, ReactNode } from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart/use-cart"
import { companyInfo } from "@/lib/data/company"
import type { CartItem } from "@/lib/cart/cart-context"

const FREE_SHIPPING_THRESHOLD = 500

type CheckoutStep = "shipping" | "payment"
type PaymentMethod = "card" | "sepa"

interface CompletedOrder {
  itemCount: number
  subtotal: number
  shipping: number
  tax: number
  total: number
}

const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" })

function formatPrice(value: number) {
  return priceFormatter.format(value)
}

export default function CheckoutPage() {
  const { items, itemCount, subtotal, shipping, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>("shipping")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null)
  const tax = subtotal * 0.2
  const total = subtotal + shipping + tax

  if (completedOrder) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top,rgba(255,133,28,0.18),transparent_34%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)]">
            <div className="container mx-auto grid max-w-5xl gap-6 px-4 py-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:py-20">
              <Card className="p-0">
                <CardContent className="px-6 py-12 text-center">
                  <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-primary/12 text-primary"><CheckCircle2 className="size-8" /></div>
                  <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">Commande transmise</Badge>
                  <h1 className="mb-4 text-4xl font-bold tracking-tight">Votre demande a bien été enregistrée</h1>
                  <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground">L’équipe Epicap peut reprendre la validation selon disponibilité chantier, produits sur devis et contraintes logistiques.</p>
                  <div className="grid gap-4 text-left md:grid-cols-3">
                    <SuccessCard title="Commande préparée" description={`${completedOrder.itemCount} article(s) envoyés pour validation.`} />
                    <SuccessCard title="Montant estimé" description={`${formatPrice(completedOrder.total)} TTC transmis à titre indicatif.`} />
                    <SuccessCard title="Suivi commercial" description="Un conseiller Epicap peut revenir vers vous pour confirmation." />
                  </div>
                  <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Button asChild size="lg"><Link href="/boutique">Retour au catalogue<ArrowRight className="ml-2 size-4" /></Link></Button>
                    <Button asChild size="lg" variant="outline"><Link href="/contact">Contacter Epicap</Link></Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-0">
                <CardHeader className="border-b border-border/70"><CardTitle>Résumé transmis</CardTitle></CardHeader>
                <CardContent className="space-y-3 p-6 text-sm">
                  <SummaryRow label="Sous-total HT" value={formatPrice(completedOrder.subtotal)} />
                  <SummaryRow label="Livraison" value={completedOrder.shipping === 0 ? "Offerte" : formatPrice(completedOrder.shipping)} />
                  <SummaryRow label="TVA estimée" value={formatPrice(completedOrder.tax)} />
                  <Separator />
                  <SummaryRow label="Total estimé TTC" value={formatPrice(completedOrder.total)} className="text-base font-semibold text-foreground" valueClassName="text-lg" />
                  <Separator />
                  <Button asChild variant="ghost" className="h-auto rounded-full px-0 text-primary"><a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}><Phone className="mr-2 size-4" />{companyInfo.phone}</a></Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <section className="container mx-auto px-4 py-12">
            <Card className="mx-auto max-w-2xl p-0"><CardContent className="px-6 py-12 text-center"><h1 className="mb-3 text-3xl font-bold">Aucun article à finaliser</h1><p className="mb-8 text-base leading-7 text-muted-foreground">Ajoutez des références à votre panier ou basculez vers une demande de devis.</p><div className="flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg"><Link href="/boutique">Accéder au catalogue</Link></Button><Button asChild size="lg" variant="outline"><Link href="/devis">Demander un devis</Link></Button></div></CardContent></Card>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0)

  const handleShippingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStep("payment")
  }

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsProcessing(true)
    const snapshot = { itemCount, subtotal, shipping, tax, total }
    window.setTimeout(() => {
      clearCart()
      setCompletedOrder(snapshot)
      setIsProcessing(false)
    }, 1400)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="border-b border-border/70 bg-[radial-gradient(circle_at_top_right,rgba(255,133,28,0.16),transparent_28%),linear-gradient(180deg,rgba(15,16,18,0.02),rgba(255,255,255,0)_72%)]">
          <div className="container mx-auto px-4 py-6 lg:py-8">
            <Breadcrumb className="mb-8"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link href="/">Accueil</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbLink asChild><Link href="/panier">Panier</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>Checkout</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl"><Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">Validation commande</Badge><h1 className="mb-3 text-4xl font-bold tracking-tight">Finaliser votre commande Epicap</h1><p className="text-base leading-7 text-muted-foreground">Saisissez vos informations de livraison, choisissez votre mode de règlement et transmettez votre demande de commande.</p></div>
              <div className="flex flex-wrap gap-3"><Badge className="rounded-full px-4 py-1.5">{itemCount} article(s)</Badge><Badge variant="outline" className="rounded-full px-4 py-1.5">{shipping === 0 ? "Livraison offerte acquise" : "Montant logistique estimé"}</Badge></div>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              <StepPill number={1} title="Coordonnées chantier" description="Contact, entreprise et adresse" active={step === "shipping"} completed={step === "payment"} />
              <StepPill number={2} title="Règlement" description="Mode de paiement et validation" active={step === "payment"} />
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-12">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              {step === "shipping" ? (
                <Card className="p-0">
                  <CardHeader className="border-b border-border/70 bg-muted/18"><CardTitle>Coordonnées de livraison</CardTitle><CardDescription>Utilisées pour la préparation logistique et le suivi commercial.</CardDescription></CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleShippingSubmit} className="space-y-8">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Nom et prénom" htmlFor="contact-name"><Input id="contact-name" placeholder="Responsable chantier" required /></Field>
                        <Field label="Téléphone" htmlFor="phone"><Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" required /></Field>
                        <Field label="Email" htmlFor="email"><Input id="email" type="email" placeholder="contact@entreprise.fr" required /></Field>
                        <Field label="Raison sociale" htmlFor="company"><Input id="company" placeholder="Entreprise SARL" required /></Field>
                        <Field label="SIRET" htmlFor="siret"><Input id="siret" placeholder="12345678901234" /></Field>
                        <Field label="Référence chantier" htmlFor="site-reference"><Input id="site-reference" placeholder="AMIANTE-2026-014" /></Field>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Field label="Adresse" htmlFor="address" className="md:col-span-3"><Input id="address" placeholder="12 rue des Entrepreneurs" required /></Field>
                        <Field label="Code postal" htmlFor="postal-code"><Input id="postal-code" placeholder="75001" required /></Field>
                        <Field label="Ville" htmlFor="city"><Input id="city" placeholder="Paris" required /></Field>
                        <Field label="Pays" htmlFor="country"><Input id="country" defaultValue="France" required /></Field>
                        <Field label="Consignes logistiques" htmlFor="notes" className="md:col-span-3"><Textarea id="notes" placeholder="Accès chantier, créneau de livraison, consignes de réception..." /></Field>
                      </div>
                      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4"><Checkbox id="billing-same" defaultChecked className="mt-1" /><div><Label htmlFor="billing-same" className="text-sm font-semibold">Adresse de facturation identique</Label><p className="mt-1 text-sm leading-6 text-muted-foreground">L’équipe Epicap pourra reprendre la facturation si elle dépend d’un autre siège ou d’une autre agence.</p></div></div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button asChild variant="ghost" className="justify-start rounded-full px-0"><Link href="/panier"><ArrowLeft className="mr-2 size-4" />Retour au panier</Link></Button><Button type="submit" size="lg">Continuer vers le règlement<ArrowRight className="ml-2 size-4" /></Button></div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-0">
                  <CardHeader className="border-b border-border/70 bg-muted/18"><CardTitle>Règlement et validation</CardTitle><CardDescription>Choisissez le mode de traitement adapté à votre organisation.</CardDescription></CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handlePaymentSubmit} className="space-y-8">
                      <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="gap-3">
                        <PaymentCard id="card" value="card" title="Carte bancaire" description="Traitement immédiat pour les commandes standard." icon={<CreditCard className="size-5 text-primary" />} />
                        <PaymentCard id="sepa" value="sepa" title="Virement bancaire SEPA" description="Validation commerciale puis règlement par virement." icon={<Landmark className="size-5 text-primary" />} />
                      </RadioGroup>
                      {paymentMethod === "card" ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Titulaire de la carte" htmlFor="cardholder"><Input id="cardholder" placeholder="Nom du titulaire" required /></Field>
                          <Field label="Numéro de carte" htmlFor="cardnumber"><Input id="cardnumber" placeholder="1234 5678 9012 3456" required /></Field>
                          <Field label="Expiration" htmlFor="expiry"><Input id="expiry" placeholder="MM / AA" required /></Field>
                          <Field label="CVC" htmlFor="cvc"><Input id="cvc" placeholder="123" required /></Field>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">L’équipe Epicap vous transmettra les informations bancaires et la confirmation de disponibilité après revue de votre commande.</div>
                      )}
                      <div className="rounded-2xl border border-border/70 bg-muted/20 p-4"><div className="flex items-start gap-3"><Lock className="mt-1 size-4 text-primary" /><div><p className="text-sm font-semibold">Données sécurisées</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Les informations saisies servent à la préparation et au traitement commercial de votre commande.</p></div></div></div>
                      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4"><Checkbox id="terms" defaultChecked className="mt-1" /><div><Label htmlFor="terms" className="text-sm font-semibold">Je confirme l’exactitude des informations transmises</Label><p className="mt-1 text-sm leading-6 text-muted-foreground">La commande pourra être ajustée selon disponibilité, contraintes logistiques ou produits sur devis.</p></div></div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button variant="outline" type="button" onClick={() => setStep("shipping")} className="rounded-full"><ArrowLeft className="mr-2 size-4" />Retour aux coordonnées</Button><Button type="submit" size="lg" disabled={isProcessing}>{isProcessing ? "Transmission en cours..." : "Valider la commande"}</Button></div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card className="p-0"><CardHeader className="border-b border-border/70"><CardTitle>Accompagnement Epicap</CardTitle><CardDescription>Une équipe disponible pour arbitrer entre vente, devis ou location.</CardDescription></CardHeader><CardContent className="grid gap-4 p-6 md:grid-cols-3"><SupportCard icon={<Truck className="size-5 text-primary" />} title="Logistique chantier" description="Livraison, retrait agence ou traitement spécifique selon volume et référence." /><SupportCard icon={<ShieldCheck className="size-5 text-primary" />} title="Validation technique" description="Aide au choix des références respiratoires, confinement et consommables." /><SupportCard icon={<Phone className="size-5 text-primary" />} title="Contact direct" description={companyInfo.phone} /></CardContent></Card>
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <Card className="overflow-hidden p-0">
                <div className="bg-[linear-gradient(135deg,#101114_0%,#17191d_100%)] px-6 py-6 text-background"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-background/60">Résumé checkout</p><h2 className="text-2xl font-bold">Commande en préparation</h2><p className="mt-2 text-sm leading-6 text-background/72">Montant indicatif avant confirmation Epicap.</p></div>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-4"><div className="flex items-center justify-between text-sm"><span>Seuil livraison offerte</span><span className="font-semibold">{formatPrice(FREE_SHIPPING_THRESHOLD)}</span></div><Progress value={freeShippingProgress} /><p className="text-sm text-muted-foreground">{remainingForFreeShipping > 0 ? `Encore ${formatPrice(remainingForFreeShipping)} HT pour atteindre la livraison offerte.` : "Le seuil de livraison offerte est atteint."}</p></div>
                  <div className="max-h-[340px] space-y-4 overflow-y-auto pr-1">{items.map((item) => <SummaryItem key={item.product.id} item={item} />)}</div>
                  <Separator />
                  <div className="space-y-3 text-sm"><SummaryRow label="Sous-total HT" value={formatPrice(subtotal)} /><SummaryRow label="Livraison" value={shipping === 0 ? "Offerte" : formatPrice(shipping)} valueClassName={shipping === 0 ? "text-success" : undefined} /><SummaryRow label="TVA estimée (20%)" value={formatPrice(tax)} /><Separator /><SummaryRow label="Total estimé TTC" value={formatPrice(total)} className="text-base font-semibold text-foreground" valueClassName="text-lg" /></div>
                  <Button asChild variant="ghost" className="h-auto rounded-full px-0 text-primary"><a href={`tel:${companyInfo.phone.replace(/\s+/g, "")}`}><Phone className="mr-2 size-4" />{companyInfo.phone}</a></Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Field({ label, htmlFor, className, children }: { label: string; htmlFor: string; className?: string; children: ReactNode }) {
  return <div className={className}><Label htmlFor={htmlFor}>{label}</Label><div className="mt-2">{children}</div></div>
}

function StepPill({ number, title, description, active, completed = false }: { number: number; title: string; description: string; active: boolean; completed?: boolean }) {
  return <div className={`rounded-[1.4rem] border px-5 py-4 ${active ? "border-primary/40 bg-primary/8" : completed ? "border-success/25 bg-success/6" : "border-border/70 bg-card/80"}`}><div className="flex items-center gap-3"><div className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-primary text-primary-foreground" : completed ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>{completed ? <CheckCircle2 className="size-4" /> : number}</div><div><p className="text-sm font-semibold">{title}</p><p className="text-sm text-muted-foreground">{description}</p></div></div></div>
}

function PaymentCard({ id, value, title, description, icon }: { id: string; value: string; title: string; description: string; icon: ReactNode }) {
  return <label htmlFor={id} className="flex cursor-pointer items-start gap-4 rounded-[1.35rem] border border-border/70 bg-card/80 p-4 transition-colors hover:border-primary/30 hover:bg-accent/35"><RadioGroupItem value={value} id={id} className="mt-1" /><div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12">{icon}</div><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></label>
}

function SummaryItem({ item }: { item: CartItem }) {
  return <div className="flex items-start gap-3"><div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted">{item.product.image ? <Image src={item.product.image} alt={item.product.name} fill className="object-cover" /> : <div className="absolute inset-0 bg-muted" />}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold leading-6">{item.product.name}</p><p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.product.brand} · x{item.quantity}</p></div><div className="text-right text-sm font-medium">{item.product.price > 0 ? formatPrice(item.product.price * item.quantity) : "Sur devis"}</div></div>
}

function SummaryRow({ label, value, className, valueClassName }: { label: string; value: string; className?: string; valueClassName?: string }) {
  return <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}><span className="text-muted-foreground">{label}</span><span className={valueClassName}>{value}</span></div>
}

function SupportCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="rounded-[1.3rem] border border-border/70 bg-muted/18 p-4"><div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/12">{icon}</div><p className="mb-2 text-base font-semibold">{title}</p><p className="text-sm leading-6 text-muted-foreground">{description}</p></div>
}

function SuccessCard({ title, description }: { title: string; description: string }) {
  return <div className="rounded-[1.3rem] border border-border/70 bg-muted/18 p-4"><p className="mb-2 text-base font-semibold">{title}</p><p className="text-sm leading-6 text-muted-foreground">{description}</p></div>
}
