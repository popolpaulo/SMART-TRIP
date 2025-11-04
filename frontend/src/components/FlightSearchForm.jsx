import { useState } from 'react'
import { Search, MapPin, Calendar, Users, ArrowRightLeft, Plane } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FlightSearchForm() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState('roundtrip') // 'roundtrip', 'oneway', 'multicity'
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'economy'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Rediriger vers la page de résultats avec les paramètres
    const params = new URLSearchParams({
      ...searchData,
      tripType
    })
    navigate(`/search?${params.toString()}`)
  }

  const swapLocations = () => {
    setSearchData({
      ...searchData,
      origin: searchData.destination,
      destination: searchData.origin
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
      {/* Type de voyage */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setTripType('roundtrip')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === 'roundtrip'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aller-retour
        </button>
        <button
          onClick={() => setTripType('oneway')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === 'oneway'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Aller simple
        </button>
        <button
          onClick={() => setTripType('multicity')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tripType === 'multicity'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Multi-destinations
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Origine et Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Origine */}
          <div className="relative">
            <label className="label">
              <MapPin className="inline h-4 w-4 mr-1" />
              Ville de départ
            </label>
            <input
              type="text"
              placeholder="Paris (CDG)"
              value={searchData.origin}
              onChange={(e) => setSearchData({ ...searchData, origin: e.target.value })}
              className="input pl-10"
              required
            />
            <Plane className="absolute left-3 bottom-4 h-5 w-5 text-gray-400" />
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="label">
              <MapPin className="inline h-4 w-4 mr-1" />
              Destination
            </label>
            <input
              type="text"
              placeholder="New York (JFK)"
              value={searchData.destination}
              onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
              className="input pl-10"
              required
            />
            <MapPin className="absolute left-3 bottom-4 h-5 w-5 text-gray-400" />
            
            {/* Bouton swap */}
            <button
              type="button"
              onClick={swapLocations}
              className="absolute -left-4 md:left-auto md:-translate-x-1/2 md:left-1/2 top-1/2 md:top-auto md:bottom-4 bg-white border-2 border-primary-600 rounded-full p-2 text-primary-600 hover:bg-primary-50 transition z-10"
              title="Inverser départ/arrivée"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date de départ */}
          <div>
            <label className="label">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date de départ
            </label>
            <input
              type="date"
              value={searchData.departureDate}
              onChange={(e) => setSearchData({ ...searchData, departureDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="input"
              required
            />
          </div>

          {/* Date de retour */}
          {tripType === 'roundtrip' && (
            <div>
              <label className="label">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date de retour
              </label>
              <input
                type="date"
                value={searchData.returnDate}
                onChange={(e) => setSearchData({ ...searchData, returnDate: e.target.value })}
                min={searchData.departureDate || new Date().toISOString().split('T')[0]}
                className="input"
                required={tripType === 'roundtrip'}
              />
            </div>
          )}
        </div>

        {/* Passagers et Classe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Nombre de passagers */}
          <div>
            <label className="label">
              <Users className="inline h-4 w-4 mr-1" />
              Passagers
            </label>
            <select
              value={searchData.passengers}
              onChange={(e) => setSearchData({ ...searchData, passengers: parseInt(e.target.value) })}
              className="input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>{num} passager{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Classe */}
          <div>
            <label className="label">Classe</label>
            <select
              value={searchData.class}
              onChange={(e) => setSearchData({ ...searchData, class: e.target.value })}
              className="input"
            >
              <option value="economy">Économique</option>
              <option value="premium">Premium Économique</option>
              <option value="business">Affaires</option>
              <option value="first">Première Classe</option>
            </select>
          </div>
        </div>

        {/* Bouton de recherche */}
        <button
          type="submit"
          className="w-full btn btn-primary text-lg py-4 flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Rechercher des vols</span>
        </button>

        {/* Options supplémentaires */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-gray-700">Vols directs uniquement</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <span className="text-gray-700">Inclure les aéroports voisins</span>
          </label>
        </div>
      </form>
    </div>
  )
}
