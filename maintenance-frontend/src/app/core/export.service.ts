import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Equipement, Panne, Technicien, Intervention } from '../models';

@Injectable({ providedIn: 'root' })
export class ExportService {
  // ── Generic download helper ──────────────────────────────────
  private download(data: any[], sheetName: string, fileName: string) {
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? '').length)) + 2,
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${this.dateStamp()}.xlsx`);
  }

  // ── Equipements ──────────────────────────────────────────────
  exportEquipements(data: Equipement[]) {
    const rows = data.map((e) => ({
      ID: e.id,
      Nom: e.nom,
      État: this.etatLabel(e.etat),
      'Date acquisition': e.dateAcquisition || '—',
      'Nb pannes': e.nombrePannes ?? 0,
      'Nb interventions': e.nombreInterventions ?? 0,
    }));
    this.download(rows, 'Équipements', 'equipements');
  }

  // ── Pannes ───────────────────────────────────────────────────
  exportPannes(data: Panne[]) {
    const rows = data.map((p) => ({
      ID: p.id,
      Description: p.description,
      Catégorie: p.categorie,
      Équipement: p.equipementNom || '—',
      'Date signalement': p.dateSignalement
        ? new Date(p.dateSignalement).toLocaleDateString('fr-FR')
        : '—',
      Statut: this.statutPanneLabel(p.statut),
    }));
    this.download(rows, 'Pannes', 'pannes');
  }

  // ── Techniciens ──────────────────────────────────────────────
  exportTechniciens(data: Technicien[]) {
    const rows = data.map((t) => ({
      ID: t.id,
      Nom: t.nom,
      Compétences: t.competences || '—',
      Disponibilité: t.disponibilite ? 'Disponible' : 'Non disponible',
      'Interventions en cours': t.interventionsEnCours ?? 0,
    }));
    this.download(rows, 'Techniciens', 'techniciens');
  }

  // ── Interventions ────────────────────────────────────────────
  exportInterventions(data: Intervention[]) {
    const rows = data.map((i) => ({
      ID: i.id,
      Équipement: i.equipementNom || '—',
      Technicien: i.technicienNom || 'Non assigné',
      'Panne liée': i.panneId || '—',
      Date: i.date ? new Date(i.date).toLocaleDateString('fr-FR') : '—',
      Statut: this.statutIntervLabel(i.statut),
      'Coût (DT)': i.cout ?? 0,
      Notes: i.notes || '—',
    }));
    this.download(rows, 'Interventions', 'interventions');
  }

  // ── Labels ───────────────────────────────────────────────────
  private etatLabel(e: string): string {
    const m: Record<string, string> = {
      OPERATIONNEL: 'Opérationnel',
      EN_PANNE: 'En panne',
      EN_MAINTENANCE: 'En maintenance',
      HORS_SERVICE: 'Hors service',
    };
    return m[e] || e;
  }

  private statutPanneLabel(s: string): string {
    const m: Record<string, string> = {
      SIGNALE: 'Signalé',
      EN_COURS: 'En cours',
      RESOLU: 'Résolu',
      FERME: 'Fermé',
    };
    return m[s] || s;
  }

  private statutIntervLabel(s: string): string {
    const m: Record<string, string> = {
      PLANIFIEE: 'Planifiée',
      EN_COURS: 'En cours',
      TERMINEE: 'Terminée',
      ANNULEE: 'Annulée',
    };
    return m[s] || s;
  }

  private dateStamp(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
