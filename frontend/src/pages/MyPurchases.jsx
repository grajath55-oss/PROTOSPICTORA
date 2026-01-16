import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";

const BACKEND_URL = "http://localhost:8000";

const MyPurchases = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const purchasesRes = await axios.get(
          `${BACKEND_URL}/api/purchases`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const purchases = purchasesRes.data || [];
        const imageIds = purchases.flatMap(p => p.image_ids || []);

        if (imageIds.length === 0) {
          setImages([]);
          setLoading(false);
          return;
        }

        const imagesRes = await axios.get(`${BACKEND_URL}/api/images`);
        const allImages = imagesRes.data.images || [];

        const purchasedImages = allImages.filter(img =>
          imageIds.includes(img._id)
        );

        setImages(purchasedImages);
      } catch (err) {
        console.error("Failed to load purchases", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading purchases...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">
        My Purchases
      </h1>

      {images.length === 0 ? (
        <p className="text-gray-400">No purchases found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img) => {
            const imageSrc = img.file_url
              ? `${BACKEND_URL}${img.file_url}`
              : img.image_url
              ? `${BACKEND_URL}${img.image_url}`
              : "";

            return (
              <div
                key={img._id}
                className="bg-white/5 rounded-xl overflow-hidden border border-white/10"
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={img.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center text-gray-400">
                    Image not available
                  </div>
                )}

                <div className="p-4">
                  <h3 className="text-white font-semibold truncate">
                    {img.title}
                  </h3>

                  <Button
                    className="mt-3 w-full bg-white text-black"
                    onClick={() =>
                      navigate(`/image/${img._id}?purchased=true`)
                    }
                  >
                    View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
