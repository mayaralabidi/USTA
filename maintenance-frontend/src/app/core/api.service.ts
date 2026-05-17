import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Equipement,
  Panne,
  Technicien,
  Intervention,
  DashboardStats,
  StatutIntervention,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ── Equipements ──────────────────────────────
  getEquipements(): Observable<Equipement[]> {
    return this.http.get<Equipement[]>(`${this.base}/equipements`);
  }
  createEquipement(data: Partial<Equipement>): Observable<Equipement> {
    return this.http.post<Equipement>(`${this.base}/equipements`, data);
  }
  updateEquipement(id: number, data: Partial<Equipement>): Observable<Equipement> {
    return this.http.put<Equipement>(`${this.base}/equipements/${id}`, data);
  }
  deleteEquipement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/equipements/${id}`);
  }

  // ── Pannes ───────────────────────────────────
  getPannes(): Observable<Panne[]> {
    return this.http.get<Panne[]>(`${this.base}/pannes`);
  }
  createPanne(data: Partial<Panne>): Observable<Panne> {
    return this.http.post<Panne>(`${this.base}/pannes`, data);
  }
  updatePanne(id: number, data: Partial<Panne>): Observable<Panne> {
    return this.http.put<Panne>(`${this.base}/pannes/${id}`, data);
  }
  deletePanne(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/pannes/${id}`);
  }

  // ── Techniciens ──────────────────────────────
  getTechniciens(): Observable<Technicien[]> {
    return this.http.get<Technicien[]>(`${this.base}/techniciens`);
  }
  getTechniciensDisponibles(): Observable<Technicien[]> {
    return this.http.get<Technicien[]>(`${this.base}/techniciens/disponibles`);
  }
  createTechnicien(data: Partial<Technicien>): Observable<Technicien> {
    return this.http.post<Technicien>(`${this.base}/techniciens`, data);
  }
  updateTechnicien(id: number, data: Partial<Technicien>): Observable<Technicien> {
    return this.http.put<Technicien>(`${this.base}/techniciens/${id}`, data);
  }
  deleteTechnicien(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/techniciens/${id}`);
  }

  // ── Interventions ────────────────────────────
  getInterventions(): Observable<Intervention[]> {
    return this.http.get<Intervention[]>(`${this.base}/interventions`);
  }
  createIntervention(data: Partial<Intervention>): Observable<Intervention> {
    return this.http.post<Intervention>(`${this.base}/interventions`, data);
  }
  updateIntervention(id: number, data: Partial<Intervention>): Observable<Intervention> {
    return this.http.put<Intervention>(`${this.base}/interventions/${id}`, data);
  }
  updateStatut(id: number, statut: StatutIntervention): Observable<Intervention> {
    return this.http.patch<Intervention>(`${this.base}/interventions/${id}/statut`, { statut });
  }
  deleteIntervention(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/interventions/${id}`);
  }

  // ── Dashboard ────────────────────────────────
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard/stats`);
  }

  // ── Admin ────────────────────────────────────
  createUser(data: { username: string; password: string; role: 'ADMIN' | 'TECHNICIEN' }) {
    return this.http.post<void>(`${this.base}/admin/users`, data);
  }
}
