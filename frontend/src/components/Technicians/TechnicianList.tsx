'use client';

import { Technicien } from '@/types';
import { TechnicianCard } from './TechnicianCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';

interface TechnicianListProps {
  techniciens: Technicien[];
  heuresParTechnicien?: Record<string, number>;
  isLoading?: boolean;
}

export function TechnicianList({ techniciens, heuresParTechnicien = {}, isLoading }: TechnicianListProps) {
  const { filtres, setRechercheTechnicien } = useStore();

  const techniciensFiltres = useMemo(() => {
    if (!filtres.rechercheTechnicien) return techniciens;
    const recherche = filtres.rechercheTechnicien.toLowerCase();
    return techniciens.filter(
      (t) =>
        t.nom.toLowerCase().includes(recherche) ||
        t.competences.some((c) => c.toLowerCase().includes(recherche))
    );
  }, [techniciens, filtres.rechercheTechnicien]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-gray-900 mb-3">
          Techniciens ({techniciensFiltres.length})
        </h3>

        <SearchInput
          value={filtres.rechercheTechnicien}
          onChange={setRechercheTechnicien}
          placeholder="Rechercher par nom ou compétence..."
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {techniciensFiltres.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun technicien trouvé</p>
          </div>
        ) : (
          techniciensFiltres.map((technicien) => (
            <TechnicianCard
              key={technicien.id}
              technicien={technicien}
              heuresUtilisees={heuresParTechnicien[technicien.id] || 0}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
