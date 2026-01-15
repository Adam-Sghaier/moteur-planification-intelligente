'use client';

import { useDraggable } from '@dnd-kit/core';
import { Tache, PrioriteTache } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDuree } from '@/lib/utils';
import { Clock, MapPin, Wrench, AlertTriangle, Info, GripVertical } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  tache: Tache;
  hasConflict?: boolean;
  isDragging?: boolean;
}

export function TaskCard({ tache, hasConflict, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tache.id,
    data: { tache },
  });

  const openTacheModal = useStore((state) => state.openTacheModal);

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const prioriteVariant = {
    [PrioriteTache.URGENTE]: 'danger',
    [PrioriteTache.HAUTE]: 'warning',
    [PrioriteTache.MOYENNE]: 'info',
    [PrioriteTache.BASSE]: 'success',
  } as const;

  const handleInfoClick = () => {
    openTacheModal(tache.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'bg-white border rounded-lg p-3 shadow-sm transition-all hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-lg',
        hasConflict && 'border-red-500 border-2'
      )}
    >
      {/* Header with drag handle and info button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-gray-100"
            title="Glisser pour assigner"
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <Badge variant={prioriteVariant[tache.priorite] || 'default'}>
            {tache.priorite}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {hasConflict && (
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <button
            onClick={handleInfoClick}
            className="p-1.5 rounded-full hover:bg-blue-100 transition-colors"
            title="Voir les détails"
          >
            <Info className="w-4 h-4 text-blue-500" />
          </button>
        </div>
      </div>

      {/* Title - also draggable */}
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {tache.titre}
        </h4>

        <div className="space-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuree(tache.dureeEstimee)}</span>
          </div>

          {tache.localisation && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{tache.localisation}</span>
            </div>
          )}

          {tache.competencesRequises.length > 0 && (
            <div className="flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5" />
              <span className="truncate">
                {tache.competencesRequises.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
