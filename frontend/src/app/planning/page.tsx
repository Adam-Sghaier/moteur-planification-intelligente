'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { api } from '@/lib/api';
import { WeekView } from '@/components/Calendar/WeekView';
import { TaskList } from '@/components/Tasks/TaskList';
import { TaskDetails } from '@/components/Tasks/TaskDetails';
import { TaskCard } from '@/components/Calendar/TaskCard';
import { TechnicianList } from '@/components/Technicians/TechnicianList';
import { AssignModal } from '@/components/Tasks/AssignModal';
import {
  useTechniciens,
  useTachesEnAttente,
  useConflits,
  useAssignerManuellement
} from '@/hooks/usePlanification';
import { useStore } from '@/store/useStore';
import { useQuery } from '@tanstack/react-query';
import { LogOut, Calendar, ClipboardList, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tache, Technicien } from '@/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type TabType = 'taches' | 'techniciens';

interface PendingAssignment {
  tache: Tache;
  technicien: Technicien;
  date: Date;
}

export default function PlanningPage() {
  const router = useRouter();
  const { setAuthenticated } = useStore();
  const [draggedTache, setDraggedTache] = useState<Tache | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('taches');
  const [pendingAssignment, setPendingAssignment] = useState<PendingAssignment | null>(null);

  const assignerManuellement = useAssignerManuellement();

  // Check auth on mount
  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Data fetching
  const { data: techniciens = [], isLoading: loadingTech } = useTechniciens();
  const { data: tachesEnAttente = [], isLoading: loadingTaches } = useTachesEnAttente();
  const { data: conflits = [] } = useConflits();

  // Fetch affectations for each technician
  const { data: affectationsParTechnicien = {} } = useQuery({
    queryKey: ['affectations', 'all', techniciens.map(t => t.id)],
    queryFn: async () => {
      const result: Record<string, any[]> = {};
      for (const tech of techniciens) {
        try {
          const affs = await api.getAffectationsTechnicien(tech.id);
          result[tech.id] = affs;
        } catch {
          result[tech.id] = [];
        }
      }
      return result;
    },
    enabled: techniciens.length > 0,
  });

  // Calculate hours per technician
  const heuresParTechnicien: Record<string, number> = {};
  Object.entries(affectationsParTechnicien).forEach(([techId, affs]) => {
    heuresParTechnicien[techId] = affs.reduce((total, aff) => {
      const debut = new Date(aff.heureDebut);
      const fin = new Date(aff.heureFin);
      return total + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
    }, 0);
  });

  const handleLogout = () => {
    api.logout();
    setAuthenticated(false);
    toast.success('Déconnexion réussie');
    router.push('/login');
  };

  const handleDragStart = (event: DragStartEvent) => {
    const tache = tachesEnAttente.find((t) => t.id === event.active.id);
    setDraggedTache(tache || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedTache(null);

    const { active, over } = event;
    if (!over) return;

    const tacheId = active.id as string;
    const tache = tachesEnAttente.find(t => t.id === tacheId);
    const dropData = over.data.current as { technicien: Technicien; date: Date } | undefined;

    if (!dropData || !tache) return;

    // Open modal for time selection instead of direct assignment
    setPendingAssignment({
      tache,
      technicien: dropData.technicien,
      date: new Date(dropData.date),
    });
  };

  const handleConfirmAssignment = (heureDebut: string) => {
    if (!pendingAssignment) return;

    assignerManuellement.mutate({
      tacheId: pendingAssignment.tache.id,
      technicienId: pendingAssignment.technicien.id,
      heureDebut,
    }, {
      onSuccess: () => {
        setPendingAssignment(null);
      },
      onError: () => {
        // Keep modal open on error
      },
    });
  };

  const handleCloseAssignModal = () => {
    setPendingAssignment(null);
  };

  const isLoading = loadingTech || loadingTaches;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Planification Intelligente
                </h1>
                <p className="text-sm text-gray-500">
                  Gestion des interventions techniques
                </p>
              </div>
            </div>

            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 border-r bg-white shadow-sm overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('taches')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                  activeTab === 'taches'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <ClipboardList className="w-4 h-4" />
                Tâches
              </button>
              <button
                onClick={() => setActiveTab('techniciens')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                  activeTab === 'techniciens'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Users className="w-4 h-4" />
                Techniciens
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'taches' ? (
                <TaskList
                  taches={tachesEnAttente}
                  conflits={conflits}
                  isLoading={loadingTaches}
                />
              ) : (
                <TechnicianList
                  techniciens={techniciens}
                  heuresParTechnicien={heuresParTechnicien}
                  isLoading={loadingTech}
                />
              )}
            </div>
          </aside>

          {/* Calendar */}
          <main className="flex-1 overflow-hidden">
            <WeekView
              techniciens={techniciens}
              affectationsParTechnicien={affectationsParTechnicien}
              conflits={conflits}
              isLoading={isLoading}
            />
          </main>
        </div>

        {/* Task Details Modal */}
        <TaskDetails />

        {/* Assignment Modal */}
        <AssignModal
          isOpen={!!pendingAssignment}
          onClose={handleCloseAssignModal}
          onConfirm={handleConfirmAssignment}
          tache={pendingAssignment?.tache || null}
          technicien={pendingAssignment?.technicien || null}
          date={pendingAssignment?.date || null}
          isLoading={assignerManuellement.isPending}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedTache && <TaskCard tache={draggedTache} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
