"use client"

import * as React from "react"
import type { Product } from "@/lib/data/products"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  shipping: number
  total: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

const SHIPPING_THRESHOLD = 500 // Free shipping above 500€
const SHIPPING_COST = 15 // Flat shipping cost

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem("epicap-cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        // Invalid cart data, ignore
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage when it changes
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("epicap-cart", JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = React.useCallback((product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stockQuantity) }
            : item
        )
      }
      
      return [...prevItems, { product, quantity: Math.min(quantity, product.stockQuantity) }]
    })
  }, [])

  const removeItem = React.useCallback((productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = React.useCallback((productId: number, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stockQuantity)) }
          : item
      )
    )
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
  }, [])

  const itemCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const subtotal = React.useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  )

  const shipping = React.useMemo(
    () => (subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST),
    [subtotal]
  )

  const total = React.useMemo(() => subtotal + shipping, [subtotal, shipping])

  const value = React.useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      shipping,
      total,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, shipping, total]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
