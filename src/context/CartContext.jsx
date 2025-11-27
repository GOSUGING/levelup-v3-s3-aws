import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";

export const CartContext = createContext();

const STORAGE_KEY = "levelup:cart";
const CART_API_BASE = import.meta.env.VITE_CART_BASEURL;

// Normalizar ID
const getId = (p) =>
  p?.id ?? p?.productId ?? p?._id ?? p?.idProducto ?? null;

const normalizeProduct = (p) => ({
  ...p,
  id: getId(p),
  price: Number(p?.price) || 0,
});

// DTO → item UI
const mapItemFromDto = (dto) => ({
  cartItemId: dto.id,
  id: dto.productId,
  productId: dto.productId,
  name: dto.name,
  price: Number(dto.price ?? 0),
  qty: dto.qty ?? 1,
  imageUrl: dto.imageUrl,
  stock: Number(dto.stock ?? dto.available ?? dto.maxStock ?? 0),
});

const mapCartResponse = (res) =>
  Array.isArray(res.items) ? res.items.map(mapItemFromDto) : [];

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext) || { user: null };

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Guardar carrito local
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Cargar carrito backend
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`${CART_API_BASE}/api/cart/${user.id}`);
        if (!res.ok) throw new Error("Error al cargar carrito");
        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("No se pudo cargar el carrito del backend:", err);
      }
    };

    loadCart();
  }, [user?.id]);

  // =====================================================
  // ADD TO CART — con stock REAL corregido
  // =====================================================
  const addToCart = useCallback(
    async (product, qty = 1) => {
      const pid = getId(product);
      if (!pid) {
        toast.error("Producto inválido");
        return;
      }

      // STOCK REAL
      const stock = Number(product?.stock ?? 0);

      // ❌ SIN STOCK
      if (stock <= 0) {
        toast.error("❌ Este producto no tiene stock disponible.");
        return;
      }

      const current = cartItems.find(
        (it) => it.id === pid || it.productId === pid
      );

      const currentQty = current?.qty ?? 0;
      const remaining = stock - currentQty;

      // ❌ NO QUEDA STOCK
      if (remaining <= 0) {
        toast.warn("⚠ Ya agregaste todo el stock disponible.");
        return;
      }

      const toAdd = Math.min(qty, remaining);

      // =====================================================
      // MODO LOCAL
      // =====================================================
      if (!user?.id) {
        setCartItems((prev) => {
          if (current) {
            toast.success("🛒 Cantidad aumentada");
            return prev.map((it) =>
              it.id === pid ? { ...it, qty: it.qty + toAdd } : it
            );
          }

          toast.success("🛒 Producto agregado al carrito");
          return [...prev, { ...normalizeProduct(product), qty: toAdd }];
        });
        return;
      }

      // =====================================================
      // MODO BACKEND
      // =====================================================
      try {
        const body = {
          productId: pid,
          name: product.name,
          price: Number(product.price) || 0,
          qty: toAdd,
          imageUrl: product.imageUrl,
        };

        const res = await fetch(
          `${CART_API_BASE}/api/cart/${user.id}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );

        if (!res.ok) throw new Error("Error al agregar al carrito");

        const data = await res.json();
        setCartItems(mapCartResponse(data));
        toast.success("🛒 Producto agregado");
      } catch (err) {
        console.error("Error CartService (addToCart):", err);
        toast.error("❌ Error al agregar al carrito.");
      }
    },
    [user?.id, cartItems]
  );

  // =====================================================
  // UPDATE QTY
  // =====================================================
  const updateQty = useCallback(
    async (productId, qty) => {
      const item = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );

      if (!item) return;

      // ❌ STOCK MÁXIMO
      const maxStock = Number(item.stock ?? 0);
      if (qty > maxStock) {
        toast.warn("⚠ No puedes superar el stock disponible.");
        return;
      }

      // ❌ NO PERMITIR BAJAR DE 1
      if (qty <= 0) {
        return removeFromCart(productId);
      }

      // MODO LOCAL
      if (!user?.id) {
        setCartItems((prev) =>
          prev.map((it) =>
            it.id === productId ? { ...it, qty } : it
          )
        );
        return;
      }

      // BACKEND
      try {
        const res = await fetch(
          `${CART_API_BASE}/api/cart/${user.id}/items/${item.cartItemId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ qty }),
          }
        );

        if (!res.ok) throw new Error("Error al actualizar cantidad");
        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("Error CartService (updateQty):", err);
      }
    },
    [user?.id, cartItems]
  );

  const increment = useCallback(
    (productId) => {
      const item = cartItems.find((it) => it.id === productId);
      if (!item) return;

      const maxStock = Number(item.stock ?? 0);

      if (item.qty >= maxStock) {
        toast.warn("⚠ No puedes agregar más de lo disponible.");
        return;
      }

      return updateQty(productId, item.qty + 1);
    },
    [cartItems, updateQty]
  );

  const decrement = useCallback(
    (productId) => {
      const item = cartItems.find((it) => it.id === productId);
      if (!item) return;
      return updateQty(productId, item.qty - 1);
    },
    [cartItems, updateQty]
  );

  // =====================================================
  // REMOVE ITEM
  // =====================================================
  const removeFromCart = useCallback(
    async (productId) => {
      if (!user?.id) {
        setCartItems((prev) =>
          prev.filter((it) => it.id !== productId)
        );
        return;
      }

      const item = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );
      if (!item) return;

      try {
        const res = await fetch(
          `${CART_API_BASE}/api/cart/${user.id}/items/${item.cartItemId}`,
          { method: "DELETE" }
        );

        if (!res.ok) throw new Error("Error al eliminar item");
        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("Error CartService (removeFromCart):", err);
      }
    },
    [user?.id, cartItems]
  );

  // =====================================================
  // CLEAR CART
  // =====================================================
  const clearCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch(`${CART_API_BASE}/api/cart/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al vaciar carrito");
      const data = await res.json();
      setCartItems(mapCartResponse(data));
    } catch (err) {
      console.error("Error CartService (clearCart):", err);
    }
  }, [user?.id]);

  // =====================================================
  // CÁLCULOS
  // =====================================================
  const cartItemsCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + (it.qty || 1), 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (item.qty || 1),
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQty,
      increment,
      decrement,
      removeFromCart,
      clearCart,
      cartCount: cartItems.length,
      cartItemsCount,
      cartTotal: cartSubtotal,
      cartSubtotal,
    }),
    [
      cartItems,
      addToCart,
      updateQty,
      increment,
      decrement,
      removeFromCart,
      clearCart,
      cartItemsCount,
      cartSubtotal,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return ctx;
};
