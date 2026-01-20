interface EmptyStateProps {
  onImport: () => void;
}

export default function EmptyState({ onImport }: EmptyStateProps) {
  return (
    <div className="glass-panel p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-orange-500/5" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full translate-x-32 translate-y-32 blur-3xl" />
      <div className="max-w-md mx-auto relative z-10">
        <div className="text-7xl mb-6 animate-bounce">📊</div>
        <h3 className="text-2xl font-bold text-white mb-3">
          Aucune activité pour le moment
        </h3>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Importez vos fichiers FIT, GPX ou CSV pour commencer à suivre votre
          charge d'entraînement et analyser vos performances.
        </p>
        <button
          onClick={onImport}
          className="btn-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          Importer une activité
        </button>
      </div>
    </div>
  );
}
