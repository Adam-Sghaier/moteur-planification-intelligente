'use client';

import { Technicien } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, MapPin, Wrench, Download, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { exporterPlanningPDF, envoyerPlanningEmail } from '@/lib/export';

interface TechnicianCardProps {
  technicien: Technicien;
  heuresUtilisees?: number;
  isSelected?: boolean;
  onClick?: () => void;
  showActions?: boolean;
}

export function TechnicianCard({
  technicien,
  heuresUtilisees = 0,
  isSelected,
  onClick,
  showActions = false,
}: TechnicianCardProps) {
  const heuresRestantes = technicien.limiteHeuresHebdo - heuresUtilisees;
  const pourcentageUtilise = (heuresUtilisees / technicien.limiteHeuresHebdo) * 100;

  const estDisponible = heuresRestantes > 0 && technicien.estActif;

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    exporterPlanningPDF(technicien.id);
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    envoyerPlanningEmail(technicien.id);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border rounded-lg p-4 transition-all cursor-pointer hover:shadow-md',
        isSelected && 'ring-2 ring-blue-500 border-blue-500',
        !technicien.estActif && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{technicien.nom}</h4>
            <p className="text-sm text-gray-500">{technicien.email}</p>
          </div>
        </div>
        <Badge variant={estDisponible ? 'success' : 'danger'}>
          {estDisponible ? 'Disponible' : 'Occupé'}
        </Badge>
      </div>

      {technicien.localisation && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{technicien.localisation}</span>
        </div>
      )}

      {technicien.competences.length > 0 && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <Wrench className="w-4 h-4" />
          <span className="truncate">{technicien.competences.join(', ')}</span>
        </div>
      )}

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Capacité hebdo</span>
          <span className="font-medium">
            {heuresUtilisees}h / {technicien.limiteHeuresHebdo}h
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              pourcentageUtilise > 90 ? 'bg-red-500' :
                pourcentageUtilise > 70 ? 'bg-yellow-500' : 'bg-green-500'
            )}
            style={{ width: `${Math.min(pourcentageUtilise, 100)}%` }}
          />
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEmail}
            className="flex-1"
          >
            <Mail className="w-3 h-3 mr-1" />
            Email
          </Button>
        </div>
      )}
    </div>
  );
}
