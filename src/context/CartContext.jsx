import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";

import { AuthContext } from "./AuthContext";

// =========================
//  CONFIG
// =========================
export const CartContext = createContext();

const STORAGE_KEY = "levelup:cart";
const CART_API_BASE = import.meta.env.VITE_CART_BASEURL;

if (!CART_API_BASE) {
  console.error("❌ ERROR: VITE_CART_BASEURL no está definida");
}

// Normaliza ID
const getId = (p) =>
  p?.id ??
  p?.productId ??
  p?._id ??
  p?.idProducto ??
  null;

const normalizeProduct = (p) => ({
  ...p,
  id: getId(p),
  price: Number(p?.price) || 0,
});

// Mapear DTO backend → item UI
const mapItemFromDto = (dto) => ({
  cartItemId: dto.id,
  id: dto.productId,
  productId: dto.productId,
  name: dto.name,
  price: Number(dto.price ?? 0),
  qty: dto.qty ?? 1,
  imageUrl: dto.imageUrl,
});

const mapCartResponse = (res) =>
  Array.isArray(res.items) ? res.items.map(mapItemFromDto) : [];

// =========================
//  PROVIDER
// =========================
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

  // Guardar en localStorage siempre
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // =========================
  //  LOAD CART (FIXED)
  // =========================
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

  // =========================
  //  ADD TO CART (FIX + STOCK)
  // =========================
  const addToCart = useCallback(
    async (product, qty = 1) => {
      const pid = getId(product);
      if (!pid) {
        console.warn("Producto inválido:", product);
        return;
      }

      const stock = Number(product?.stock);

      // 🔥 NO AGREGAR SI NO HAY STOCK
      if (stock <= 0) {
        console.warn("⛔ Producto sin stock:", product.name);
        return;
      }

      const current = cartItems.find((it) => it.id === pid || it.productId === pid);
      const currentQty = current?.qty || 0;
      const remaining = stock - currentQty;

      // 🔥 NO PERMITIR SUPERAR STOCK
      if (remaining <= 0) {
        console.warn("⛔ Stock agotado para:", product.name);
        return;
      }

      const toAdd = Math.min(qty, remaining);

      // Modo local si no hay usuario autenticado
      if (!user?.id) {
        setCartItems((prev) => {
          const exist = prev.find((it) => it.id === pid || it.productId === pid);
          const existQty = exist?.qty || 0;
          const remain = stock - existQty;
          if (remain <= 0) return prev;
          const addQty = Math.min(qty, remain);
          if (exist) {
            return prev.map((it) =>
              it.id === pid || it.productId === pid
                ? { ...it, qty: (it.qty || 0) + addQty }
                : it
            );
          }
          return [
            ...prev,
            { ...normalizeProduct(product), qty: addQty },
          ];
        });
        return;
      }

      // Modo backend
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
      } catch (err) {
        console.error("Error CartService (addToCart):", err);
      }
    },
    [user?.id, cartItems]
  );

  // =========================
  //  UPDATE QTY
  // =========================
  const updateQty = useCallback(
    async (productId, qty) => {
      if (!user?.id) {
        setCartItems((prev) =>
          qty <= 0
            ? prev.filter((it) => it.id !== productId)
            : prev.map((it) =>
                it.id === productId ? { ...it, qty } : it
              )
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

  // Helpers
  const increment = useCallback(
    (productId, step = 1) => {
      const item = cartItems.find((it) => it.id === productId);
      const currentQty = item?.qty || 1;
      return updateQty(productId, currentQty + step);
    },
    [cartItems, updateQty]
  );

  const decrement = useCallback(
    (productId, step = 1) => {
      const item = cartItems.find((it) => it.id === productId);
      const currentQty = item?.qty || 1;
      return updateQty(productId, currentQty - step);
    },
    [cartItems, updateQty]
  );

  // =========================
  //  REMOVE ITEM
  // =========================
  const removeFromCart = useCallback(
    async (productId) => {
      if (!user?.id) {
        setCartItems((prev) => prev.filter((it) => it.id !== productId));
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

  // =========================
  //  CLEAR CART
  // =========================
  const clearCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch(
        `${CART_API_BASE}/api/cart/${user.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Error al vaciar carrito");
      const data = await res.json();
      setCartItems(mapCartResponse(data));
    } catch (err) {
      console.error("Error CartService (clearCart):", err);
    }
  }, [user?.id]);

  // =========================
  //  CALCULOS
  // =========================
  const cartItemsCount = useMemo(
    () => cartItems.reduce((acc, it) => acc + (it.qty || 1), 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * (item.qty || 1),
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

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return ctx;
};
