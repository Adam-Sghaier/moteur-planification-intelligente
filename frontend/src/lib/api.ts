import { Technicien, Tache, Affectation, Conflit, ResultatPlanification, DisponibiliteTechnicien } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = this.getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Non autorisé');
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur serveur');
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const result = await this.fetch<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.access_token);
    return result;
  }

  logout() {
    this.clearToken();
  }

  // Techniciens
  getTechniciens(): Promise<Technicien[]> {
    return this.fetch<Technicien[]>('/api/techniciens');
  }

  getTechnicien(id: string): Promise<Technicien> {
    return this.fetch<Technicien>(`/api/techniciens/${id}`);
  }

  getDisponibiliteTechnicien(id: string): Promise<DisponibiliteTechnicien> {
    return this.fetch<DisponibiliteTechnicien>(`/api/techniciens/${id}/disponibilite`);
  }

  getAffectationsTechnicien(id: string): Promise<Affectation[]> {
    return this.fetch<Affectation[]>(`/api/techniciens/${id}/affectations`);
  }

  // Tâches
  getTaches(): Promise<Tache[]> {
    return this.fetch<Tache[]>('/api/taches');
  }

  getTachesEnAttente(): Promise<Tache[]> {
    return this.fetch<Tache[]>('/api/taches/en-attente');
  }

  getTachesUrgentes(): Promise<Tache[]> {
    return this.fetch<Tache[]>('/api/taches/urgentes');
  }

  getTache(id: string): Promise<Tache> {
    return this.fetch<Tache>(`/api/taches/${id}`);
  }

  // Planification
  autoAssigner(tacheId: string): Promise<ResultatPlanification> {
    return this.fetch<ResultatPlanification>('/api/planification/auto-assigner', {
      method: 'POST',
      body: JSON.stringify({ tacheId }),
    });
  }

  assignerManuellement(tacheId: string, technicienId: string, heureDebut: string): Promise<ResultatPlanification> {
    return this.fetch<ResultatPlanification>('/api/planification/assigner', {
      method: 'POST',
      body: JSON.stringify({ tacheId, technicienId, heureDebut }),
    });
  }

  getConflits(): Promise<Conflit[]> {
    return this.fetch<Conflit[]>('/api/planification/conflits');
  }

  reaffecter(tacheId: string): Promise<ResultatPlanification> {
    return this.fetch<ResultatPlanification>(`/api/planification/reaffecter/${tacheId}`, {
      method: 'POST',
    });
  }

  optimiser(): Promise<{ message: string; affectationsOptimisees: number }> {
    return this.fetch('/api/planification/optimiser');
  }
}

export const api = new ApiClient();
