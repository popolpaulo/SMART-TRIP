import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, TrendingUp, Brain, Zap, Target } from "lucide-react";
import api from "../utils/api";
import FlightSearchForm from "../components/FlightSearchForm";
import TrendingDestinations from "../components/TrendingDestinations";
import FeaturesSection from "../components/FeaturesSection";

export default function HomePage() {
  const location = useLocation();
  const selectedDestination = location.state?.destination || null;
  const [trendingDestinations, setTrendingDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingDestinations();
  }, []);

  const fetchTrendingDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/search/trending");
      setTrendingDestinations(response.data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des destinations:", error);
      setError(error.message);
      // Utiliser des données de fallback en cas d'erreur
      setTrendingDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section avec gradient */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950 text-white overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
              <Brain className="h-5 w-5 text-purple-300" />
              <span className="text-sm font-semibold">
                IA Avancée • Scoring en Temps Réel • Prédictions ML
              </span>
              <Sparkles className="h-4 w-4 text-pink-300 animate-pulse" />
            </div>
          </div>

          {/* Titre principal */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trouvez les meilleurs vols
              <br />
              <span className="bg-gradient-to-r from-accent-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                avec l'Intelligence Artificielle
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Score IA sur 100 pour chaque vol • Prédictions de prix ML •
              Comparaison sur 500+ compagnies
            </p>
          </div>

          {/* Formulaire de recherche */}
          <FlightSearchForm initialDestination={selectedDestination} />

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-6 w-6 text-purple-300 mr-2" />
                <div className="text-3xl md:text-4xl font-bold">6</div>
              </div>
              <div className="text-blue-200 text-sm">Critères IA analysés</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-green-300 mr-2" />
                <div className="text-3xl md:text-4xl font-bold">500+</div>
              </div>
              <div className="text-blue-200 text-sm">Compagnies comparées</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-yellow-300 mr-2" />
                <div className="text-3xl md:text-4xl font-bold">90j</div>
              </div>
              <div className="text-blue-200 text-sm">Historique ML</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-pink-300 mr-2" />
                <div className="text-3xl md:text-4xl font-bold">/100</div>
              </div>
              <div className="text-blue-200 text-sm">
                Score IA en temps réel
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destinations tendances */}
      <TrendingDestinations
        destinations={trendingDestinations}
        loading={loading}
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 via-primary-600 to-pink-600 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">IA de Recommandation Activée</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à voyager intelligemment ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Recevez des alertes intelligentes basées sur l'IA et des prédictions
            de prix ML personnalisées.
          </p>
          <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg shadow-xl transition-all hover:scale-105">
            Commencer avec l'IA gratuitement
          </button>
        </div>
      </div>
    </div>
  );
}
