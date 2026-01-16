import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Button } from './ui/button';

const VideoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [direction, setDirection] = useState('next');

  const videos = [
    {
      id: 1,
      title: 'Upload & Earn',
      description: 'Share your creativity with millions of buyers',
      thumbnail: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg',
    },
    {
      id: 2,
      title: 'AI-Powered Bulk Buy',
      description: 'Get 1000+ images with smart recommendations',
      thumbnail: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    },
    {
      id: 3,
      title: 'Premium Quality',
      description: 'Curated collection of high-resolution images',
      thumbnail: 'https://images.pexels.com/photos/2325447/pexels-photo-2325447.jpeg',
    },
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDirection('next');
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, videos.length]);

  const handlePrevious = () => {
    setDirection('prev');
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleNext = () => {
    setDirection('next');
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-3xl shadow-2xl group border border-white/10">
      {/* Video Slides */}
      <div className="relative w-full h-full">
        {videos.map((video, index) => {
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + videos.length) % videos.length;
          const isNext = index === (currentIndex + 1) % videos.length;

          let transformClass = 'translate-x-full opacity-0';
          if (isActive) {
            transformClass = 'translate-x-0 opacity-100 scale-100';
          } else if (isPrev) {
            transformClass = 'translate-x-[-100%] opacity-0 scale-95';
          } else if (isNext) {
            transformClass = 'translate-x-full opacity-0 scale-95';
          }

          return (
            <div
              key={video.id}
              className={`absolute inset-0 transition-all duration-700 ease-out transform ${
                transformClass
              }`}
            >
              {/* Background Image with Overlay */}
              <div className="relative w-full h-full">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-black/70"
                ></div>

                {/* Content */}
                <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                  <div
                    className={`transform transition-all duration-700 delay-300 ${
                      isActive
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <h2 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
                      {video.title}
                    </h2>
                    <p className="text-xl text-gray-300 drop-shadow-lg">
                      {video.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Play/Pause Control */}
      <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 'next' : 'prev');
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel;
