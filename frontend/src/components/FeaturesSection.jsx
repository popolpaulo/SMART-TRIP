import { Sparkles, Shield, Bell, TrendingDown, Zap, Globe } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: 'IA Intelligente',
      description: 'Notre algorithme analyse des millions de combinaisons pour trouver le meilleur prix',
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      icon: TrendingDown,
      title: 'Meilleur Prix Garanti',
      description: 'Économisez jusqu\'à 35% en comparant toutes les compagnies aériennes',
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      icon: Bell,
      title: 'Alertes de Prix',
      description: 'Recevez des notifications quand les prix baissent pour vos destinations favorites',
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      icon: Shield,
      title: 'Paiement Sécurisé',
      description: 'Vos données sont protégées par un cryptage de niveau bancaire',
      color: 'text-red-600',
      bg: 'bg-red-100'
    },
    {
      icon: Zap,
      title: 'Réservation Rapide',
      description: 'Réservez votre vol en moins de 2 minutes avec notre interface intuitive',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      icon: Globe,
      title: 'VPN Intégré',
      description: 'Comparez les prix depuis différents pays pour trouver les meilleures offres',
      color: 'text-indigo-600',
      bg: 'bg-indigo-100'
    }
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir SMART TRIP ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des fonctionnalités innovantes pour vous faire économiser temps et argent
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-20 bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
            <blockquote className="text-xl md:text-2xl text-gray-900 font-medium mb-6">
              "SMART TRIP m'a fait économiser plus de 800€ sur mon voyage en famille à Tokyo. 
              L'alerte de prix est géniale !"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img
                src="https://i.pravatar.cc/100?img=1"
                alt="Marie D."
                className="w-12 h-12 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Marie D.</p>
                <p className="text-gray-600 text-sm">Cliente depuis 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
