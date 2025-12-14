import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginView = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center px-4">
      <div className="card-apple p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-apple-text mb-2">
            StudyPlan
          </h1>
          <p className="text-apple-text-secondary">
            Planning Blocus
          </p>
        </div>

        <div className="mb-6">
          <p className="text-apple-text-secondary mb-4">
            Connectez-vous avec votre compte Google pour accéder à votre planning personnalisé
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-apple text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full btn-apple flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn size={20} />
          {loading ? 'Connexion...' : 'Se connecter avec Google'}
        </button>

        <p className="text-xs text-apple-text-secondary mt-6">
          Vos données seront stockées de manière sécurisée sur votre compte
        </p>
      </div>
    </div>
  );
};

export default LoginView;

