import { Plane, Menu, User, Heart, LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                SMART <span className="text-primary-600">TRIP</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Vols
              </Link>
              <Link
                to="/hotels"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Hôtels
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/trips"
                    className="text-gray-700 hover:text-primary-600 font-medium transition"
                  >
                    Mes voyages
                  </Link>
                  <Link
                    to="/alerts"
                    className="text-gray-700 hover:text-primary-600 font-medium transition"
                  >
                    Alertes prix
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/favorites"
                    className="p-2 text-gray-600 hover:text-red-500 transition"
                    title="Mes favoris"
                  >
                    <Heart className="h-5 w-5" />
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 border border-gray-300 rounded-lg transition"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="font-medium">{user?.firstName}</span>
                    </button>

                    {/* Dropdown menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Mon profil
                        </Link>
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-primary-600 border border-gray-300 rounded-lg transition"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Connexion</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Vols
                </Link>
                <Link
                  to="/hotels"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Hôtels
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/trips"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                    >
                      Mes voyages
                    </Link>
                    <Link
                      to="/alerts"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                    >
                      Alertes prix
                    </Link>
                    <Link
                      to="/profile"
                      className="text-gray-700 hover:text-primary-600 font-medium"
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={logout}
                      className="btn bg-red-50 text-red-600 hover:bg-red-100 w-full mt-4"
                    >
                      Déconnexion
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link to="/login" className="btn btn-primary w-full mt-4">
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6 text-primary-400" />
                <span className="text-xl font-bold">SMART TRIP</span>
              </div>
              <p className="text-gray-400 text-sm">
                Comparez les vols, trouvez les meilleures offres et planifiez
                votre voyage parfait avec l'IA.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produits</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Vols
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Hôtels
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Forfaits
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Activités
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Carrières
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Presse
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Centre d'aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Confidentialité
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 SMART TRIP. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
