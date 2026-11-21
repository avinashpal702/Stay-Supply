export const ORDER_TIMELINE = [
  "Order placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for delivery",
  "Delivered",
];

export const ORDER_STATUSES = [...ORDER_TIMELINE, "Cancelled"];

export function normalizeOrderStatus(status) {
  if (status === "Pending") return "Order placed";
  if (status === "Processing") return "Confirmed";
  return status;
}

export function getOrderStageIndex(status) {
  return ORDER_TIMELINE.indexOf(normalizeOrderStatus(status));
}
