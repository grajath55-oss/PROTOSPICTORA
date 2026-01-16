import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useCart } from "../context/CartContext";

const BACKEND_URL = "http://localhost:8000";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, clearCart } = useCart();

  // ✅ USE finalPrice, NOT price
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (Number(item.finalPrice) || 0),
    0
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-400 mb-6">
            Browse images and add them to your cart
          </p>
          <Button
            onClick={() => navigate("/explore")}
            className="bg-white text-black"
          >
            Browse Images
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">
          Your Cart
        </h1>

        <div className="space-y-4">
          {cartItems.map((item) => {
            const imageSrc = item.file_url
              ? `${BACKEND_URL}${item.file_url}`
              : item.image_url
              ? `${BACKEND_URL}${item.image_url}`
              : "";

            return (
              <Card
                key={`${item._id}-${item.license}`}
                className="bg-white/5 border border-white/10"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="w-20 h-16 object-cover rounded-md"
                    />
                    <div>
                      <h3 className="text-white font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {item.license.toUpperCase()} License
                      </p>
                      <p className="text-sm text-gray-300">
                        ${item.finalPrice}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeFromCart(item._id, item.license)
                    }
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-white font-semibold">
              Total
            </span>
            <span className="text-2xl font-bold text-white">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 border-white/20 text-white"
              onClick={clearCart}
            >
              Clear Cart
            </Button>

            <Button
              className="flex-1 bg-white text-black"
              onClick={() => navigate("/checkout")}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
