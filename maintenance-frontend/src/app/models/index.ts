// ── Enums ────────────────────────────────────────
export type EtatEquipement = 'OPERATIONNEL' | 'EN_PANNE' | 'EN_MAINTENANCE' | 'HORS_SERVICE';

export type StatutPanne = 'SIGNALE' | 'EN_COURS' | 'RESOLU' | 'FERME';

export const STATUT_PANNE_LABELS: Record<StatutPanne, string> = {
  SIGNALE: 'Signalé',
  EN_COURS: 'En cours',
  RESOLU: 'Résolu',
  FERME: 'Fermé',
};

export type PrioritePanne = 'FAIBLE' | 'MOYENNE' | 'CRITIQUE';

export type StatutIntervention = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

// ── Entities ─────────────────────────────────────
export interface Equipement {
  id?: number;
  nom: string;
  etat: EtatEquipement;
  dateAcquisition?: string;
  nombrePannes?: number;
  nombreInterventions?: number;
  localisation?: string;
}

export interface Panne {
  id?: number;
  description: string;
  categorie: string;
  equipementId: number;
  equipementNom?: string;
  dateSignalement?: string;
  statut: StatutPanne;
  priorite?: PrioritePanne;
}

export interface Technicien {
  id?: number;
  nom: string;
  competences: string;
  disponibilite: boolean;
  interventionsEnCours?: number;
  email?: string;
}

export interface Intervention {
  id?: number;
  equipementId: number;
  equipementNom?: string;
  technicienId?: number;
  technicienNom?: string;
  panneId?: number;
  statut: StatutIntervention;
  date: string;
  cout?: number;
  notes?: string;
}

export interface DashboardStats {
  totalPannes: number;
  pannesEnCours: number;
  pannesResolues: number;
  interventionsPlanifiees: number;
  interventionsEnCours: number;
  interventionsTerminees: number;
  techniciensDispo: number;
  coutTotalMois: number;
  pannesParCategorie: Record<string, number>;
  interventionsParStatut: Record<string, number>;
}
