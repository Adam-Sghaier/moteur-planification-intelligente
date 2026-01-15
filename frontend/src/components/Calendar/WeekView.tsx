'use client';

import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Technicien, Affectation, Conflit } from '@/types';
import { TechnicianSlot } from './TechnicianSlot';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { getDebutSemaine, getJoursSemaine, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useOptimiser } from '@/hooks/usePlanification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeekViewProps {
  techniciens: Technicien[];
  affectationsParTechnicien: Record<string, Affectation[]>;
  conflits: Conflit[];
  isLoading?: boolean;
}

export function WeekView({
  techniciens,
  affectationsParTechnicien,
  conflits,
  isLoading
}: WeekViewProps) {
  const { selectedDate, setSelectedDate, filtres, setRechercheTechnicien } = useStore();

  const optimiser = useOptimiser();

  const debutSemaine = useMemo(() => getDebutSemaine(selectedDate), [selectedDate]);
  const joursSemaine = useMemo(() => getJoursSemaine(debutSemaine), [debutSemaine]);

  const techniciensFiltres = useMemo(() => {
    if (!filtres.rechercheTechnicien) return techniciens;
    const recherche = filtres.rechercheTechnicien.toLowerCase();
    return techniciens.filter(
      (t) =>
        t.nom.toLowerCase().includes(recherche) ||
        t.competences.some((c) => c.toLowerCase().includes(recherche))
    );
  }, [techniciens, filtres.rechercheTechnicien]);

  const naviguerSemaine = (delta: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + delta * 7);
    setSelectedDate(newDate);
  };

  const handleOptimiser = () => {
    optimiser.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => naviguerSemaine(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[280px] text-center">
              Semaine du {format(debutSemaine, 'd MMMM yyyy', { locale: fr })}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => naviguerSemaine(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Aujourd&apos;hui
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput
            value={filtres.rechercheTechnicien}
            onChange={setRechercheTechnicien}
            placeholder="Rechercher technicien..."
            className="w-64"
          />

          {conflits.length > 0 && (
            <div className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{conflits.length} conflits</span>
            </div>
          )}

          <Button onClick={handleOptimiser} disabled={optimiser.isPending}>
            <Sparkles className="w-4 h-4 mr-2" />
            {optimiser.isPending ? 'Optimisation...' : 'Auto-assigner tout'}
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              <th className="border-b border-r p-3 text-left font-medium text-gray-700 w-48">
                Technicien
              </th>
              {joursSemaine.map((jour) => (
                <th
                  key={jour.toISOString()}
                  className="border-b border-r p-3 text-center font-medium text-gray-700"
                >
                  <div className="text-sm">{formatDate(jour)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {techniciensFiltres.map((technicien) => (
              <tr key={technicien.id} className="hover:bg-gray-50">
                <td className="border-r p-3 bg-white sticky left-0">
                  <div className="font-medium text-gray-900">{technicien.nom}</div>
                  <div className="text-xs text-gray-500">
                    {technicien.competences.slice(0, 2).join(', ')}
                  </div>
                </td>
                {joursSemaine.map((jour) => (
                  <TechnicianSlot
                    key={`${technicien.id}-${jour.toISOString()}`}
                    technicien={technicien}
                    date={jour}
                    affectations={affectationsParTechnicien[technicien.id] || []}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
