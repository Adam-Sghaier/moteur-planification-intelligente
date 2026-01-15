'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Techniciens
export function useTechniciens() {
  return useQuery({
    queryKey: ['techniciens'],
    queryFn: () => api.getTechniciens(),
  });
}

export function useTechnicien(id: string) {
  return useQuery({
    queryKey: ['technicien', id],
    queryFn: () => api.getTechnicien(id),
    enabled: !!id,
  });
}

export function useDisponibiliteTechnicien(id: string) {
  return useQuery({
    queryKey: ['disponibilite', id],
    queryFn: () => api.getDisponibiliteTechnicien(id),
    enabled: !!id,
  });
}

export function useAffectationsTechnicien(id: string) {
  return useQuery({
    queryKey: ['affectations', 'technicien', id],
    queryFn: () => api.getAffectationsTechnicien(id),
    enabled: !!id,
  });
}

// Tâches
export function useTaches() {
  return useQuery({
    queryKey: ['taches'],
    queryFn: () => api.getTaches(),
  });
}

export function useTachesEnAttente() {
  return useQuery({
    queryKey: ['taches', 'en-attente'],
    queryFn: () => api.getTachesEnAttente(),
  });
}

export function useTachesUrgentes() {
  return useQuery({
    queryKey: ['taches', 'urgentes'],
    queryFn: () => api.getTachesUrgentes(),
  });
}

export function useTache(id: string | null) {
  return useQuery({
    queryKey: ['tache', id],
    queryFn: () => api.getTache(id!),
    enabled: !!id,
  });
}

// Planification
export function useConflits() {
  return useQuery({
    queryKey: ['conflits'],
    queryFn: () => api.getConflits(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useAutoAssigner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tacheId: string) => api.autoAssigner(tacheId),
    onSuccess: (data) => {
      if (data.succes) {
        toast.success(data.message || 'Tâche assignée avec succès');
        queryClient.invalidateQueries({ queryKey: ['taches'] });
        queryClient.invalidateQueries({ queryKey: ['techniciens'] });
        queryClient.invalidateQueries({ queryKey: ['conflits'] });
      } else {
        toast.error(data.conflits?.[0]?.message || 'Impossible d\'assigner la tâche');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'assignation');
    },
  });
}

export function useAssignerManuellement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tacheId, technicienId, heureDebut }: {
      tacheId: string;
      technicienId: string;
      heureDebut: string
    }) => api.assignerManuellement(tacheId, technicienId, heureDebut),
    onSuccess: (data) => {
      if (data.succes) {
        toast.success(data.message || 'Tâche assignée manuellement');
        queryClient.invalidateQueries({ queryKey: ['taches'] });
        queryClient.invalidateQueries({ queryKey: ['techniciens'] });
        queryClient.invalidateQueries({ queryKey: ['conflits'] });
        queryClient.invalidateQueries({ queryKey: ['affectations'] });
      } else {
        toast.error(data.conflits?.[0]?.message || 'Impossible d\'assigner la tâche');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'assignation');
    },
  });
}

export function useOptimiser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.optimiser(),
    onSuccess: (data) => {
      toast.success(`${data.affectationsOptimisees} affectations optimisées`);
      queryClient.invalidateQueries({ queryKey: ['taches'] });
      queryClient.invalidateQueries({ queryKey: ['techniciens'] });
      queryClient.invalidateQueries({ queryKey: ['conflits'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'optimisation');
    },
  });
}
