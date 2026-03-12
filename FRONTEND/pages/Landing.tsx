
import React from 'react';
import { ShieldCheck, Video, UserCheck, Wallet, ArrowRight, Zap, MapPin, Search } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  return (
    <div className="w-full bg-[#F6F6F6] text-[#212121] flex flex-col">
      {/* Navbar */}
      <nav className="w-full sticky top-0 bg-[#F6F6F6]/80 backdrop-blur-xl z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#093E28] p-2 rounded-xl">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <span className="text-lg sm:text-xl font-black tracking-tighter">AroundU</span>
          </div>
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900">How it Works</a>
            <a href="#categories" className="hover:text-slate-900">Categories</a>
            <a href="#trust" className="hover:text-slate-900">Our Promise</a>
          </div>
          <button
            onClick={onLogin}
            className="bg-[#093E28] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            Explore Network
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="w-full bg-gradient-to-b from-[#E7EDE4] to-[#F6F6F6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32 grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter text-slate-900 leading-tight mb-4 sm:mb-6">
              Access Everything, <span className="hero-gradient-text">Locally.</span>
            </h1>
            <p className="max-w-md mx-auto md:mx-0 text-sm sm:text-base lg:text-lg text-slate-600 mb-6 sm:mb-8 lg:mb-10">
              Unlock a neighborhood of shared resources. Rent anything you need from trusted people nearby, secured by a revolutionary trust protocol.
            </p>
            <div className="flex justify-center md:justify-start gap-4">
              <button
                onClick={onLogin}
                className="bg-[#FF7A59] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:opacity-90 transition-opacity active:scale-95 shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                Start Exploring <ArrowRight size={20} />
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
             <div className="relative w-[350px] sm:w-[400px] lg:w-[450px] h-[350px] sm:h-[400px] lg:h-[450px]">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50" />
                <div className="absolute w-56 sm:w-64 lg:w-72 h-32 sm:h-36 lg:h-40 bg-white rounded-3xl soft-shadow top-1/4 left-0 p-3 sm:p-4 transform -rotate-12 transition-all hover:rotate-[-15deg] hover:scale-105">
                  <p className="text-xs sm:text-sm font-bold text-slate-400">Now Renting</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mt-1 sm:mt-2">Professional Camera</p>
                  <div className="flex items-center gap-2 mt-2 sm:mt-4">
                     <img src="https://picsum.photos/seed/alex/40" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" alt="user"/>
                     <span className="text-xs sm:text-sm font-semibold text-slate-600">from R G</span>
                  </div>
                </div>
                <div className="absolute w-48 sm:w-56 lg:w-64 h-28 sm:h-32 lg:h-36 bg-white rounded-3xl soft-shadow bottom-1/4 right-0 p-3 sm:p-4 transform rotate-12 transition-all hover:rotate-[15deg] hover:scale-105">
                  <p className="text-xs sm:text-sm font-bold text-slate-400">New Listing</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 mt-1 sm:mt-2">Camping Tent</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2 text-green-700 text-sm font-bold">
                     <MapPin size={12} className="sm:size-14"/> SoHo Junction
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3 sm:mb-4">A Safer Way to Share</h2>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto mb-12 sm:mb-16">Our trust-first system ensures every transaction is secure, transparent, and simple.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard icon={<Search />} title="Discover Locally" description="Find what you need, right in your neighborhood, from tools to tech." />
            <FeatureCard icon={<Video />} title="Verify Securely" description="Live video and OTP handshakes mean you know exactly what you're getting." />
            <FeatureCard icon={<ShieldCheck />} title="Transact with Trust" description="Smart escrow holds payment until both parties confirm a successful return." />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 sm:py-20 lg:py-28 bg-[#E7EDE4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-center mb-12 sm:mb-16">Explore the Neighborhood Inventory</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <CategoryCard name="Electronics" image="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=60&w=400" />
            <CategoryCard name="Tools" image="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=60&w=400" />
            <CategoryCard name="Camping" image="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=60&w=400" />
            <CategoryCard name="Vehicles" image="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=60&w=400" />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
           <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-3 sm:mb-4">Built on a Foundation of Trust</h2>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg mb-12 sm:mb-16">Hear from members of the AroundU network who are building a more resourceful community.</p>
            <div className="space-y-8">
              <TestimonialCard 
                quote="The live verification process is a game-changer. I rented a camera for a shoot and had complete peace of mind. It felt safer than any other platform."
                name="Sarah Miller"
                role="Professional Photographer"
                avatar="https://picsum.photos/seed/sarah/100"
              />
            </div>
           </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full border-t border-gray-200 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-sm text-slate-500">&copy; 2024 AroundU. All rights reserved.</p>
          <div className="flex gap-4 sm:gap-6 text-sm font-semibold text-slate-600">
             <a href="#" className="hover:text-slate-900">Terms</a>
             <a href="#" className="hover:text-slate-900">Privacy</a>
             <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-white p-8 rounded-2xl soft-shadow text-left">
    <div className="bg-[#E7EDE4] w-12 h-12 rounded-full flex items-center justify-center text-[#093E28] mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-600">{description}</p>
  </div>
);

const CategoryCard = ({ name, image }: { name: string; image: string }) => (
  <div className="relative rounded-2xl overflow-hidden aspect-square group cursor-pointer">
    <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
    <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold">{name}</h3>
  </div>
);

const TestimonialCard = ({ quote, name, role, avatar }: { quote: string; name: string; role: string; avatar: string }) => (
  <div className="bg-white p-8 rounded-2xl soft-shadow">
    <p className="text-lg font-medium text-slate-700 mb-6">"{quote}"</p>
    <div className="flex items-center gap-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full" />
      <div>
        <p className="font-bold text-slate-900">{name}</p>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
    </div>
  </div>
);

export default Landing;
