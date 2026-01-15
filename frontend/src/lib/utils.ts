import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuree(minutes: number): string {
  const heures = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (heures === 0) return `${mins}min`;
  if (mins === 0) return `${heures}h`;
  return `${heures}h${mins}`;
}

export function getDebutSemaine(date: Date): Date {
  const d = new Date(date);
  const jour = d.getDay();
  const diff = d.getDate() - jour + (jour === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getJoursSemaine(dateDebut: Date): Date[] {
  const jours: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const jour = new Date(dateDebut);
    jour.setDate(dateDebut.getDate() + i);
    jours.push(jour);
  }
  return jours;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function getPrioriteColor(priorite: string): string {
  switch (priorite) {
    case 'URGENTE':
      return 'bg-red-500 text-white';
    case 'HAUTE':
      return 'bg-orange-500 text-white';
    case 'MOYENNE':
      return 'bg-yellow-500 text-black';
    case 'BASSE':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

export function getStatutColor(statut: string): string {
  switch (statut) {
    case 'EN_ATTENTE':
      return 'bg-gray-200 text-gray-800';
    case 'ASSIGNEE':
      return 'bg-blue-200 text-blue-800';
    case 'EN_COURS':
      return 'bg-purple-200 text-purple-800';
    case 'TERMINEE':
      return 'bg-green-200 text-green-800';
    case 'ANNULEE':
      return 'bg-red-200 text-red-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
}
