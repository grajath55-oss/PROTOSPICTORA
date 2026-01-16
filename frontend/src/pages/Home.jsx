import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { GoogleLogin } from '@react-oauth/google';
import Hero from '../components/Hero';
import VideoCarousel from '../components/VideoCarousel';
import { Button } from '../components/ui/button';
import { categories } from '../mockData';
import { Sparkles } from 'lucide-react';

const AnimatedSection = ({ children, delay = 0 }) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-1000 ${
        inView ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem('user'); // ✅ source of truth

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (isLoggedIn) {
      navigate('/');
    }
  }, [navigate, isLoggedIn]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/explore'); // ✅ re-render happens naturally
    } catch (err) {
      console.error('Google login failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Google Sign In */}
      {!isLoggedIn && (
        <div className="flex justify-end p-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log('Google Login Failed')}
          />
        </div>
      )}

      <Hero />

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 mb-4 border border-white/10">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">
                  Experience the Platform
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                How Stock-Pics Works
              </h2>
              <p className="text-gray-400">Swipe through our features</p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <VideoCarousel />
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Browse by Category
              </h2>
              <p className="text-gray-400">
                Explore our curated collections
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories
              .filter((cat) => cat.id !== 'all')
              .map((category, index) => (
                <AnimatedSection key={category.id} delay={index * 50}>
                  <button
                    onClick={() =>
                      navigate(`/explore?category=${category.id}`)
                    }
                    className="group bg-white/5 rounded-2xl p-6 hover:bg-white/10 border border-white/10 w-full"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3">
                        <span className="text-black text-2xl">📷</span>
                      </div>
                      <h3 className="font-semibold text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {category.count} images
                      </p>
                    </div>
                  </button>
                </AnimatedSection>
              ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Selling Your Photos?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of photographers earning from their work.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/upload')}
              className="bg-white text-black px-8 py-6 text-lg font-semibold"
            >
              Start Uploading
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Home;
