'use client';

import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDuree, getPrioriteColor, getStatutColor } from '@/lib/utils';
import { Clock, MapPin, Wrench, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTache, useAutoAssigner, useConflits } from '@/hooks/usePlanification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo } from 'react';

export function TaskDetails() {
  const { modalTacheId, closeTacheModal } = useStore();
  const { data: tache, isLoading } = useTache(modalTacheId);
  const { data: conflits = [] } = useConflits();
  const autoAssigner = useAutoAssigner();

  // Find conflicts for this specific task
  const conflitsTache = useMemo(() => {
    if (!modalTacheId) return [];
    return conflits.filter(c => c.tacheId === modalTacheId);
  }, [conflits, modalTacheId]);

  if (!modalTacheId) return null;

  const handleAutoAssign = () => {
    if (tache) {
      autoAssigner.mutate(tache.id, {
        onSuccess: () => closeTacheModal(),
      });
    }
  };

  const getConflitTypeLabel = (type: string) => {
    switch (type) {
      case 'CHEVAUCHEMENT':
        return 'Chevauchement horaire';
      case 'AUCUN_TECHNICIEN_QUALIFIE':
        return 'Aucun technicien qualifié';
      case 'URGENTE_NON_ASSIGNEE':
        return 'Tâche urgente non assignée';
      case 'DEPASSEMENT_CAPACITE':
        return 'Dépassement de capacité';
      default:
        return type;
    }
  };

  return (
    <Modal
      isOpen={!!modalTacheId}
      onClose={closeTacheModal}
      title="Détails de la tâche"
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      ) : tache ? (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getPrioriteColor(tache.priorite)}>
                {tache.priorite}
              </Badge>
              <Badge className={getStatutColor(tache.statut)}>
                {tache.statut.replace('_', ' ')}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{tache.titre}</h3>
          </div>

          {/* Conflicts Section */}
          {conflitsTache.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="font-semibold text-red-700">
                  {conflitsTache.length} Conflit{conflitsTache.length > 1 ? 's' : ''} détecté{conflitsTache.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {conflitsTache.map((conflit, index) => (
                  <div
                    key={index}
                    className="bg-white border border-red-100 rounded p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="danger">
                        {getConflitTypeLabel(conflit.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-600">
                      {conflit.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tache.description && (
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600">{tache.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Durée: {formatDuree(tache.dureeEstimee)}</span>
            </div>

            {tache.localisation && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{tache.localisation}</span>
              </div>
            )}

            {tache.debutPlanifie && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>
                  {format(new Date(tache.debutPlanifie), 'PPp', { locale: fr })}
                </span>
              </div>
            )}
          </div>

          {tache.competencesRequises.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-700">Compétences requises</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {tache.competencesRequises.map((comp) => (
                  <Badge key={comp} variant="info">{comp}</Badge>
                ))}
              </div>
            </div>
          )}

          {tache.statut === 'EN_ATTENTE' && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleAutoAssign}
                disabled={autoAssigner.isPending}
                className="flex-1"
              >
                {autoAssigner.isPending ? 'Assignation...' : 'Auto-assigner'}
              </Button>
              <Button variant="secondary" onClick={closeTacheModal}>
                Fermer
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Tâche non trouvée</p>
      )}
    </Modal>
  );
}
