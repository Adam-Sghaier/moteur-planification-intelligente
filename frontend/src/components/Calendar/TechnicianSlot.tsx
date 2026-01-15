'use client';

import { useDroppable } from '@dnd-kit/core';
import { Technicien, Affectation } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TechnicianSlotProps {
  technicien: Technicien;
  date: Date;
  affectations: Affectation[];
}

export function TechnicianSlot({ technicien, date, affectations }: TechnicianSlotProps) {
  const dropId = `${technicien.id}-${format(date, 'yyyy-MM-dd')}`;

  const { setNodeRef, isOver, active } = useDroppable({
    id: dropId,
    data: { technicien, date },
  });

  const dayAffectations = affectations.filter((a) => {
    const affDate = new Date(a.heureDebut);
    return format(affDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[80px] p-2 border-r border-b transition-colors',
        isOver && 'bg-blue-50 border-blue-300',
        dayAffectations.length > 0 ? 'bg-blue-100' : 'bg-white'
      )}
    >
      {dayAffectations.map((aff) => (
        <div
          key={aff.id}
          className="bg-blue-500 text-white text-xs p-1.5 rounded mb-1 truncate"
          title={aff.tache?.titre}
        >
          {format(new Date(aff.heureDebut), 'HH:mm')} - {aff.tache?.titre || 'Tâche'}
        </div>
      ))}

      {isOver && active && (
        <div className="border-2 border-dashed border-blue-400 rounded p-2 text-center text-sm text-blue-600">
          Déposer ici
        </div>
      )}
    </div>
  );
}
