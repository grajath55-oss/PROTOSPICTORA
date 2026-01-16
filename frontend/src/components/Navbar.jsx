import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Upload,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Heart,
  Sparkles,
  Compass,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { useAuth } from '../context/AuthContext';

// 🔐 CHANGE THIS TO YOUR EMAIL
const ADMIN_EMAIL = "admin@gmail.com";

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    navigate(`/explore?q=${searchQuery}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xl">SP</span>
            </div>
            <span className="text-2xl font-bold text-white">StockPics</span>
          </button>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search images..."
                className="pl-10 bg-white/5 text-white border-white/20 rounded-full"
              />
            </div>
          </form>

          {/* RIGHT */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" className="text-white" onClick={() => navigate('/explore')}>
                  <Compass className="w-4 h-4 mr-1" /> Explore
                </Button>

                <Button variant="ghost" className="text-white" onClick={() => navigate('/upload')}>
                  <Upload className="w-4 h-4 mr-1" /> Upload
                </Button>

                <Button variant="ghost" className="text-white" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="w-5 h-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarImage src={user.picture || ''} />
                        <AvatarFallback>
                          {user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="bg-black border-white/20">
                    <DropdownMenuLabel>
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>

                    {/* 🔐 ADMIN ONLY */}
                    {user.email === ADMIN_EMAIL && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate('/my-purchases')}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      My Purchases
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/explore')} className="text-white">
                  Explore
                </Button>
                <Button variant="ghost" onClick={() => navigate('/login')} className="text-white">
                  Login
                </Button>
                <Button onClick={() => navigate('/register')} className="bg-white text-black">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
