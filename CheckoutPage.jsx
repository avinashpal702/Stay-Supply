
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PaymentButton from "../components/PaymentButton";
import { formatPrice, useCart } from "./CartContext";
import { useDemoData } from "./DemoDataContext";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems, subtotal, clearCart } = useCart();
  const { recordPayment } = useDemoData();

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [formError, setFormError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);

  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const updateCustomer = (event) => {
    const { name, value } = event.target;

    setCustomer((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateDetails = () => {
    if (
      !customer.name.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.city.trim() ||
      !customer.pincode.trim()
    ) {
      setFormError("Please complete all delivery details.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }

    if (!/^\d{10}$/.test(customer.phone)) {
      setFormError("Enter a valid 10-digit Indian mobile number.");
      return false;
    }

    if (!/^\d{6}$/.test(customer.pincode)) {
      setFormError("Enter a valid 6-digit PIN code.");
      return false;
    }

    if (cartItems.length === 0 || total <= 0) {
      setFormError("Your cart is empty. Please add products first.");
      return false;
    }

    setFormError("");
    return true;
  };

  if (paymentDetails) {
    return (
      <main className="checkout-page">
        <section className="checkout-success">
          <div className="checkout-success-icon">✓</div>
          <h1>Payment Verified</h1>
          <p>
            Your payment was verified successfully. Save these references for
            future enquiries.
          </p>
          <p>
            <strong>Payment ID:</strong> {paymentDetails.paymentId}
          </p>
          <p>
            <strong>Order ID:</strong> {paymentDetails.orderId}
          </p>
          <button
            type="button"
            className="checkout-primary-button"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <button
            type="button"
            className="checkout-back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <p className="checkout-brand">StaySupply</p>
          <h1>Checkout</h1>
          <p>Complete your delivery details to continue.</p>
        </header>

        {cartItems.length === 0 ? (
          <section className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add products to your cart before proceeding to checkout.</p>
            <button
              type="button"
              className="checkout-primary-button"
              onClick={() => navigate("/")}
            >
              Browse Products
            </button>
          </section>
        ) : (
          <div className="checkout-layout">
            <section className="checkout-card">
              <h2>Delivery Information</h2>

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  if (validateDetails()) {
                    document
                      .getElementById("checkout-payment")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <div className="checkout-form-grid">
                  <div className="checkout-field checkout-full-width">
                    <label htmlFor="customer-name">Full Name</label>
                    <input
                      id="customer-name"
                      name="name"
                      value={customer.name}
                      onChange={updateCustomer}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="checkout-field checkout-full-width">
                    <label htmlFor="customer-email">Email Address</label>
                    <input
                      id="customer-email"
                      name="email"
                      type="email"
                      value={customer.email}
                      onChange={updateCustomer}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="checkout-field checkout-full-width">
                    <label htmlFor="customer-phone">Mobile Number</label>
                    <input
                      id="customer-phone"
                      name="phone"
                      type="tel"
                      value={customer.phone}
                      onChange={updateCustomer}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div className="checkout-field checkout-full-width">
                    <label htmlFor="customer-address">Street Address</label>
                    <textarea
                      id="customer-address"
                      name="address"
                      value={customer.address}
                      onChange={updateCustomer}
                      placeholder="House number, street, area"
                      autoComplete="street-address"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="customer-city">City</label>
                    <input
                      id="customer-city"
                      name="city"
                      value={customer.city}
                      onChange={updateCustomer}
                      placeholder="City"
                      autoComplete="address-level2"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="customer-pincode">PIN Code</label>
                    <input
                      id="customer-pincode"
                      name="pincode"
                      value={customer.pincode}
                      onChange={updateCustomer}
                      placeholder="6-digit PIN code"
                      inputMode="numeric"
                      maxLength={6}
                      autoComplete="postal-code"
                      required
                    />
                  </div>
                </div>

                {formError && (
                  <p className="checkout-error" role="alert">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="checkout-secondary-button"
                >
                  Validate Delivery Details
                </button>
              </form>
            </section>

            <aside className="checkout-card checkout-order-card">
              <h2>Order Summary</h2>

              <div className="checkout-items">
                {cartItems.map((item, index) => {
                  const name =
                    item.title ?? item.name ?? item.productName ?? "Product";
                  const price = Number(item.price ?? item.amount ?? 0);
                  const quantity = Number(item.quantity ?? 1);

                  return (
                    <div
                      className="checkout-product"
                      key={item._id ?? item.id ?? `${name}-${index}`}
                    >
                      <div>
                        <p className="checkout-product-name">{name}</p>
                        <p className="checkout-muted">
                          Qty: {quantity}
                        </p>
                      </div>
                      <strong>
                        {formatPrice(price * quantity)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-total-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="checkout-total-row">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>

              <div className="checkout-total-row checkout-grand-total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div id="checkout-payment">
                <h3>Payment Method</h3>
                <p className="checkout-muted">
                  Pay securely through Razorpay.
                </p>

                <PaymentButton
                  amountInRupees={total}
                  cartItems={cartItems}
                  customerName={customer.name}
                  customerEmail={customer.email}
                  customerPhone={customer.phone}
                  customerAddress={customer.address}
                  customerCity={customer.city}
                  customerPincode={customer.pincode}
                  onBeforePayment={validateDetails}
                  onPaymentSuccess={(payment) => {
                    recordPayment({
                      ...payment,
                      amount: total,
                      customerName: customer.name,
                      customerEmail: customer.email,
                    });
                    setPaymentDetails(payment);
                    clearCart();
                  }}
                />
              </div>

              <p className="checkout-security-note">
                Your payment will be processed through Razorpay.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
