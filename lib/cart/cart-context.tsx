"use client"

import * as React from "react"

import { safeTrack } from "@/lib/analytics/events"
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

function getMaxAllowedQuantity(product: Pick<Product, "stockQuantity">) {
  return product.stockQuantity >= 999 ? 999 : Math.max(product.stockQuantity, 1)
}

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
    const maxAllowedQuantity = getMaxAllowedQuantity(product)
    const nextQuantity = Math.max(1, Math.min(quantity, maxAllowedQuantity))

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product.id === product.id)

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + nextQuantity, maxAllowedQuantity),
              }
            : item
        )
      }

      return [...prevItems, { product, quantity: nextQuantity }]
    })

    safeTrack("Add To Cart", {
      product_id: product.id,
      product_name: product.name,
      product_category: product.categorySlug,
      product_brand: product.brand,
      unit_price: product.price,
      quantity: nextQuantity,
    })
  }, [])

  const removeItem = React.useCallback((productId: number) => {
    setItems((prevItems) => {
      const removedItem = prevItems.find((item) => item.product.id === productId)

      if (removedItem) {
        safeTrack("Remove From Cart", {
          product_id: removedItem.product.id,
          product_name: removedItem.product.name,
          quantity: removedItem.quantity,
        })
      }

      return prevItems.filter((item) => item.product.id !== productId)
    })
  }, [])

  const updateQuantity = React.useCallback((productId: number, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, getMaxAllowedQuantity(item.product))),
            }
          : item
      )
    )

    safeTrack("Cart Quantity Updated", {
      product_id: productId,
      quantity: Math.max(quantity, 1),
    })
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
    safeTrack("Cart Cleared")
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
