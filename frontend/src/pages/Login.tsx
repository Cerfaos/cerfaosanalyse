import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

// Messages d'erreur utilisateur-friendly
const ERROR_MESSAGES: Record<string, string> = {
  "Invalid credentials": "Email ou mot de passe incorrect",
  "E_INVALID_CREDENTIALS": "Email ou mot de passe incorrect",
  "User not found": "Aucun compte associé à cet email",
  "Invalid password": "Mot de passe incorrect",
  "E_VALIDATION_ERROR": "Veuillez vérifier les informations saisies",
  "Too many requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "E_TOO_MANY_REQUESTS": "Trop de tentatives. Réessayez dans quelques minutes.",
  "Network Error": "Impossible de contacter le serveur. Vérifiez votre connexion.",
};

function getErrorMessage(error: AxiosError<{ message?: string; errors?: Array<{ message: string }> }>): string {
  // Erreur réseau (pas de réponse du serveur)
  if (!error.response) {
    if (error.message === "Network Error") {
      return ERROR_MESSAGES["Network Error"];
    }
    return "Erreur de connexion au serveur";
  }

  const status = error.response.status;
  const data = error.response.data;

  // Rate limiting
  if (status === 429) {
    return ERROR_MESSAGES["Too many requests"];
  }

  // Erreur de validation
  if (status === 422 && data.errors?.length) {
    return data.errors.map(e => e.message).join(". ");
  }

  // Message du serveur
  if (data.message) {
    return ERROR_MESSAGES[data.message] || data.message;
  }

  // Erreurs HTTP génériques
  if (status === 401) return "Email ou mot de passe incorrect";
  if (status === 500) return "Erreur serveur. Réessayez plus tard.";
  if (status === 503) return "Service temporairement indisponible";

  return "Erreur de connexion";
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuth, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    clearError();
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { user, token } = response.data.data;

      setAuth(user, token);
      navigate("/dashboard");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: Array<{ message: string }> }>;
      const message = getErrorMessage(axiosError);
      setError(message);

      // Log pour debug en développement
      if (import.meta.env.DEV) {
        console.error("[Login] Erreur:", {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-text-muted mb-4">
            Bienvenue
          </p>
          <h1 className="text-4xl font-semibold mb-4 text-text-dark dark:text-dark-text-contrast">
            Connectez-vous à votre cockpit
          </h1>
          <p className="text-text-secondary mb-8">
            Accédez à vos tableaux de bord, importez vos fichiers et suivez
            votre charge en temps réel.
          </p>
          <Link
            to="/register"
            className="text-sm font-medium text-cta hover:text-cta/80"
          >
            Pas encore de compte ? Créez-le en 2 minutes →
          </Link>
        </div>

        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-error/40 bg-error/5 text-error px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-text-dark"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-border-base bg-bg-white focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-dark"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-border-base bg-bg-white focus:border-cta focus:ring-2 focus:ring-cta/30 outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-text-secondary">
            <Link to="/" className="hover:text-text-dark">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
