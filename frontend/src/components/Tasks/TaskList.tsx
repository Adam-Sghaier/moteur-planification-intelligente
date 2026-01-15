'use client';

import { Tache, PrioriteTache, Conflit } from '@/types';
import { TaskCard } from '@/components/Calendar/TaskCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { useStore } from '@/store/useStore';
import { useMemo } from 'react';

interface TaskListProps {
  taches: Tache[];
  conflits: Conflit[];
  isLoading?: boolean;
}

export function TaskList({ taches, conflits, isLoading }: TaskListProps) {
  const { filtres, setFiltrePriorite, setFiltreStatut } = useStore();

  const tachesConflitIds = useMemo(() =>
    new Set(conflits.filter(c => c.tacheId).map(c => c.tacheId!)),
    [conflits]
  );

  const tachesFiltrees = useMemo(() => {
    return taches.filter((tache) => {
      if (filtres.priorite && tache.priorite !== filtres.priorite) return false;
      if (filtres.statut && tache.statut !== filtres.statut) return false;
      return true;
    });
  }, [taches, filtres]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-gray-900 mb-3">
          Tâches non assignées ({tachesFiltrees.length})
        </h3>

        <div className="space-y-2">
          <select
            value={filtres.priorite || ''}
            onChange={(e) => setFiltrePriorite(e.target.value as PrioriteTache || null)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="URGENTE">🔴 Urgente</option>
            <option value="HAUTE">🟠 Haute</option>
            <option value="MOYENNE">🟡 Moyenne</option>
            <option value="BASSE">🟢 Basse</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tachesFiltrees.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune tâche en attente</p>
          </div>
        ) : (
          tachesFiltrees.map((tache) => (
            <TaskCard
              key={tache.id}
              tache={tache}
              hasConflict={tachesConflitIds.has(tache.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
