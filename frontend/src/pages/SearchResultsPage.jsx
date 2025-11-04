import { useSearchParams } from 'react-router-dom'
import { Plane, Clock, ArrowRight } from 'lucide-react'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  
  const origin = searchParams.get('origin')
  const destination = searchParams.get('destination')
  const departureDate = searchParams.get('departureDate')
  const returnDate = searchParams.get('returnDate')
  const passengers = searchParams.get('passengers')

  // Données de démonstration
  const mockFlights = [
    {
      id: 1,
      airline: 'Air France',
      logo: '🇫🇷',
      departure: '10:30',
      arrival: '14:45',
      duration: '8h 15m',
      stops: 'Direct',
      price: 450,
      class: 'Economy'
    },
    {
      id: 2,
      airline: 'Lufthansa',
      logo: '🇩🇪',
      departure: '14:20',
      arrival: '18:50',
      duration: '8h 30m',
      stops: '1 escale',
      price: 380,
      class: 'Economy'
    },
    {
      id: 3,
      airline: 'British Airways',
      logo: '🇬🇧',
      departure: '08:15',
      arrival: '12:30',
      duration: '8h 15m',
      stops: 'Direct',
      price: 520,
      class: 'Economy'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête de recherche */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 text-lg font-semibold">
              <span>{origin || 'Paris'}</span>
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <span>{destination || 'New York'}</span>
            </div>
            <div className="text-gray-600">
              {departureDate} {returnDate && `- ${returnDate}`}
            </div>
            <div className="text-gray-600">
              {passengers || 1} passager{passengers > 1 ? 's' : ''}
            </div>
            <button className="ml-auto btn btn-secondary">
              Modifier la recherche
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Filtres</h3>
              
              <div className="space-y-6">
                {/* Prix */}
                <div>
                  <label className="label">Prix maximum</label>
                  <input type="range" min="0" max="1000" className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>0€</span>
                    <span>1000€</span>
                  </div>
                </div>

                {/* Escales */}
                <div>
                  <label className="label">Escales</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Direct</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">1 escale</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">2+ escales</span>
                    </label>
                  </div>
                </div>

                {/* Compagnies */}
                <div>
                  <label className="label">Compagnies</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Air France</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Lufthansa</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">British Airways</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{mockFlights.length} vols trouvés</h2>
              <select className="input w-auto">
                <option>Meilleur prix</option>
                <option>Plus rapide</option>
                <option>Départ le plus tôt</option>
                <option>Départ le plus tard</option>
              </select>
            </div>

            {mockFlights.map((flight) => (
              <div key={flight.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Infos vol */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-3xl">{flight.logo}</div>
                      <div>
                        <div className="font-semibold text-lg">{flight.airline}</div>
                        <div className="text-sm text-gray-600">{flight.class}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{flight.departure}</div>
                        <div className="text-sm text-gray-600">{origin || 'PAR'}</div>
                      </div>

                      <div className="flex-1 px-6">
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                          <div className="h-px bg-gray-300 flex-1"></div>
                          <Plane className="h-5 w-5" />
                          <div className="h-px bg-gray-300 flex-1"></div>
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-sm font-medium">{flight.duration}</div>
                          <div className="text-xs text-gray-500">{flight.stops}</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold">{flight.arrival}</div>
                        <div className="text-sm text-gray-600">{destination || 'NYC'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Prix et bouton */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600">{flight.price}€</div>
                      <div className="text-sm text-gray-600">par personne</div>
                    </div>
                    <button className="btn btn-primary whitespace-nowrap">
                      Sélectionner
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Message info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <p className="text-blue-900 font-medium mb-2">💡 Astuce SMART TRIP</p>
              <p className="text-blue-800">
                Les prix sont mis à jour en temps réel. Activez les alertes de prix pour être notifié des baisses !
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
