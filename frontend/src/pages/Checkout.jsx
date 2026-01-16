import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);

  // ✅ USE LICENSE PRICE IF EXISTS
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + Number(item.finalPrice || item.price),
    0
  );

  // 🔒 STRIPE NOT READY YET (IMPORTANT FIX)
  if (!stripe || !elements) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">
          Loading secure payment...
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      console.error(result.error.message);
      setLoading(false);
      return;
    }

    // ✅ PAYMENT SUCCESS
    clearCart();
    navigate("/thank-you");
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-6">
          Secure Checkout
        </h1>

        <Card className="bg-white/5 border border-white/10">
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <PaymentElement />

              <div className="flex justify-between text-white text-lg">
                <span>Total</span>
                <span className="font-semibold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-6 text-lg"
              >
                {loading
                  ? "Processing Payment..."
                  : `Pay $${totalAmount.toFixed(2)}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
