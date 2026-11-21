import { createContext, useContext, useEffect, useMemo, useState } from "react";
import catalog from "../data/product.json";
import packs from "../data/packs.json";


const CartContext = createContext(null);
const STORAGE_KEY = "staysupply-cart";
const productsById = new Map(catalog.map((product) => [product.id, product]));
const packsById = new Map(packs.map((pack) => [`kit-${pack.id}`, pack]));

function loadCart() {
  const savedItems = window.localStorage.getItem(STORAGE_KEY);
  if (!savedItems) return [];

  try {
    const parsedItems = JSON.parse(savedItems);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Saved cart data is not a list.");
    }

    return parsedItems.map((item) => {
      if (!item || typeof item !== "object") return item;
      const product = productsById.get(item.id);
      if (product) return { ...product, quantity: item.quantity };

      const pack = packsById.get(item.id);
      if (pack) return { ...item, price: pack.price };

      if (
        typeof item.id === "string" &&
        item.id.startsWith("custom-kit-") &&
        Array.isArray(item.componentIds) &&
        item.componentIds.every((id) => productsById.has(id))
      ) {
        return {
          ...item,
          price: item.componentIds.reduce((total, id) => total + productsById.get(id).price, 0),
        };
      }

      return item;
    });
  } catch (error) {
    console.error("Could not load the saved cart.", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function addToCart(product, quantity = product.moq) {
    const safeQuantity = Math.max(product.moq, Number(quantity) || product.moq);
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + safeQuantity } : item,
        );
      }
      return [...current, { ...product, quantity: safeQuantity }];
    });
    setNotice(`${product.name} added to your cart`);
  }

  function updateQuantity(productId, quantity) {
    const product = items.find((item) => item.id === productId);
    if (!product) return;
    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity < product.moq) return;
    setItems((current) =>
      current.map((item) => (item.id === productId ? { ...item, quantity: nextQuantity } : item)),
    );
  }

  function removeFromCart(productId) {
    setItems((current) => current.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setItems([]);
  }

  const cartValue = useMemo(
    () => ({
      items,
      notice,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items, notice],
  );

  return <CartContext.Provider value={cartValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used within a CartProvider");
  return cart;
}

export function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}
