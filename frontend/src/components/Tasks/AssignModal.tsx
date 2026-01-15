'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tache, Technicien } from '@/types';
import { formatDuree, getPrioriteColor } from '@/lib/utils';
import { Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (heureDebut: string, heureFin: string) => void;
  tache: Tache | null;
  technicien: Technicien | null;
  date: Date | null;
  isLoading?: boolean;
}

export function AssignModal({
  isOpen,
  onClose,
  onConfirm,
  tache,
  technicien,
  date,
  isLoading
}: AssignModalProps) {
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('10:00');

  // Calculate end time based on task duration
  useEffect(() => {
    if (tache && heureDebut) {
      const [hours, minutes] = heureDebut.split(':').map(Number);
      const startMinutes = hours * 60 + minutes;
      const endMinutes = startMinutes + tache.dureeEstimee;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      setHeureFin(`${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`);
    }
  }, [heureDebut, tache]);

  const handleConfirm = () => {
    if (!date) return;

    // Combine date with time
    const dateDebut = new Date(date);
    const [startH, startM] = heureDebut.split(':').map(Number);
    dateDebut.setHours(startH, startM, 0, 0);

    const dateFin = new Date(date);
    const [endH, endM] = heureFin.split(':').map(Number);
    dateFin.setHours(endH, endM, 0, 0);

    onConfirm(dateDebut.toISOString(), dateFin.toISOString());
  };

  if (!tache || !technicien || !date) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Planifier l'intervention"
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Task Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={getPrioriteColor(tache.priorite)}>
              {tache.priorite}
            </Badge>
          </div>
          <h4 className="font-semibold text-gray-900">{tache.titre}</h4>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Clock className="w-4 h-4" />
            <span>Durée estimée: {formatDuree(tache.dureeEstimee)}</span>
          </div>
        </div>

        {/* Technician Info */}
        <div className="flex items-center gap-3 p-3 border rounded-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{technicien.nom}</p>
            <p className="text-sm text-gray-500">{technicien.email}</p>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="font-medium">
            {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
          </span>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de début
            </label>
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Heure de fin
            </label>
            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Duration info */}
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <p>
            💡 L'heure de fin est calculée automatiquement selon la durée de la tâche ({formatDuree(tache.dureeEstimee)}).
            Vous pouvez la modifier si nécessaire.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Assignation...' : 'Confirmer l\'assignation'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
        </div>
      </div>
    </Modal>
  );
}
