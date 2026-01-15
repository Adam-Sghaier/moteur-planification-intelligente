import { create } from 'zustand';
import { PrioriteTache, StatutTache } from '@/types';

interface Filtres {
  priorite: PrioriteTache | null;
  statut: StatutTache | null;
  rechercheTechnicien: string;
}

interface PlanningState {
  // Date sélectionnée
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;

  // Filtres
  filtres: Filtres;
  setFiltrePriorite: (priorite: PrioriteTache | null) => void;
  setFiltreStatut: (statut: StatutTache | null) => void;
  setRechercheTechnicien: (recherche: string) => void;
  resetFiltres: () => void;

  // Modal tâche
  modalTacheId: string | null;
  openTacheModal: (id: string) => void;
  closeTacheModal: () => void;

  // Drag & drop
  draggedTacheId: string | null;
  setDraggedTache: (id: string | null) => void;

  // Auth
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
}

export const useStore = create<PlanningState>((set) => ({
  // Date
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  // Filtres
  filtres: {
    priorite: null,
    statut: null,
    rechercheTechnicien: '',
  },
  setFiltrePriorite: (priorite) =>
    set((state) => ({ filtres: { ...state.filtres, priorite } })),
  setFiltreStatut: (statut) =>
    set((state) => ({ filtres: { ...state.filtres, statut } })),
  setRechercheTechnicien: (rechercheTechnicien) =>
    set((state) => ({ filtres: { ...state.filtres, rechercheTechnicien } })),
  resetFiltres: () =>
    set({ filtres: { priorite: null, statut: null, rechercheTechnicien: '' } }),

  // Modal
  modalTacheId: null,
  openTacheModal: (id) => set({ modalTacheId: id }),
  closeTacheModal: () => set({ modalTacheId: null }),

  // Drag & drop
  draggedTacheId: null,
  setDraggedTache: (id) => set({ draggedTacheId: id }),

  // Auth
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
}));
