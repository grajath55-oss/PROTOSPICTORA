import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from '../hooks/use-toast';
import {
  ArrowLeft,
  ShoppingCart,
  Download,
  ShieldCheck,
  Briefcase,
  Globe,
} from 'lucide-react';
import { getImages } from '../services/api';
import { useCart } from '../context/CartContext';

const BACKEND_URL = 'http://localhost:8000';

const LICENSES = [
  {
    id: 'personal',
    title: 'Personal License',
    priceMultiplier: 1,
    icon: ShieldCheck,
    description:
      'Use for personal projects, social media, blogs, and non-commercial purposes.',
  },
  {
    id: 'commercial',
    title: 'Commercial License',
    priceMultiplier: 2,
    icon: Briefcase,
    description:
      'Use for business websites, ads, marketing materials, and client projects.',
  },
  {
    id: 'extended',
    title: 'Extended / LLC License',
    priceMultiplier: 4,
    icon: Globe,
    description:
      'Unlimited commercial usage including resale, SaaS, apps, and large-scale distribution.',
  },
];

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState(LICENSES[0]);
  const [isPurchased, setIsPurchased] = useState(false);

  // ---------- LOAD IMAGE ----------
  useEffect(() => {
    const loadImage = async () => {
      try {
        const res = await getImages();
        const found = res.images.find(img => img._id === id);
        setImage(found || null);
      } catch {
        setImage(null);
      } finally {
        setLoading(false);
      }
    };
    loadImage();
  }, [id]);

  // ---------- AUTO CHECK PURCHASE ----------
  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await axios.get(
          `${BACKEND_URL}/api/purchases/has-image/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsPurchased(res.data.purchased === true);
      } catch {
        setIsPurchased(false);
      }
    };

    checkPurchase();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
      </div>
    );
  }

  const imageSrc = image.file_url
    ? `${BACKEND_URL}${image.file_url}`
    : image.image_url
    ? `${BACKEND_URL}${image.image_url}`
    : '';

  const finalPrice = (
    image.price * selectedLicense.priceMultiplier
  ).toFixed(2);

  const handleAddToCart = () => {
    addToCart({
      ...image,
      license: selectedLicense.id,
      finalPrice,
    });

    toast({
      title: 'Added to Cart',
      description: `${image.title} (${selectedLicense.title})`,
    });
  };

  // ---------- DOWNLOAD ORIGINAL ----------
const handleDownloadOriginal = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(
      `${BACKEND_URL}/api/download/${image._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // IMPORTANT: This tells axios to handle binary data
      }
    );

    // Create a blob URL for the downloaded file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${image.title || 'image'}.jpg`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Clean up the blob URL
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Image download in progress',
    });
  } catch (error) {
    console.error('Download error:', error);
    toast({
      variant: "destructive",
      title: 'Download failed',
      description: error.response?.data?.detail || 'Download failed',
    });
  }
};

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img src={imageSrc} alt={image.title} className="w-full rounded-xl" />

            <h1 className="text-3xl text-white mt-6">{image.title}</h1>

            <div className="flex flex-wrap gap-2 mt-4">
              {image.tags?.map(tag => (
                <Badge key={tag} className="bg-white/10 text-white">
                  #{tag}
                </Badge>
              ))}
            </div>

            {image.description && (
              <>
                <Separator className="my-6 bg-white/20" />
                <p className="text-gray-300 leading-relaxed">
                  {image.description}
                </p>
              </>
            )}
          </div>

          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            {isPurchased ? (
              <Button
                className="w-full bg-white text-black"
                onClick={handleDownloadOriginal}
              >
                <Download className="w-5 h-5 mr-2" />
                Download Original
              </Button>
            ) : (
              <>
                <h2 className="text-xl text-white font-semibold mb-4">
                  Choose License
                </h2>

                <div className="space-y-3 mb-6">
                  {LICENSES.map(license => {
                    const Icon = license.icon;
                    const isActive = selectedLicense.id === license.id;

                    return (
                      <button
                        key={license.id}
                        onClick={() => setSelectedLicense(license)}
                        className={`w-full text-left p-4 rounded-lg border transition-all
                          ${
                            isActive
                              ? 'border-white bg-white/10'
                              : 'border-white/10 hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-6 h-6 text-white mt-1" />
                          <div>
                            <p className="text-white font-semibold">
                              {license.title}
                            </p>
                            <p className="text-sm text-gray-400">
                              {license.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Separator className="my-4 bg-white/20" />

                <div className="text-4xl text-white mb-4">
                  ${finalPrice}
                </div>

                <Button
                  className="w-full mb-3 bg-white text-black"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;
