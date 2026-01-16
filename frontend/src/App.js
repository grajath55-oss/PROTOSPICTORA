import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ImageDetail from "./pages/ImageDetail";
import BulkBuy from "./pages/BulkBuy";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import MyPurchases from "./pages/MyPurchases";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Explore from "./pages/Explore";

import { Toaster } from "./components/ui/toaster";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

const BACKEND_URL = "http://localhost:8000";

/* ---------------- STRIPE CHECKOUT WRAPPER ---------------- */
const StripeCheckoutWrapper = ({ children }) => {
  const { cartItems } = useCart();
  const location = useLocation();

  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.finalPrice || item.price),
    0
  );

  useEffect(() => {
    let cancelled = false;

    const createIntent = async () => {
      if (location.pathname !== "/checkout") return;
      if (cartItems.length === 0 || totalAmount <= 0) return;

      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Math.round(totalAmount * 100), // cents
            image_ids: cartItems.map(i => i._id),
          }),
        });

        if (!res.ok) throw new Error("Payment intent failed");

        const data = await res.json();

        if (!cancelled) {
          setClientSecret(data.clientSecret);
        }
      } catch (err) {
        console.error("Stripe intent error:", err);
        setClientSecret(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    createIntent();
    return () => (cancelled = true);
  }, [location.pathname, cartItems, totalAmount]);

  // 🔥 NOT CHECKOUT → render normally
  if (location.pathname !== "/checkout") {
    return children;
  }

  // 🔥 CHECKOUT but still loading
  if (loading || !clientSecret) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading secure payment…
        </div>
      </>
    );
  }

  // ✅ READY
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      {children}
    </Elements>
  );
};

/* ---------------- APP ---------------- */
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StripeCheckoutWrapper>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/image/:id" element={<ImageDetail />} />
            <Route path="/bulk-buy" element={<BulkBuy />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>

          <Toaster />
        </StripeCheckoutWrapper>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
