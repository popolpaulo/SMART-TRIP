import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  Settings,
  LogOut,
  Save,
  AlertCircle,
  CheckCircle,
  Plane,
  DollarSign,
  Heart,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, updateUser, getProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("info");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    nationality: "",
    budgetRange: "",
    preferredClass: "",
    comfortLevel: "",
    travelStyle: "",
    maxStops: 1,
    seatPreference: "",
    mealPreference: "",
    newsletterSubscribed: true,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const result = await getProfile();

    if (result.success && result.user) {
      setFormData({
        firstName: result.user.firstName || "",
        lastName: result.user.lastName || "",
        email: result.user.email || "",
        phone: result.user.phone || "",
        dateOfBirth: result.user.dateOfBirth || "",
        nationality: result.user.nationality || "",
        budgetRange: result.user.profile?.budgetRange || "",
        preferredClass: result.user.profile?.preferredClass || "",
        comfortLevel: result.user.profile?.comfortLevel || "",
        travelStyle: result.user.profile?.travelStyle || "",
        maxStops: result.user.profile?.maxStops || 1,
        seatPreference: result.user.profile?.seatPreference || "",
        mealPreference: result.user.profile?.mealPreference || "",
        newsletterSubscribed: result.user.profile?.newsletterSubscribed ?? true,
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    const result = await updateUser(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } else {
      setMessage({
        type: "error",
        text: result.error || "Erreur lors de la mise à jour",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Chargement du profil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mon Profil</h1>
              <p className="text-primary-100">
                {formData.firstName} {formData.lastName}
              </p>
              <p className="text-primary-200 text-sm">{formData.email}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={logout}
                className="btn bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {/* Message de feedback */}
        {message.text && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg flex items-center space-x-2 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "info"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <User className="h-5 w-5 inline mr-2" />
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`flex-1 px-6 py-4 text-sm font-medium ${
                  activeTab === "preferences"
                    ? "border-b-2 border-primary-600 text-primary-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Settings className="h-5 w-5 inline mr-2" />
                Préférences de voyage
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Onglet Informations personnelles */}
            {activeTab === "info" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prénom */}
                  <div>
                    <label className="label">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="input pl-10"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="label">Nom</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>

                  {/* Email (lecture seule) */}
                  <div>
                    <label className="label">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        className="input pl-10 bg-gray-50"
                        value={formData.email}
                        disabled
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="label">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        className="input pl-10"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Date de naissance */}
                  <div>
                    <label className="label">Date de naissance</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        className="input pl-10"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Nationalité */}
                  <div>
                    <label className="label">Nationalité</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        className="input pl-10"
                        value={formData.nationality}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nationality: e.target.value,
                          })
                        }
                      >
                        <option value="">Sélectionner</option>
                        <option value="FR">France</option>
                        <option value="BE">Belgique</option>
                        <option value="CH">Suisse</option>
                        <option value="CA">Canada</option>
                        <option value="US">États-Unis</option>
                        <option value="GB">Royaume-Uni</option>
                        <option value="DE">Allemagne</option>
                        <option value="ES">Espagne</option>
                        <option value="IT">Italie</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Préférences de voyage */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div>
                    <label className="label">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      Gamme de budget
                    </label>
                    <select
                      className="input"
                      value={formData.budgetRange}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetRange: e.target.value,
                        })
                      }
                    >
                      <option value="">Sélectionner</option>
                      <option value="low">Économique (&lt; 500€)</option>
                      <option value="medium">Standard (500-1500€)</option>
                      <option value="high">Premium (1500-3000€)</option>
                      <option value="luxury">Luxe (&gt; 3000€)</option>
                    </select>
                  </div>

                  {/* Classe préférée */}
                  <div>
                    <label className="label">
                      <Plane className="h-4 w-4 inline mr-1" />
                      Classe de vol préférée
                    </label>
                    <select
                      className="input"
                      value={formData.preferredClass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferredClass: e.target.value,
                        })
                      }
                    >
                      <option value="">Sélectionner</option>
                      <option value="economy">Économique</option>
                      <option value="premium_economy">
                        Économique Premium
                      </option>
                      <option value="business">Affaires</option>
                      <option value="first">Première Classe</option>
                    </select>
                  </div>

                  {/* Niveau de confort */}
                  <div>
                    <label className="label">Niveau de confort</label>
                    <select
                      className="input"
                      value={formData.comfortLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          comfortLevel: e.target.value,
                        })
                      }
                    >
                      <option value="">Sélectionner</option>
                      <option value="basic">Basique</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  {/* Style de voyage */}
                  <div>
                    <label className="label">
                      <Heart className="h-4 w-4 inline mr-1" />
                      Style de voyage
                    </label>
                    <select
                      className="input"
                      value={formData.travelStyle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          travelStyle: e.target.value,
                        })
                      }
                    >
                      <option value="">Sélectionner</option>
                      <option value="adventure">Aventure</option>
                      <option value="relax">Détente</option>
                      <option value="romantic">Romantique</option>
                      <option value="cultural">Culturel</option>
                    </select>
                  </div>

                  {/* Escales maximales */}
                  <div>
                    <label className="label">Escales maximales</label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      className="input"
                      value={formData.maxStops}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStops: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  {/* Préférence siège */}
                  <div>
                    <label className="label">Préférence de siège</label>
                    <select
                      className="input"
                      value={formData.seatPreference}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seatPreference: e.target.value,
                        })
                      }
                    >
                      <option value="">Sélectionner</option>
                      <option value="window">Fenêtre</option>
                      <option value="aisle">Couloir</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>

                  {/* Préférence repas */}
                  <div className="md:col-span-2">
                    <label className="label">Préférence alimentaire</label>
                    <select
                      className="input"
                      value={formData.mealPreference}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mealPreference: e.target.value,
                        })
                      }
                    >
                      <option value="">Aucune restriction</option>
                      <option value="vegetarian">Végétarien</option>
                      <option value="vegan">Végétalien (Vegan)</option>
                      <option value="halal">Halal</option>
                      <option value="kosher">Casher (Kosher)</option>
                      <option value="gluten_free">Sans gluten</option>
                    </select>
                  </div>

                  {/* Newsletter */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={formData.newsletterSubscribed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newsletterSubscribed: e.target.checked,
                          })
                        }
                      />
                      <span className="text-sm text-gray-700">
                        Recevoir la newsletter et les offres spéciales
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
