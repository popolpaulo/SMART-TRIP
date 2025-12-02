import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Plane, AlertCircle, CheckCircle } from 'lucide-react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.error || 'Code invalide');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setError('');
    setResending(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Un nouveau code a ete envoye a votre email');
      } else {
        setError(data.error || 'Erreur lors du renvoi');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }

    setResending(false);
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email manquant</h2>
          <p className="text-gray-600 mb-6">Veuillez vous inscrire d'abord.</p>
          <button onClick={() => navigate('/register')} className="btn btn-primary">
            Aller a l'inscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Plane className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verifiez votre email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Un code a 6 chiffres a ete envoye a
          </p>
          <p className="text-sm font-medium text-primary-600">{email}</p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-xl" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <span>Email verifie ! Redirection vers la connexion...</span>
            </div>
          )}

          {!success && (
            <>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code de verification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength="6"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none relative block w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-500 text-gray-900 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Le code est valide pendant 15 minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verification...</span>
                  </div>
                ) : (
                  'Verifier mon email'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium disabled:opacity-50"
                >
                  {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
