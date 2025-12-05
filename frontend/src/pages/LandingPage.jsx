import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';
import Globe3D from '../components/Globe3D';

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (countryName) => {
    setSelectedCountry(countryName);
    // Rediriger vers la page de recherche avec le pays sélectionné
    setTimeout(() => {
      navigate('/home', { state: { destination: countryName } });
    }, 500);
  };

  const handleExplore = () => {
    navigate('/home');
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Canvas Three.js avec le globe 3D */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <Globe3D onCountryClick={handleCountryClick} />
          </Suspense>
        </Canvas>
      </div>

      {/* Notification de sélection de pays */}
      {selectedCountry && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-30 bg-primary-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce">
          <span className="font-semibold">🌍 {selectedCountry} sélectionné !</span>
        </div>
      )}

      {/* Overlay gradient subtil pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 pointer-events-none z-10" />

      {/* Logo en haut à gauche */}
      <div className="absolute top-8 left-8 z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 p-3 rounded-xl shadow-2xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SMART TRIP</h1>
            <p className="text-sm text-gray-300 tracking-wide">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* Slogan en haut à droite */}
      <div className="absolute top-8 right-8 z-20 text-right">
        <p className="text-gray-300 text-lg font-light italic">
          "Voyagez intelligent, <span className="text-primary-400 font-semibold">voyagez avec nous"</span>
        </p>
      </div>

      {/* Bouton et Stats en bas de page */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-12">
        <div className="text-center space-y-8">
          {/* Stats ou features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto px-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary-400">500+</div>
              <div className="text-gray-400 text-xs">Compagnies aériennes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">1M+</div>
              <div className="text-gray-400 text-xs">Vols analysés/jour</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-pink-400">98%</div>
              <div className="text-gray-400 text-xs">Satisfaction client</div>
            </div>
          </div>

          {/* Bouton CTA */}
          <div>
            <button
              onClick={handleExplore}
              className="group relative inline-flex items-center space-x-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-semibold text-lg px-10 py-5 rounded-full shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span>Commencer l'exploration</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>
          </div>

          {/* Instructions */}
          <div className="text-gray-400 text-sm">
            Interagissez avec le globe
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
