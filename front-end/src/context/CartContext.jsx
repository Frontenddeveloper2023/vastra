import { createContext, useContext, useState, useEffect } from 'react'
import arrival1 from '../assets/products/arrival-1.jpg'
import arrival2 from '../assets/products/arrival-2.jpg'
import arrival3 from '../assets/products/arrival-3.jpg'

const CartContext = createContext(null)

const INITIAL_CART = [
  {
    id: 1,
    cartItemId: 'item-init-1',
    title: 'Maroon Zari Katan Saree',
    category: 'Banarasi',
    size: 'Free Size',
    color: 'Gold',
    design: 'Zari Woven',
    material: 'Pure Katan Silk',
    weight: 850,
    price: 4999,
    originalPrice: 6999,
    image: arrival1,
    quantity: 1,
  },
  {
    id: 2,
    cartItemId: 'item-init-2',
    title: 'Festive Gold Temple Saree',
    category: 'Kanjivaram',
    size: 'Free Size',
    color: 'Crimson',
    design: 'Temple Border',
    material: 'Tanchoi Silk',
    weight: 950,
    price: 5499,
    originalPrice: 7999,
    image: arrival2,
    quantity: 1,
  },
  {
    id: 3,
    cartItemId: 'item-init-3',
    title: 'Emerald Handloom Silk Saree',
    category: 'Handloom',
    size: 'Free Size',
    color: 'Emerald',
    design: 'Floral Motifs',
    material: 'Georgette Silk',
    weight: 700,
    price: 4299,
    originalPrice: 5999,
    image: arrival3,
    quantity: 1,
  },
]

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vasraa_cart')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e)
    }
    return INITIAL_CART
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vasraa_cart', JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to storage', e)
    }
  }, [cartItems])

  // Helper to extract numeric price
  const parseNumericPrice = (p) => {
    if (typeof p === 'number') return p
    if (!p) return 0
    const num = Number(String(p).replace(/[^0-9.]/g, ''))
    return isNaN(num) ? 0 : num
  }

  // Add to cart and optionally open drawer
  const addToCart = (product, openDrawer = true, quantityToAdd = 1) => {
    const numericPrice = parseNumericPrice(product.price)
    const numericOriginal = parseNumericPrice(product.originalPrice)
    const qty = typeof quantityToAdd === 'number' && quantityToAdd > 0 ? quantityToAdd : (product.quantity || 1)
    const color = product.color || ''
    const design = product.design || ''
    const material = product.material || product.fabric || ''
    const size = product.size || 'Free Size'

    // Create a composite variant key so choosing different variants doesn't overwrite
    const variantKey = `${product.id}__${color}__${design}__${material}__${size}`

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => {
        const itemKey = item.variantKey || `${item.id}__${item.color || ''}__${item.design || ''}__${item.material || item.fabric || ''}__${item.size || 'Free Size'}`
        return itemKey === variantKey
      })

      if (existing) {
        return prevItems.map((item) => {
          const itemKey = item.variantKey || `${item.id}__${item.color || ''}__${item.design || ''}__${item.material || item.fabric || ''}__${item.size || 'Free Size'}`
          return itemKey === variantKey
            ? { ...item, quantity: item.quantity + qty }
            : item
        })
      }

      return [
        ...prevItems,
        {
          id: product.id,
          variantKey,
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: product.title,
          category: product.category || 'Luxury Saree',
          size,
          color,
          design,
          material,
          weight: Number(product.weight) || 800, // weight in grams
          price: numericPrice,
          originalPrice: numericOriginal,
          image: product.image,
          quantity: qty,
        },
      ]
    })

    if (openDrawer) {
      setIsCartOpen(true)
    }
  }

  // Update item quantity (matches either cartItemId or id)
  const updateQuantity = (keyOrId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === keyOrId || item.id === keyOrId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  // Remove single item (matches either cartItemId or id)
  const removeFromCart = (keyOrId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== keyOrId && item.id !== keyOrId))
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
  }

  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    return INITIAL_CART.map((it) => it.cartItemId || it.id)
  })

  // Keep selected items synced when cartItems changes
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const validKeys = cartItems.map((c) => c.cartItemId || c.id)
      const filtered = prev.filter((id) => validKeys.includes(id))
      // If newly added item, select it by default
      const newlyAdded = validKeys.filter((id) => !prev.includes(id))
      return [...filtered, ...newlyAdded]
    })
  }, [cartItems])

  // Toggle selection for a single product item
  const toggleItemSelection = (keyOrId) => {
    setSelectedItemIds((prev) =>
      prev.includes(keyOrId) ? prev.filter((i) => i !== keyOrId) : [...prev, keyOrId]
    )
  }

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectedItemIds.length === cartItems.length) {
      setSelectedItemIds([])
    } else {
      setSelectedItemIds(cartItems.map((c) => c.cartItemId || c.id))
    }
  }

  // Select only a specific single item for checkout
  const selectOnlyItem = (keyOrId) => {
    setSelectedItemIds([keyOrId])
  }

  // Selected items subset
  const selectedCartItems = cartItems.filter((it) => {
    const key = it.cartItemId || it.id
    return selectedItemIds.includes(key)
  })

  // Calculations for all cart vs selected cart items
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shipping = subtotal === 0 ? 0 : 0 // Free standard delivery
  const finalTotal = subtotal + shipping

  // Calculations specifically for items chosen for checkout
  const selectedTotalCount = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0)
  const selectedSubtotal = selectedCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const selectedFinalTotal = selectedSubtotal + shipping

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedItemIds,
        selectedCartItems,
        toggleItemSelection,
        toggleSelectAll,
        selectOnlyItem,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        shipping,
        finalTotal,
        selectedTotalCount,
        selectedSubtotal,
        selectedFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
