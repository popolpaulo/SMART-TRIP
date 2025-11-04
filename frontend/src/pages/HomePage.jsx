import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, Sparkles, TrendingUp, Plane } from 'lucide-react'
import axios from 'axios'
import FlightSearchForm from '../components/FlightSearchForm'
import TrendingDestinations from '../components/TrendingDestinations'
import FeaturesSection from '../components/FeaturesSection'

export default function HomePage() {
  const [trendingDestinations, setTrendingDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingDestinations()
  }, [])

  const fetchTrendingDestinations = async () => {
    try {
      const response = await axios.get('/api/search/trending')
      setTrendingDestinations(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des destinations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section avec gradient */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-accent-400" />
              <span className="text-sm font-medium">Optimisé par l'Intelligence Artificielle</span>
            </div>
          </div>

          {/* Titre principal */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Trouvez les meilleurs vols<br />
              <span className="text-accent-400">au meilleur prix</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Comparez des millions de vols instantanément. Notre IA trouve les meilleures offres pour vous.
            </p>
          </div>

          {/* Formulaire de recherche */}
          <FlightSearchForm />

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">50M+</div>
              <div className="text-blue-200 text-sm">Recherches/an</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-200 text-sm">Compagnies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">35%</div>
              <div className="text-blue-200 text-sm">Économies moy.</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">4.9★</div>
              <div className="text-blue-200 text-sm">Note utilisateurs</div>
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à voyager intelligemment ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Créez un compte gratuit et recevez des alertes de prix personnalisées.
          </p>
          <button className="btn-accent px-8 py-4 text-lg font-semibold rounded-lg">
            Créer un compte gratuit
          </button>
        </div>
      </div>
    </div>
  )
}
