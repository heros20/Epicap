'use client';

import { useCart } from '@/lib/cart/use-cart';
import Link from 'next/link';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
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
            <Breadcrumb className="mb-8">
              <BreadcrumbList>
                <BreadcrumbLink asChild>
                  <Link href="/">Accueil</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Panier</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="text-center py-12">
              <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
              <p className="text-muted-foreground mb-8">Commencez à ajouter des produits pour voir votre panier ici.</p>
              <Button asChild size="lg">
                <Link href="/boutique">Continuer le shopping</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

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
              <BreadcrumbPage>Panier</BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-4xl font-bold mb-8">Votre panier</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id} className="border-b">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded flex-shrink-0" />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">Réf: {item.sku}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(item.price * item.quantity).toFixed(2)}€
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

              <Button variant="ghost" asChild className="mt-4">
                <Link href="/boutique">← Continuer le shopping</Link>
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Résumé de la commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">
                      Procéder au paiement
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>

                  <Button variant="secondary" asChild className="w-full">
                    <Link href="/demande-devis">Demander un devis</Link>
                  </Button>

                  <div className="bg-muted p-4 rounded text-sm space-y-2">
                    <p className="font-medium">📦 Livraison gratuite dès 500€ HT</p>
                    <p className="text-muted-foreground">Commandes livrées sous 5 jours ouvrables</p>
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
