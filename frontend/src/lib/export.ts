'use client';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Technicien, Affectation } from '@/types';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ExportData {
  technicien: Technicien;
  affectations: Array<{
    id: string;
    tacheTitre: string;
    tacheDescription?: string;
    date: string;
    heureDebut: string;
    heureFin: string;
    dureeMinutes: number;
    localisation?: string;
    competences: string[];
    priorite: string;
    statut: string;
  }>;
}

export async function exporterPlanningPDF(technicienId: string): Promise<void> {
  try {
    toast.loading('Génération du PDF...', { id: 'pdf-export' });

    // Fetch planning data from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/planification/export/${technicienId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    const data: ExportData = await response.json();
    const { technicien, affectations } = data;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Planning des Interventions', pageWidth / 2, 20, { align: 'center' });

    // Technician info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Technicien: ${technicien.nom}`, pageWidth / 2, 32, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Date of export
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 14, 50);

    // Technician details box
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, 55, pageWidth - 28, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.text(`Email: ${technicien.email}`, 20, 65);
    doc.text(`Localisation: ${technicien.localisation || 'Non spécifiée'}`, 20, 72);
    doc.text(`Compétences: ${technicien.competences.join(', ')}`, pageWidth / 2, 65);

    // Table with affectations
    if (affectations.length > 0) {
      const tableData = affectations.map(aff => [
        aff.date,
        `${aff.heureDebut} - ${aff.heureFin}`,
        aff.tacheTitre,
        aff.localisation || '-',
        aff.priorite,
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['Date', 'Horaires', 'Intervention', 'Lieu', 'Priorité']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [102, 126, 234],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 30 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 35 },
          4: { cellWidth: 25 },
        },
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(150, 150, 150);
      doc.text('Aucune intervention planifiée', pageWidth / 2, 100, { align: 'center' });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} sur ${pageCount} - Planification Intelligente`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`planning_${technicien.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

    toast.success('PDF téléchargé avec succès', { id: 'pdf-export' });
  } catch (error) {
    console.error('Erreur export PDF:', error);
    toast.error('Erreur lors de l\'export PDF', { id: 'pdf-export' });
  }
}

export async function envoyerPlanningEmail(technicienId: string): Promise<void> {
  try {
    toast.loading('Envoi de l\'email...', { id: 'email-send' });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/planification/envoyer-planning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ technicienId }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'envoi');
    }

    const result = await response.json();

    toast.success(result.message || 'Email envoyé avec succès', { id: 'email-send' });

    if (result.previewUrl) {
      // Open preview URL in new tab (for Ethereal testing)
      window.open(result.previewUrl, '_blank');
    }
  } catch (error) {
    console.error('Erreur envoi email:', error);
    toast.error('Erreur lors de l\'envoi de l\'email', { id: 'email-send' });
  }
}
