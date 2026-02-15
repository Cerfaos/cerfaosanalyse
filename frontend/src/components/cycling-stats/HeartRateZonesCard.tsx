/**
 * Carte d'affichage des zones de fréquence cardiaque
 */

import { Card } from '../ui/Card';
import type { HeartRateZone } from '../../types/cyclingStats';

interface HeartRateZonesCardProps {
  zones: HeartRateZone[];
}

export function HeartRateZonesCard({ zones }: HeartRateZonesCardProps) {
  return (
    <Card
      title="Zones de fréquence cardiaque"
      description="Plages Karvonen calculées depuis votre profil, utilisées pour les analyses ci-dessous."
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {zones.map((zone) => (
          <div
            key={zone.zone}
            className="rounded-2xl border border-border-base p-4 shadow-sm"
            style={{ borderTopColor: zone.color, borderTopWidth: '4px' }}
          >
            <p className="text-xs font-semibold text-text-secondary mb-1">Zone {zone.zone}</p>
            <p className="text-lg font-semibold text-text-dark dark:text-dark-text-contrast">
              {zone.name}
            </p>
            <p className="text-2xl font-display text-text-dark dark:text-dark-text-contrast mt-2">
              {zone.min}-{zone.max} bpm
            </p>
            <p className="text-xs text-text-muted mt-2 leading-snug">{zone.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default HeartRateZonesCard;
