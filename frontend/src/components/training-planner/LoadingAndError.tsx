/**
 * Composants de chargement et d'erreur
 */

import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

export function LoadingSkeleton() {
  return (
    <div className="glass-panel p-8 md:p-12">
      <div className="flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 text-[#8BC34A] animate-spin" />
        <p className="text-gray-400 animate-pulse">Chargement des données...</p>
      </div>
    </div>
  );
}

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="glass-panel p-6 border-red-500/30">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-red-500/10">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-red-400 mb-1">Une erreur s'est produite</h4>
          <p className="text-sm text-gray-400">{message}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
              Réessayer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
