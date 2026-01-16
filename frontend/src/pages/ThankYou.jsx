import React, { useEffect } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Thank You 🎉</h1>
        <p className="text-gray-400">
          Your purchase was successful. Redirecting to home…
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate("/")}>Go Home</Button>
          <Button
            variant="outline"
            onClick={() => navigate("/my-purchases")}
            className="text-white border-white/20"
          >
            Go to My Purchases
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
