import React from "react";
import { X } from "lucide-react";

const BACKEND_URL = "http://localhost:8000";

const PreviewModal = ({ image, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 
                     text-white p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Image */}
        <img
          src={`${BACKEND_URL}${image.image_url}`}
          alt={image.title}
          className="w-full h-auto max-h-[70vh] object-contain"
        />
        
        {/* Info footer */}
        <div className="bg-gray-900 p-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{image.title}</h3>
              <p className="text-gray-300">${image.price}</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold">
              Buy Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Click outside to close */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
    </div>
  );
};

export default PreviewModal;