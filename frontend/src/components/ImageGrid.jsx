import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Download, Eye, User } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

const ImageCard = ({ image }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="group relative bg-white/5 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/image/${image._id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image.file_url}
          alt={image.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Badge className="bg-white text-black">${image.price}</Badge>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart
                className={`w-4 h-4 ${
                  isLiked ? 'text-black fill-black' : 'text-black'
                }`}
              />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold mb-2 truncate">
              {image.title}
            </h3>

            <div className="flex items-center justify-between text-white/90 text-sm">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{image.downloads || 0}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-4 h-4" />
                  <span>{image.likes || 0}</span>
                </span>
              </div>

              <Button
                size="sm"
                className="bg-white text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/image/${image._id}`);
                }}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Photographer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-white/10">
            <AvatarFallback className="text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-white">
              {image.photographer_name || 'Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageGrid = ({ images, loading = false }) => {
  if (loading) return null;

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        No images found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <ImageCard key={image._id} image={image} />
      ))}
    </div>
  );
};

export default ImageGrid;
