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
const CART_API_BASE = import.meta.env.VITE_CART_BASEURL; // <-- CORRECTO

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

  // 🔁 helper: mapear DTO del backend → item del front
  const mapItemFromDto = (dto) => ({
    cartItemId: dto.id,          // id del item en el carrito (para PATCH/DELETE)
    id: dto.productId,           // id de producto (para tu UI)
    productId: dto.productId,
    name: dto.name,
    price: Number(dto.price ?? 0),
    qty: dto.qty ?? 1,
    imageUrl: dto.imageUrl,
  });

  const mapCartResponse = (res) =>
    Array.isArray(res.items) ? res.items.map(mapItemFromDto) : [];

  // ✅ Persistir en localStorage SIEMPRE para recordar el último estado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Helper: normaliza el id (acepta varios nombres de campo)
  const getId = (product) =>
    product?.id ??
    product?.productId ??
    product?._id ??
    product?.idProducto ??
    null;

  const normalizeProduct = (p) => ({
    ...p,
    id: getId(p),
    price: Number(p?.price) || 0,
  });

  // 📥 Cargar carrito desde el microservicio cuando hay usuario logeado
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.id) return;

      try {
        const res = await fetch(`${CART_API_BASE}/${user.id}`);
        if (!res.ok) throw new Error("Error al cargar carrito");
        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("No se pudo cargar el carrito del backend:", err);
        // si falla, se queda con lo que haya en localStorage
      }
    };

    loadCart();
  }, [user?.id]);

  // 🔹 ADD ITEM
  const addToCart = useCallback(
    async (product, qty = 1) => {
      const pid = getId(product);
      if (!pid) {
        console.warn(
          "Producto inválido (sin id/productId/_id/idProducto):",
          product
        );
        return;
      }
      const stock = Number(product?.stock);
      const findExisting = (list) => {
        const idx = list.findIndex((it) => it.id === pid);
        return { idx, current: idx >= 0 ? list[idx] : null };
      };

      // Si NO hay usuario → carrito local como antes
      if (!user?.id) {
        setCartItems((prev) => {
          const { idx, current } = findExisting(prev);
          const currentQty = current?.qty || 0;
          const remaining = Number.isFinite(stock) ? Math.max(0, stock - currentQty) : qty;
          const toAdd = Number.isFinite(stock) ? Math.min(qty, remaining) : qty;
          if (toAdd <= 0) return prev;
          if (idx >= 0) {
            const copy = [...prev];
            const nextQty = currentQty + toAdd;
            copy[idx] = { ...current, qty: nextQty };
            return copy;
          }
          const pNorm = normalizeProduct(product);
          const initialQty = Number.isFinite(stock) ? Math.min(qty, stock) : (qty > 0 ? qty : 1);
          return [
            ...prev,
            {
              ...pNorm,
              id: pid,
              qty: initialQty,
            },
          ];
        });
        return;
      }

      // Con usuario → llamar al microservicio
      try {
        const current = cartItems.find((it) => it.id === pid || it.productId === pid);
        const currentQty = current?.qty || 0;
        const remaining = Number.isFinite(stock) ? Math.max(0, stock - currentQty) : qty;
        const toAdd = Number.isFinite(stock) ? Math.min(qty, remaining) : qty;
        if (toAdd <= 0) return;
        const body = {
          productId: pid,
          name: product.name,
          price: Number(product.price) || 0,
          qty: toAdd,
          imageUrl: product.imageUrl,
        };

        const res = await fetch(`${CART_API_BASE}/${user.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Error al agregar al carrito");

        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("Error llamando a CartService (addToCart):", err);
      }
    },
    [user?.id]
  );

  // 🔹 UPDATE QTY
  const updateQty = useCallback(
    async (productId, qty) => {
      if (!user?.id) {
        // Solo local
        setCartItems((prev) => {
          if (qty <= 0) return prev.filter((it) => it.id !== productId);
          return prev.map((it) => (it.id === productId ? { ...it, qty } : it));
        });
        return;
      }

      const item = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );
      if (!item) return;
      const itemId = item.cartItemId;

      try {
        const res = await fetch(
          `${CART_API_BASE}/${user.id}/items/${itemId}`,
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
        console.error("Error llamando a CartService (updateQty):", err);
      }
    },
    [user?.id, cartItems]
  );

  // 🔹 INCREMENT / DECREMENT (wrappers de updateQty)
  const increment = useCallback(
    (productId, step = 1) => {
      const current = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );
      const currentQty = current?.qty || 1;
      return updateQty(productId, currentQty + step);
    },
    [cartItems, updateQty]
  );

  const decrement = useCallback(
    (productId, step = 1) => {
      const current = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );
      const currentQty = current?.qty || 1;
      return updateQty(productId, currentQty - step);
    },
    [cartItems, updateQty]
  );

  // 🔹 REMOVE ITEM
  const removeFromCart = useCallback(
    async (productId) => {
      if (!user?.id) {
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        return;
      }

      const item = cartItems.find(
        (it) =>
          it.id === productId ||
          it.productId === productId ||
          it.cartItemId === productId
      );
      if (!item) return;
      const itemId = item.cartItemId;

      try {
        const res = await fetch(
          `${CART_API_BASE}/${user.id}/items/${itemId}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Error al eliminar item");
        const data = await res.json();
        setCartItems(mapCartResponse(data));
      } catch (err) {
        console.error("Error llamando a CartService (removeFromCart):", err);
      }
    },
    [user?.id, cartItems]
  );

  // 🔹 CLEAR CART
  const clearCart = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch(`${CART_API_BASE}/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al vaciar carrito");
      const data = await res.json();
      setCartItems(mapCartResponse(data));
    } catch (err) {
      console.error("Error llamando a CartService (clearCart):", err);
    }
  }, [user?.id]);

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
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de un CartProvider");
  return ctx;
};