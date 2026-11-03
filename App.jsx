import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Home from "./pages/Home";
import {
  AboutPage,
  BuildKitPage,
  BulkOrdersPage,
  CartPage,
  ContactPage,
  KitsPage,
  LegalPage,
  LoginPage,
  NotFoundPage,
  ProductPage,
  ShopPage,
  SignupPage,
} from "./pages/StorePages";
import CustomerDashboard, {
  CustomerOrders,
  CustomerOverview,
  CustomerProperties,
} from "./pages/CustomerDashboard";
import AdminDashboard, {
  AdminCustomers,
  AdminInventory,
  AdminOrders,
  AdminPayments,
  AdminOverview,
  AdminProducts,
} from "./pages/AdminDashboard";
import CheckoutPage from "./store/CheckoutPage";
import { useCart } from "./store/CartContext";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
}

function CartNotice() {
  const { notice } = useCart();
  return notice ? (
    <div role="status" className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#263c2d] px-5 py-3 text-sm font-semibold text-white shadow-xl">
      {notice}
    </div>
  ) : null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="min-h-[65vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:productId" element={<ProductPage />} />
          <Route path="/kits" element={<KitsPage />} />
          <Route path="/build-kit" element={<BuildKitPage />} />
          <Route path="/bulk-orders" element={<BulkOrdersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/account" element={<CustomerDashboard />}>
            <Route index element={<CustomerOverview />} />
            <Route path="properties" element={<CustomerProperties />} />
            <Route path="orders" element={<CustomerOrders />} />
          </Route>
          <Route path="/customer/*" element={<Navigate to="/account" replace />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="users" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          <Route path="/legal/:legalPage" element={<LegalPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartNotice />
    </>
  );
}
