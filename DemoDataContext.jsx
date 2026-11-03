import { createContext, useContext, useEffect, useMemo, useState } from "react";
import catalog from "../data/product.json";

const STORAGE_KEY = "staysupply-demo-data";
const DemoDataContext = createContext(null);

const initialState = {
  products: catalog.map((product, index) => ({
    ...product,
    inventory: [32, 18, 54, 28, 12, 44, 37, 21, 19, 16, 86, 24, 15, 63, 31, 42, 17, 74, 56, 88, 39, 20, 14, 33, 72, 11, 18, 91, 8][index] || 12,
    active: true,
  })),
  customers: [
    { id: "guest-1", name: "Alex Morgan", email: "alex.morgan@example.com", propertyType: "Homestay", joined: "Jan 2026", orders: 4, active: true },
    { id: "guest-2", name: "Jordan Lee", email: "jordan.lee@example.com", propertyType: "Airbnb", joined: "Feb 2026", orders: 2, active: true },
    { id: "guest-3", name: "Sam Taylor", email: "sam.taylor@example.com", propertyType: "Boutique Hotel", joined: "Mar 2026", orders: 3, active: true },
    { id: "guest-4", name: "Riley Chen", email: "riley.chen@example.com", propertyType: "Serviced Apartment", joined: "Apr 2026", orders: 1, active: true },
  ],
  properties: [
    { id: "property-1", customerId: "guest-1", name: "Haveli Stay", type: "Homestay", location: "Jaipur, Rajasthan", rooms: 8, guests: 16, status: "Active" },
    { id: "property-2", customerId: "guest-1", name: "Pink City Loft", type: "Airbnb", location: "Jaipur, Rajasthan", rooms: 2, guests: 4, status: "Active" },
    { id: "property-3", customerId: "guest-1", name: "Amber Boutique", type: "Boutique Hotel", location: "Jaipur, Rajasthan", rooms: 14, guests: 28, status: "Active" },
  ],
  currentUser: { id: "guest-1", name: "Alex Morgan", email: "alex.morgan@example.com", propertyType: "Homestay" },
  orders: [
    { id: "SS1026", customerId: "guest-1", customer: "Alex Morgan", property: "Haveli Stay", date: "02 Nov 2026", total: 14500, status: "Processing", lines: [{ productId: "shampoo-bottle-30ml", quantity: 10 }, { productId: "bath-towel-600-gsm-cotton", quantity: 10 }] },
    { id: "SS1024", customerId: "guest-1", customer: "Alex Morgan", property: "Haveli Stay", date: "22 Oct 2026", total: 9770, status: "Delivered", lines: [{ productId: "shampoo-sachet-10ml", quantity: 5 }] },
    { id: "SS1021", customerId: "guest-2", customer: "Jordan Lee", property: "Pink City Loft", date: "18 Oct 2026", total: 7230, status: "Pending", lines: [{ productId: "bath-towel-450-gsm", quantity: 9 }] },
    { id: "SS1018", customerId: "guest-3", customer: "Sam Taylor", property: "Amber Boutique", date: "08 Oct 2026", total: 12500, status: "Shipped", lines: [{ productId: "tea-sachet-assortment", quantity: 8 }] },
    { id: "SS1012", customerId: "guest-4", customer: "Riley Chen", property: "Pink City Loft", date: "01 Oct 2026", total: 4200, status: "Delivered", lines: [{ productId: "bamboo-welcome-tray", quantity: 4 }] },
  ],
  payments: [],
};

function loadInitialState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialState;
    const parsed = JSON.parse(saved);
    return {
      products: Array.isArray(parsed.products) ? parsed.products : initialState.products,
      customers: Array.isArray(parsed.customers) ? parsed.customers : initialState.customers,
      properties: Array.isArray(parsed.properties)
        ? parsed.properties.map((property) => ({ ...property, customerId: property.customerId || "guest-1" }))
        : initialState.properties,
      orders: Array.isArray(parsed.orders) ? parsed.orders : initialState.orders,
      payments: Array.isArray(parsed.payments) ? parsed.payments : initialState.payments,
      currentUser: parsed.currentUser === null || parsed.currentUser?.id
        ? parsed.currentUser
        : initialState.currentUser,
    };
  } catch (error) {
    console.error("Could not load saved StaySupply demo data.", error);
    return initialState;
  }
}

export function DemoDataProvider({ children }) {
  const [data, setData] = useState(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Could not save StaySupply demo data.", error);
    }
  }, [data]);

  function addProduct(product) {
    setData((current) => ({ ...current, products: [{ ...product, id: `item-${Date.now()}`, inventory: Number(product.inventory) || 0, active: true }, ...current.products] }));
  }

  function updateProduct(productId, updates) {
    setData((current) => ({ ...current, products: current.products.map((product) => product.id === productId ? { ...product, ...updates } : product) }));
  }

  function deleteProduct(productId) {
    setData((current) => ({ ...current, products: current.products.filter((product) => product.id !== productId) }));
  }

  function addProperty(property) {
    setData((current) => ({
      ...current,
      properties: [{ ...property, id: `property-${Date.now()}`, customerId: current.currentUser?.id, status: "Active" }, ...current.properties],
    }));
  }

  function updateProperty(propertyId, updates) {
    setData((current) => ({ ...current, properties: current.properties.map((property) => property.id === propertyId ? { ...property, ...updates } : property) }));
  }

  function deleteProperty(propertyId) {
    setData((current) => ({ ...current, properties: current.properties.filter((property) => property.id !== propertyId) }));
  }

  function updateCustomer(customerId, updates) {
    setData((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === customerId ? { ...customer, ...updates } : customer) }));
  }

  function updateOrder(orderId, status) {
    setData((current) => ({ ...current, orders: current.orders.map((order) => order.id === orderId ? { ...order, status } : order) }));
  }

  function recordPayment(payment) {
    if (!payment.paymentId || !payment.orderId || !Number.isFinite(payment.amount) || payment.amount <= 0) {
      throw new Error("Cannot save an invalid payment record.");
    }

    setData((current) => {
      if (current.payments.some((entry) => entry.paymentId === payment.paymentId)) return current;
      return {
        ...current,
        payments: [{
          paymentId: payment.paymentId,
          orderId: payment.orderId,
          amount: payment.amount,
          customerName: payment.customerName,
          customerEmail: payment.customerEmail,
          status: "Verified",
          recordedAt: new Date().toISOString(),
        }, ...current.payments],
      };
    });
  }

  function registerCustomer({ name, email, propertyType }) {
    const normalizedEmail = email.trim().toLowerCase();
    if (data.customers.some((customer) => customer.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: "An account with this email already exists. Please log in instead." };
    }

    const customer = {
      id: `guest-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      propertyType,
      joined: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date()),
      orders: 0,
      active: true,
    };

    setData((current) => ({
      ...current,
      customers: [customer, ...current.customers],
      currentUser: { id: customer.id, name: customer.name, email: customer.email, propertyType },
    }));

    return { success: true };
  }

  function isEmailRegistered(email) {
    const normalizedEmail = email.trim().toLowerCase();
    return data.customers.some((customer) => customer.email.toLowerCase() === normalizedEmail);
  }

  function signInDemo(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const customer = data.customers.find((entry) => entry.email.toLowerCase() === normalizedEmail);
    if (!customer) return { success: false, error: "We couldn't find an account with that email. Create an account to continue." };
    if (!customer.active) return { success: false, error: "This account is currently paused. Please contact StaySupply support." };

    setData((current) => ({
      ...current,
      currentUser: { id: customer.id, name: customer.name, email: customer.email, propertyType: customer.propertyType },
    }));
    return { success: true };
  }

  function signOutDemo() {
    setData((current) => ({ ...current, currentUser: null }));
  }

  const value = useMemo(() => ({
    ...data,
    addProduct,
    updateProduct,
    deleteProduct,
    addProperty,
    updateProperty,
    deleteProperty,
    updateCustomer,
    updateOrder,
    recordPayment,
    registerCustomer,
    isEmailRegistered,
    signInDemo,
    signOutDemo,
  }), [data]);

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) throw new Error("useDemoData must be used within a DemoDataProvider");
  return context;
}
