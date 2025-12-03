import {
  Sparkles,
  Shield,
  Bell,
  TrendingDown,
  Zap,
  Globe,
  Brain,
  Target,
  BarChart3,
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "IA de Recommandation",
      description:
        "Intelligence artificielle qui analyse 6 critères pondérés pour vous recommander les meilleurs vols selon vos préférences",
      color: "text-purple-600",
      bg: "bg-purple-100",
      badge: "NEW",
    },
    {
      icon: BarChart3,
      title: "Prédiction de Prix ML",
      description:
        "Machine Learning prédictif basé sur des données historiques réelles pour anticiper les hausses et baisses de prix",
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      badge: "NEW",
    },
    {
      icon: Target,
      title: "Score IA Personnalisé",
      description:
        "Chaque vol reçoit un score IA sur 100 calculé en temps réel (prix, confort, durée, escales, compagnie, timing)",
      color: "text-blue-600",
      bg: "bg-blue-100",
      badge: "NEW",
    },
    {
      icon: TrendingDown,
      title: "Meilleur Prix Garanti",
      description:
        "Comparaison instantanée sur 500+ compagnies aériennes avec données réelles d'Amadeus",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      icon: Globe,
      title: "Comparaison Multi-Pays",
      description:
        "Comparez les prix depuis différents pays (FR, US, GB, DE) pour trouver les meilleures offres géolocalisées",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      icon: Bell,
      title: "Alertes Intelligentes",
      description:
        "Notifications basées sur l'IA quand les prix baissent ou que c'est le moment idéal pour réserver",
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
  ];

  return (
    <div className="py-20 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-800 dark:to-pink-800 text-white px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">
              Intelligence Artificielle Avancée
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Pourquoi choisir SMART TRIP ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            La première plateforme propulsée par IA avec scoring en temps réel
            et prédictions ML pour trouver le vol parfait
          </p>
        </div>

        {/* Grille de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 relative"
            >
              {feature.badge && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                  {feature.badge}
                </div>
              )}
              <div
                className={`inline-flex p-3 rounded-lg ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="mt-20 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 rounded-2xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <span className="text-4xl">⭐⭐⭐⭐⭐</span>
              <span className="ml-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Score IA: 98/100
              </span>
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-900 dark:text-gray-100 font-medium mb-6">
              "L'IA de SMART TRIP a trouvé un vol Paris-Tokyo à 450€ alors que
              tous les autres sites affichaient 800€+. Les prédictions de prix
              m'ont dit d'attendre 3 jours et j'ai économisé 350€
              supplémentaires !"
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img
                src="https://i.pravatar.cc/100?img=1"
                alt="Marie D."
                className="w-12 h-12 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900 dark:text-gray-100">Marie D.</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Cliente depuis 2024 • Vol Paris ✈️ Tokyo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
