import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ ADD WITH LICENSE + FINAL PRICE
  const addToCart = (item) => {
    setCartItems((prev) => {
      const exists = prev.find(
        (i) => i._id === item._id && i.license === item.license
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          ...item,
          finalPrice: Number(item.finalPrice), // ✅ STORE LICENSE PRICE
        },
      ];
    });
  };

  // ✅ REMOVE BY IMAGE + LICENSE
  const removeFromCart = (imageId, license) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item._id === imageId && item.license === license)
      )
    );
  };

  const clearCart = () => setCartItems([]);

  // ✅ TOTAL USES FINAL PRICE (NOT MOCK)
  const getCartTotal = () =>
    cartItems.reduce(
      (total, item) => total + (Number(item.finalPrice) || 0),
      0
    );

  const getCartCount = () => cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
