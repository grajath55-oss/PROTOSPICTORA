import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getImages } from "../services/api";
import { Heart, Bookmark, Eye, ShoppingCart, FileText } from "lucide-react";
import { useCart } from "../context/CartContext";
import PreviewModal from "../components/PreviewModal";

const BACKEND_URL = "http://localhost:8000";

const Explore = () => {
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    getImages().then((data) => {
      setImages(data.images || []);
    });
  }, []);

  const handlePreview = (img) => {
    setPreviewImage(img);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
  };

  return (
    <>
      <div className="min-h-screen bg-black px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-6">Explore</h1>

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
                className="group relative rounded-xl overflow-hidden
                           border border-white/10 bg-white/5
                           transform transition-all duration-300 hover:scale-[1.05]"
              >
                {/* IMAGE */}
                <div
                  onClick={() => navigate(`/image/${img._id}`)}
                  className="cursor-pointer relative"
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

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* HOVER OVERLAY */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300 pointer-events-none"
                >
                  {/* TOP ACTIONS */}
                  <div className="absolute top-3 right-3 flex gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </button>

                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full"
                    >
                      <Bookmark className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* BOTTOM ACTIONS */}
                  <div className="absolute bottom-3 left-3 right-3 pointer-events-auto">
                    <div className="space-y-2">
                      <h3 className="text-white font-semibold truncate">
                        {img.title}
                      </h3>
                      <p className="text-gray-300 text-sm">${img.price}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(img);
                          }}
                          className="flex-1 flex items-center justify-center gap-1
                                     bg-white/20 hover:bg-white/30
                                     text-white text-sm py-2 rounded-md"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(img);
                          }}
                          className="flex items-center justify-center
                                     bg-white text-black hover:bg-gray-200
                                     px-3 rounded-md"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ALWAYS VISIBLE INFO */}
                <div className="p-3">
                  <h3 className="text-white font-semibold truncate">
                    {img.title}
                  </h3>
                  <p className="text-gray-300 text-sm">${img.price}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ✅ TERMS & CONDITIONS BUTTON */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => navigate("/terms")}
            className="flex items-center gap-2
                       border border-white/20 text-white
                       px-6 py-3 rounded-full
                       hover:bg-white hover:text-black
                       transition-all"
          >
            <FileText className="w-5 h-5" />
            Terms & Conditions
          </button>
        </div>
      </div>

      {previewImage && (
        <PreviewModal
          image={previewImage}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      )}
    </>
  );
};

export default Explore;
