import { useState, useEffect } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Brain,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { predictPrices } from "../utils/api";

export default function PricePredictionCard({
  origin,
  destination,
  departureDate,
  cabinClass = "economy",
}) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const data = await predictPrices({
          origin,
          destination,
          departureDate,
          cabinClass,
        });
        setPrediction(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching price prediction:", err);
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination && departureDate) {
      fetchPrediction();
    }
  }, [origin, destination, departureDate, cabinClass]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !prediction?.available) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-700 mb-1">
              Prédictions de prix
            </h3>
            <p className="text-sm text-gray-600">
              {prediction?.message ||
                "Pas encore assez de données historiques pour cette route. Effectuez quelques recherches pour activer les prédictions IA."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case "increasing":
        return <TrendingUp className="h-6 w-6 text-red-500" />;
      case "decreasing":
        return <TrendingDown className="h-6 w-6 text-green-500" />;
      default:
        return <Minus className="h-6 w-6 text-blue-500" />;
    }
  };

  const getTrendColor = () => {
    switch (prediction.trend) {
      case "increasing":
        return "text-red-600 bg-red-50 border-red-200";
      case "decreasing":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getRecommendationText = () => {
    switch (prediction.recommendation) {
      case "book_now":
        return { text: "✅ Réservez maintenant", color: "text-green-700" };
      case "wait":
        return { text: "⏳ Attendez quelques jours", color: "text-yellow-700" };
      case "book_soon":
        return { text: "⚡ Réservez bientôt", color: "text-orange-700" };
      default:
        return { text: "💭 Surveiller les prix", color: "text-gray-700" };
    }
  };

  const recommendation = getRecommendationText();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Prédiction de Prix IA
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTrendColor()} border`}
        >
          {prediction.trend === "increasing"
            ? "📈 Hausse"
            : prediction.trend === "decreasing"
            ? "📉 Baisse"
            : "➡️ Stable"}
        </span>
      </div>

      {/* Prix actuel */}
      {prediction.currentAvgPrice && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Prix moyen actuel</p>
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(prediction.currentAvgPrice)}€
              </p>
            </div>
            {getTrendIcon()}
          </div>
        </div>
      )}

      {/* Recommandation */}
      <div className="bg-white rounded-lg p-4 mb-4 border-2 border-purple-200">
        <div className="flex items-start space-x-3">
          <DollarSign className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className={`font-bold ${recommendation.color} mb-1`}>
              {recommendation.text}
            </p>
            {prediction.reasoning && (
              <p className="text-sm text-gray-600">{prediction.reasoning}</p>
            )}
          </div>
        </div>
      </div>

      {/* Niveau de confiance */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Niveau de confiance :</span>
        <span className="font-semibold capitalize">
          {prediction.confidence === "high" && "🟢 Élevé"}
          {prediction.confidence === "medium" && "🟡 Moyen"}
          {prediction.confidence === "low" && "🟠 Faible"}
        </span>
      </div>

      {/* Historique des prix */}
      {prediction.priceHistory && prediction.priceHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-gray-600 mb-2">
            📊 Historique des prix (derniers {prediction.priceHistory.length}{" "}
            points)
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-white rounded p-2 text-center">
              <p className="text-gray-500">Min</p>
              <p className="font-bold text-green-600">
                {Math.round(
                  Math.min(...prediction.priceHistory.map((h) => h.minPrice))
                )}
                €
              </p>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <p className="text-gray-500">Moy</p>
              <p className="font-bold text-blue-600">
                {Math.round(
                  prediction.priceHistory.reduce(
                    (sum, h) => sum + h.avgPrice,
                    0
                  ) / prediction.priceHistory.length
                )}
                €
              </p>
            </div>
            <div className="bg-white rounded p-2 text-center">
              <p className="text-gray-500">Max</p>
              <p className="font-bold text-red-600">
                {Math.round(
                  Math.max(...prediction.priceHistory.map((h) => h.maxPrice))
                )}
                €
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
