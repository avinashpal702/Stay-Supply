import { createContext, useContext, useEffect, useMemo, useState } from "react";
import catalog from "../data/product.json";
import { getOrderStageIndex, normalizeOrderStatus, ORDER_STATUSES, ORDER_TIMELINE } from "../data/orderTracking";

const STORAGE_KEY = "staysupply-demo-data";
const DemoDataContext = createContext(null);

function expectedDeliveryFrom(orderDate) {
  const parsedDate = new Date(orderDate);
  const baseDate = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const deliveryDate = new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate()));
  deliveryDate.setUTCDate(deliveryDate.getUTCDate() + 5);
  return deliveryDate.toISOString().slice(0, 10);
}

function normalizeOrder(order) {
  const status = normalizeOrderStatus(order.status);
  let expectedDelivery = order.expectedDelivery || expectedDeliveryFrom(order.date);
  if (!["Delivered", "Cancelled"].includes(status) && expectedDelivery < new Date().toISOString().slice(0, 10)) {
    expectedDelivery = expectedDeliveryFrom(new Date().toISOString());
  }
  return {
    ...order,
    status,
    trackingNumber: order.trackingNumber || `SS-TRK-${order.id}`,
    expectedDelivery,
  };
}

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
  propertyInventory: [
    { propertyId: "property-1", productId: "shampoo-sachet-10ml", onHand: 8, reorderAt: 12 },
    { propertyId: "property-1", productId: "bath-towel-450-gsm", onHand: 14, reorderAt: 10 },
    { propertyId: "property-1", productId: "tea-sachet-assortment", onHand: 5, reorderAt: 8 },
    { propertyId: "property-2", productId: "shampoo-sachet-10ml", onHand: 18, reorderAt: 10 },
    { propertyId: "property-2", productId: "bath-towel-450-gsm", onHand: 6, reorderAt: 10 },
    { propertyId: "property-2", productId: "glass-water-bottle-500ml", onHand: 4, reorderAt: 6 },
    { propertyId: "property-3", productId: "shampoo-bottle-30ml", onHand: 5, reorderAt: 8 },
    { propertyId: "property-3", productId: "bath-towel-600-gsm-cotton", onHand: 18, reorderAt: 10 },
    { propertyId: "property-3", productId: "garbage-bags-30l", onHand: 3, reorderAt: 8 },
  ],
  currentUser: { id: "guest-1", name: "Alex Morgan", email: "alex.morgan@example.com", propertyType: "Homestay" },
  orders: [
    { id: "SS1026", customerId: "guest-1", customer: "Alex Morgan", property: "Haveli Stay", date: "02 Nov 2026", total: 14500, status: "Confirmed", trackingNumber: "SS-TRK-SS1026", expectedDelivery: "2026-11-27", lines: [{ productId: "shampoo-bottle-30ml", quantity: 10 }, { productId: "bath-towel-600-gsm-cotton", quantity: 10 }] },
    { id: "SS1024", customerId: "guest-1", customer: "Alex Morgan", property: "Haveli Stay", date: "22 Oct 2026", total: 9770, status: "Delivered", trackingNumber: "SS-TRK-SS1024", expectedDelivery: "2026-10-27", lines: [{ productId: "shampoo-sachet-10ml", quantity: 5 }] },
    { id: "SS1021", customerId: "guest-2", customer: "Jordan Lee", property: "Pink City Loft", date: "18 Oct 2026", total: 7230, status: "Order placed", trackingNumber: "SS-TRK-SS1021", expectedDelivery: "2026-10-23", lines: [{ productId: "bath-towel-450-gsm", quantity: 9 }] },
    { id: "SS1018", customerId: "guest-3", customer: "Sam Taylor", property: "Amber Boutique", date: "08 Oct 2026", total: 12500, status: "Shipped", trackingNumber: "SS-TRK-SS1018", expectedDelivery: "2026-10-13", lines: [{ productId: "tea-sachet-assortment", quantity: 8 }] },
    { id: "SS1012", customerId: "guest-4", customer: "Riley Chen", property: "Pink City Loft", date: "01 Oct 2026", total: 4200, status: "Delivered", trackingNumber: "SS-TRK-SS1012", expectedDelivery: "2026-10-06", lines: [{ productId: "bamboo-welcome-tray", quantity: 4 }] },
  ].map(normalizeOrder),
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
      propertyInventory: Array.isArray(parsed.propertyInventory) ? parsed.propertyInventory : initialState.propertyInventory,
      orders: Array.isArray(parsed.orders) ? parsed.orders.map(normalizeOrder) : initialState.orders,
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
    setData((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId),
      propertyInventory: current.propertyInventory.filter((entry) => entry.productId !== productId),
    }));
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
    setData((current) => ({
      ...current,
      properties: current.properties.filter((property) => property.id !== propertyId),
      propertyInventory: current.propertyInventory.filter((entry) => entry.propertyId !== propertyId),
    }));
  }

  function updatePropertyInventory(propertyId, productId, updates) {
    if (!data.properties.some((property) => property.id === propertyId)) {
      throw new Error("Choose a property before updating stock.");
    }
    if (!data.products.some((product) => product.id === productId)) {
      throw new Error("The selected product is no longer available.");
    }

    const existing = data.propertyInventory.find((entry) => entry.propertyId === propertyId && entry.productId === productId);
    const product = data.products.find((entry) => entry.id === productId);
    const nextEntry = {
      propertyId,
      productId,
      onHand: updates.onHand ?? existing?.onHand ?? 0,
      reorderAt: updates.reorderAt ?? existing?.reorderAt ?? product.moq,
      updatedAt: new Date().toISOString(),
    };
    if (!Number.isInteger(nextEntry.onHand) || nextEntry.onHand < 0 || !Number.isInteger(nextEntry.reorderAt) || nextEntry.reorderAt < 0) {
      throw new Error("Stock and reorder levels must be whole numbers of zero or more.");
    }

    setData((current) => {
      const alreadyTracked = current.propertyInventory.some((entry) => entry.propertyId === propertyId && entry.productId === productId);
      return {
        ...current,
        propertyInventory: alreadyTracked
          ? current.propertyInventory.map((entry) => entry.propertyId === propertyId && entry.productId === productId ? nextEntry : entry)
          : [...current.propertyInventory, nextEntry],
      };
    });
  }

  function updateCustomer(customerId, updates) {
    setData((current) => ({ ...current, customers: current.customers.map((customer) => customer.id === customerId ? { ...customer, ...updates } : customer) }));
  }

  function updateOrder(orderId, status) {
    const normalizedStatus = normalizeOrderStatus(status);
    if (!ORDER_STATUSES.includes(normalizedStatus)) {
      throw new Error(`Unknown order status: ${status}`);
    }
    setData((current) => ({ ...current, orders: current.orders.map((order) => order.id === orderId ? { ...order, status: normalizedStatus } : order) }));
  }

  function createOrder({ customerName, customerEmail, city, propertyId, total, lines }) {
    if (
      !customerName?.trim() ||
      !customerEmail?.trim() ||
      !Number.isFinite(total) ||
      total <= 0 ||
      !Array.isArray(lines) ||
      lines.length === 0 ||
      lines.some((line) => !line || typeof line.productName !== "string" || !Number.isFinite(line.quantity) || line.quantity < 1)
    ) {
      throw new Error("Cannot create an order with incomplete checkout details.");
    }

    const now = new Date();
    const expectedDeliveryDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    expectedDeliveryDate.setUTCDate(expectedDeliveryDate.getUTCDate() + 5);
    const customer = data.customers.find((entry) => entry.email.toLowerCase() === customerEmail.trim().toLowerCase());
    const property = propertyId
      ? data.properties.find((entry) => entry.id === propertyId && entry.customerId === data.currentUser?.id)
      : null;
    if (propertyId && !property) {
      throw new Error("Choose one of your properties for this order.");
    }
    const id = `SS${Date.now()}`;
    const order = normalizeOrder({
      id,
      customerId: property?.customerId || customer?.id || data.currentUser?.id || null,
      propertyId: property?.id,
      customer: customerName.trim(),
      property: property?.name || city?.trim() || "Online order",
      date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(now),
      createdAt: now.toISOString(),
      total,
      status: "Confirmed",
      trackingNumber: `SS-TRK-${id}`,
      expectedDelivery: expectedDeliveryDate.toISOString().slice(0, 10),
      lines,
    });
    setData((current) => ({ ...current, orders: [order, ...current.orders] }));
    return order;
  }

  function submitOrderRequest(orderId, type, reason) {
    const order = data.orders.find((entry) => entry.id === orderId);
    if (!order) throw new Error("The order could not be found.");
    if (!["Cancellation", "Return"].includes(type)) throw new Error("Choose a valid request type.");
    if (!reason.trim()) throw new Error("Please tell us why you are making this request.");
    if (order.customerRequest) throw new Error("A request has already been submitted for this order.");

    const status = normalizeOrderStatus(order.status);
    const stage = getOrderStageIndex(status);
    if (type === "Cancellation" && (status === "Cancelled" || stage < 0 || stage >= ORDER_TIMELINE.indexOf("Shipped"))) {
      throw new Error("Cancellation requests are only available before an order ships.");
    }
    if (type === "Return" && status !== "Delivered") {
      throw new Error("Return requests are available after delivery.");
    }

    const customerRequest = {
      type,
      status: "Requested",
      reason: reason.trim(),
      requestedAt: new Date().toISOString(),
    };
    setData((current) => ({
      ...current,
      orders: current.orders.map((entry) => entry.id === orderId ? { ...entry, customerRequest } : entry),
    }));
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: "Sorry, we couldn't find a valid email address. Check it and try again." };
    }
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
    updatePropertyInventory,
    updateCustomer,
    updateOrder,
    createOrder,
    submitOrderRequest,
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
