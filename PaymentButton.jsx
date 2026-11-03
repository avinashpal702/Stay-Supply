import { useState } from "react";
import { formatPrice } from "../store/CartContext";

let checkoutScriptPromise;

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!checkoutScriptPromise) {
    checkoutScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => {
        checkoutScriptPromise = null;
        reject(new Error("Could not load Razorpay checkout. Check your internet connection and try again."));
      };
      document.body.appendChild(script);
    });
  }
  return checkoutScriptPromise;
}

async function postPayment(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "The payment request could not be completed.");
  return result;
}

export default function PaymentButton({
  amountInRupees,
  cartItems,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCity,
  customerPincode,
  onBeforePayment,
  onPaymentSuccess,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  async function startPayment() {
    setError("");
    if (!onBeforePayment()) return;

    setIsProcessing(true);
    try {
      await loadRazorpayCheckout();
      const order = await postPayment("/api/payment/create-order", {
        items: cartItems.map(({ id, quantity, componentIds }) => ({
          id,
          quantity,
          ...(componentIds ? { componentIds } : {}),
        })),
        customer: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
          address: customerAddress,
          city: customerCity,
          pincode: customerPincode,
        },
      });
      if (order.amount !== Math.round(amountInRupees * 100)) {
        throw new Error("Cart prices changed. Reload the cart to see the current total before paying.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "StaySupply",
        description: "Cart payment",
        order_id: order.orderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: "#36523e" },
        handler: async (paymentResponse) => {
          try {
            const verification = await postPayment("/api/payment/verify", paymentResponse);
            if (!verification.verified) {
              throw new Error(verification.error || "Payment could not be verified.");
            }
            onPaymentSuccess(verification);
          } catch (verificationError) {
            setError(verificationError.message);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      });

      checkout.on("payment.failed", (paymentResponse) => {
        setError(paymentResponse.error?.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });
      checkout.open();
    } catch (paymentError) {
      setError(paymentError.message);
      setIsProcessing(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="checkout-primary-button"
        onClick={startPayment}
        disabled={isProcessing || amountInRupees <= 0}
      >
        {isProcessing ? "Preparing secure payment..." : `Pay ${formatPrice(amountInRupees)} securely`}
      </button>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </>
  );
}
