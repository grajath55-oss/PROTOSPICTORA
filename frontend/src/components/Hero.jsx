import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, Zap, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${searchQuery}`);
    }
  };

  const trendingSearches = ['Business', 'Technology', 'Nature', 'Food', 'Travel'];

  return (
    <div className="relative bg-black py-20 sm:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10 animate-fadeInUp">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              AI-Powered Bulk Buying Available
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            Discover & Sell
            <br />
            <span className="text-white">
              Premium Stock Photos
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            The marketplace where photographers earn and businesses find perfect images.
            Buy in bulk with AI recommendations at 20-30% discount.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search millions of royalty-free images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full border-2 border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/20 shadow-xl"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-black hover:bg-gray-200 rounded-full px-8"
              >
                Search
              </Button>
            </div>
          </form>

          {/* Trending Searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <span className="text-sm text-gray-400 font-medium">Trending:</span>
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/explore?q=${term}`)}
                className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all animate-scaleIn" style={{ animationDelay: '500ms' }}>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Upload className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload & Earn</h3>
              <p className="text-sm text-gray-400">Sell your photos and set your own prices</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all animate-scaleIn" style={{ animationDelay: '600ms' }}>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Bulk Buy</h3>
              <p className="text-sm text-gray-400">Get 1000+ images with smart AI recommendations</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all animate-scaleIn" style={{ animationDelay: '700ms' }}>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">20-30% Discount</h3>
              <p className="text-sm text-gray-400">Save big on bulk purchases for your business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;