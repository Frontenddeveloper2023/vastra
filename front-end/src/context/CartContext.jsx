import { createContext, useContext, useState, useEffect } from 'react'
import notify from '../utils/toast'
import productService from '../services/productService'
import { getSocket } from '../services/socket'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'vasraa_cart'
const SELECTED_STORAGE_KEY = 'vasraa_cart_selected_ids'

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e)
    }
    return []
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  // Cache of product live data for stock verification { [productId]: productDoc }
  const [productStockMap, setProductStockMap] = useState({})

  // Fetch / refresh stock for products in the cart
  const refreshCartStock = async () => {
    try {
      const productIds = Array.from(
        new Set(cartItems.map((item) => item.productId || item.id).filter(Boolean))
      )
      if (productIds.length === 0) return

      const fetched = await Promise.all(
        productIds.map(async (pId) => {
          try {
            const data = await productService.getById(pId)
            return data ? { [pId]: data } : null
          } catch {
            return null
          }
        })
      )

      const merged = {}
      fetched.forEach((f) => {
        if (f) Object.assign(merged, f)
      })
      setProductStockMap((prev) => ({ ...prev, ...merged }))
    } catch {
      // ignore
    }
  }

  // Refresh cart stock on mount, when cart items change, and when drawer opens
  useEffect(() => {
    refreshCartStock()
  }, [cartItems.length, isCartOpen])

  // Listen to live WebSocket stock updates
  useEffect(() => {
    const socket = getSocket()
    const handleStockUpdate = () => {
      refreshCartStock()
    }
    socket.on('stock:updated', handleStockUpdate)
    return () => {
      socket.off('stock:updated', handleStockUpdate)
    }
  }, [])

  // Helper to get max available stock for a cart item
  const getItemMaxStock = (item) => {
    if (!item) return 99
    // 1. If stock was explicitly stored with item
    let stockLimit = item.stock !== undefined ? Number(item.stock) : null

    // 2. Check fresh live product document from productStockMap
    const prod = productStockMap[item.productId || item.id]
    if (prod) {
      if (Array.isArray(prod.variants) && prod.variants.length > 0) {
        // match by variantId
        let v = null
        if (item.variantId) {
          v = prod.variants.find((vr) => String(vr._id || vr.id) === String(item.variantId))
        }
        // match by attributes fallback
        if (!v) {
          v = prod.variants.find((vr) => {
            const matchColor = item.color ? (vr.color || '').toLowerCase() === item.color.toLowerCase() : true
            const matchDesign = item.design ? (vr.design || '').toLowerCase() === item.design.toLowerCase() : true
            const matchMaterial = item.material ? (vr.material || '').toLowerCase() === item.material.toLowerCase() : true
            return matchColor && matchDesign && matchMaterial
          }) || prod.variants[0]
        }
        if (v && v.stock !== undefined) {
          stockLimit = Number(v.stock)
        }
      } else if (prod.totalStock !== undefined) {
        stockLimit = Number(prod.totalStock)
      }
    }

    return stockLimit !== null && !isNaN(stockLimit) ? Math.max(0, stockLimit) : 99
  }

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to storage', e)
    }
  }, [cartItems])

  // Selected item IDs: default to selecting ALL cart items
  const [selectedItemIds, setSelectedItemIds] = useState(() => {
    try {
      const saved = localStorage.getItem(SELECTED_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.error('Failed to load selected cart items from storage', e)
    }
    // Default to all items selected
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart)) {
          return parsedCart.map((c) => c.cartItemId || c.id)
        }
      }
    } catch {}
    return []
  })

  // Persist selected IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(selectedItemIds))
    } catch (e) {
      console.error('Failed to save selected cart items to storage', e)
    }
  }, [selectedItemIds])

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
    const variantId = product.variantId || ''
    const variantKey = `${product.id}__${variantId}__${color}__${design}__${material}__${size}`

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => {
        const itemKey = item.variantKey || `${item.id}__${item.variantId || ''}__${item.color || ''}__${item.design || ''}__${item.material || item.fabric || ''}__${item.size || 'Free Size'}`
        return itemKey === variantKey
      })

      if (existing) {
        return prevItems.map((item) => {
          const itemKey = item.variantKey || `${item.id}__${item.variantId || ''}__${item.color || ''}__${item.design || ''}__${item.material || item.fabric || ''}__${item.size || 'Free Size'}`
          return itemKey === variantKey
            ? { ...item, quantity: item.quantity + qty }
            : item
        })
      }

      const newCartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      // Automatically ensure newly added item is selected by default
      setSelectedItemIds((prev) => Array.from(new Set([...prev, newCartItemId])))

      return [
        ...prevItems,
        {
          id: product.id,
          productId: product.productId || product.id,
          variantId: product.variantId || null,
          variantIndex: product.variantIndex !== undefined ? product.variantIndex : null,
          variantKey,
          cartItemId: newCartItemId,
          title: product.title,
          category: product.category || 'Luxury Saree',
          size,
          color,
          design,
          material,
          stock: product.stock !== undefined ? Number(product.stock) : undefined,
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

  // Update item quantity (matches either cartItemId or id) with strict maxStock check
  const updateQuantity = (keyOrId, delta) => {
    setCartItems((prev) => {
      let limitAlertTriggered = false

      const updated = prev.map((item) => {
        if (item.cartItemId === keyOrId || item.id === keyOrId) {
          const currentStockLimit = getItemMaxStock(item)
          const newQty = item.quantity + delta

          if (delta > 0 && currentStockLimit > 0 && newQty > currentStockLimit) {
            limitAlertTriggered = true
            return item
          }

          return newQty > 0 ? { ...item, quantity: newQty } : null
        }
        return item
      }).filter(Boolean)

      if (limitAlertTriggered) {
        notify.error(`Only available stock can be added to cart.`, { id: 'cart-stock-limit' })
      }

      return updated
    })
  }

  // Remove single item (matches either cartItemId or id)
  const removeFromCart = (keyOrId) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== keyOrId && item.id !== keyOrId))
    setSelectedItemIds((prev) => prev.filter((id) => id !== keyOrId))
  }

  // Clear cart
  const clearCart = () => {
    setCartItems([])
    setSelectedItemIds([])
  }

  // Keep selected items synced: if no items are explicitly selected or newly loaded, default to all items selected
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const validKeys = cartItems.map((c) => c.cartItemId || c.id)
      const validExisting = prev.filter((id) => validKeys.includes(id))
      // If nothing selected but cart has items, select all by default
      if (validExisting.length === 0 && validKeys.length > 0) {
        return validKeys
      }
      return validExisting
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
        getItemMaxStock,
        refreshCartStock,
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
