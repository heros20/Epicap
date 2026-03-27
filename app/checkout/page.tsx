'use client';

import { useCart } from '@/lib/cart/use-cart';
import Link from 'next/link';
import { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { items, getTotal } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.20;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <p className="mb-4">Votre panier est vide. <Link href="/boutique" className="text-primary">Retour au shopping</Link></p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Commande validée ! (Mode démo)');
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbLink asChild>
                <Link href="/">Accueil</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbLink asChild>
                <Link href="/panier">Panier</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbPage>Paiement</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-4xl font-bold mb-8">Finaliser la commande</h1>

          {/* Steps Indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`flex items-center gap-2 pb-4 ${step === 'shipping' ? 'border-b-2 border-primary' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
              <span>Adresse de livraison</span>
            </div>
            <div className={`flex items-center gap-2 pb-4 ${step === 'payment' ? 'border-b-2 border-primary' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
              <span>Paiement</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Form */}
            {step === 'shipping' && (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Adresse de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      {/* Contact Info */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Informations de contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="email@entreprise.fr" required />
                          </div>
                          <div>
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input id="phone" type="tel" placeholder="+33 1 23 45 67 89" required />
                          </div>
                        </div>
                      </div>

                      {/* Company Info */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Informations entreprise</h3>
                        <div>
                          <Label htmlFor="company">Raison sociale</Label>
                          <Input id="company" placeholder="Votre entreprise SARL" required />
                        </div>
                        <div>
                          <Label htmlFor="siret">SIRET</Label>
                          <Input id="siret" placeholder="12345678901234" />
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Adresse de livraison</h3>
                        <div>
                          <Label htmlFor="address">Adresse</Label>
                          <Input id="address" placeholder="123 Rue du Commerce" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">Ville</Label>
                            <Input id="city" placeholder="Paris" required />
                          </div>
                          <div>
                            <Label htmlFor="postal">Code postal</Label>
                            <Input id="postal" placeholder="75001" required />
                          </div>
                          <div>
                            <Label htmlFor="country">Pays</Label>
                            <Input id="country" value="France" disabled />
                          </div>
                        </div>
                      </div>

                      {/* Billing Address */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Checkbox id="billing-same" defaultChecked />
                          <Label htmlFor="billing-same" className="font-medium">L&apos;adresse de facturation est identique</Label>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Continuer vers le paiement
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payment Form */}
            {step === 'payment' && (
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Méthode de paiement</CardTitle>
                    <CardDescription>Tous les paiements sont sécurisés avec Stripe</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                      {/* Payment Method Selection */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Choisir un mode de paiement</h3>
                        <RadioGroup defaultValue="card">
                          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                              <div className="font-medium">Carte bancaire</div>
                              <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                            </Label>
                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer">
                            <RadioGroupItem value="sepa" id="sepa" />
                            <Label htmlFor="sepa" className="flex-1 cursor-pointer">
                              <div className="font-medium">Virement bancaire SEPA</div>
                              <div className="text-sm text-muted-foreground">Paiement par virement</div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Card Details (Demo) */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Détails de la carte</h3>
                        <div>
                          <Label htmlFor="cardholder">Titulaire de la carte</Label>
                          <Input id="cardholder" placeholder="Nom du titulaire" required />
                        </div>
                        <div>
                          <Label htmlFor="cardnumber">Numéro de carte</Label>
                          <Input id="cardnumber" placeholder="1234 5678 9012 3456" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry">Expiration</Label>
                            <Input id="expiry" placeholder="MM/YY" required />
                          </div>
                          <div>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" required />
                          </div>
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
                        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          Vos données de paiement sont sécurisées avec le protocole SSL et traitées par Stripe, leader mondial des paiements en ligne.
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setStep('shipping')} type="button">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Retour
                        </Button>
                        <Button type="submit" size="lg" className="flex-1" disabled={isProcessing}>
                          {isProcessing ? 'Traitement...' : 'Valider la commande'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{subtotal.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className={shipping === 0 ? 'text-success' : ''}>
                        {shipping === 0 ? 'Gratuite' : `${shipping.toFixed(2)}€`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA (20%)</span>
                      <span>{tax.toFixed(2)}€</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
