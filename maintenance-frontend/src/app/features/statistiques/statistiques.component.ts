import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Equipement, Intervention, Technicien, Panne } from '../../models';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Statistiques</h1>
        <p class="page-subtitle">Analyse des performances de maintenance</p>
      </div>
    </div>

    <div *ngIf="loading()" class="loading-state">
      <mat-spinner diameter="36"></mat-spinner>
      <p>Calcul des statistiques...</p>
    </div>

    <ng-container *ngIf="!loading()">
      <!-- Row 1: Cost per equipement -->
      <div class="section-title">
        <mat-icon>payments</mat-icon>
        Coût de maintenance par équipement
      </div>
      <div class="card" style="margin-bottom:20px">
        <table class="stat-table">
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Localisation</th>
              <th>État</th>
              <th style="text-align:right">Nb interventions</th>
              <th style="text-align:right">Coût total (DT)</th>
              <th style="text-align:right">Coût moyen (DT)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of coutParEquipement()">
              <td style="font-weight:500;color:var(--text-primary)">{{ row.nom }}</td>
              <td style="font-size:12px;color:var(--text-faint)">{{ row.localisation || '—' }}</td>
              <td>
                <span class="badge" [class]="'badge-' + row.etat.toLowerCase()">{{
                  etatLabel(row.etat)
                }}</span>
              </td>
              <td style="text-align:right;font-family:var(--font-mono)">
                {{ row.nbInterventions }}
              </td>
              <td
                style="text-align:right;font-family:var(--font-mono);font-weight:600;color:var(--text-primary)"
              >
                {{ row.coutTotal | number: '1.0-0' }}
              </td>
              <td style="text-align:right;font-family:var(--font-mono);color:var(--text-muted)">
                {{ row.coutMoyen | number: '1.0-0' }}
              </td>
            </tr>
            <tr *ngIf="coutParEquipement().length === 0">
              <td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">
                Aucune donnée
              </td>
            </tr>
          </tbody>
          <tfoot *ngIf="coutParEquipement().length > 0">
            <tr class="total-row">
              <td colspan="4"><strong>Total général</strong></td>
              <td style="text-align:right">
                <strong style="font-family:var(--font-mono)"
                  >{{ grandTotalCout() | number: '1.0-0' }} DT</strong
                >
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Row 2: Technicien performance + Pannes par categorie side by side -->
      <div class="two-col">
        <!-- Technicien performance -->
        <div>
          <div class="section-title">
            <mat-icon>engineering</mat-icon>
            Performance des techniciens
          </div>
          <div class="card">
            <table class="stat-table">
              <thead>
                <tr>
                  <th>Technicien</th>
                  <th style="text-align:right">Total</th>
                  <th style="text-align:right">Terminées</th>
                  <th style="text-align:right">En cours</th>
                  <th style="text-align:right">Taux</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of technicienPerf()">
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div class="mini-avatar" [style.background]="avatarColor(row.nom)">
                        {{ row.nom[0] }}
                      </div>
                      <div>
                        <div style="font-size:13px;font-weight:500;color:var(--text-primary)">
                          {{ row.nom }}
                        </div>
                        <div style="font-size:10px;color:var(--text-faint)">
                          {{ row.disponibilite ? 'Disponible' : 'Non disponible' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align:right;font-family:var(--font-mono)">{{ row.total }}</td>
                  <td style="text-align:right;font-family:var(--font-mono);color:#34d399">
                    {{ row.terminees }}
                  </td>
                  <td style="text-align:right;font-family:var(--font-mono);color:#fbbf24">
                    {{ row.enCours }}
                  </td>
                  <td style="text-align:right">
                    <span
                      [style.color]="
                        row.taux >= 70 ? '#34d399' : row.taux >= 40 ? '#fbbf24' : '#f87171'
                      "
                      style="font-weight:600;font-size:12px;font-family:var(--font-mono)"
                    >
                      {{ row.taux }}%
                    </span>
                  </td>
                </tr>
                <tr *ngIf="technicienPerf().length === 0">
                  <td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px">
                    Aucune donnée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pannes par categorie -->
        <div>
          <div class="section-title">
            <mat-icon>warning_amber</mat-icon>
            Pannes par catégorie
          </div>
          <div class="card">
            <div style="padding:16px 18px">
              <div *ngFor="let entry of pannesParCategorie()" class="cat-row">
                <div
                  style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px"
                >
                  <span style="font-size:12px;font-weight:500;color:var(--text-secondary)">{{
                    entry.categorie
                  }}</span>
                  <span
                    style="font-size:12px;font-family:var(--font-mono);color:var(--text-primary);font-weight:600"
                  >
                    {{ entry.count }}
                    <span style="color:var(--text-faint);font-weight:400">({{ entry.pct }}%)</span>
                  </span>
                </div>
                <div class="cat-bar-track">
                  <div
                    class="cat-bar-fill"
                    [style.width]="entry.pct + '%'"
                    [style.background]="catColor(entry.categorie)"
                  ></div>
                </div>
              </div>
              <div
                *ngIf="pannesParCategorie().length === 0"
                style="text-align:center;color:var(--text-muted);padding:24px"
              >
                Aucune panne enregistrée
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Priority summary -->
      <div class="section-title" style="margin-top:20px">
        <mat-icon>priority_high</mat-icon>
        Répartition par priorité
      </div>
      <div class="priority-row">
        <div class="priority-card critique">
          <div class="priority-val">{{ prioriteCount('CRITIQUE') }}</div>
          <div class="priority-label">Critique</div>
        </div>
        <div class="priority-card moyenne">
          <div class="priority-val">{{ prioriteCount('MOYENNE') }}</div>
          <div class="priority-label">Moyenne</div>
        </div>
        <div class="priority-card faible">
          <div class="priority-val">{{ prioriteCount('FAIBLE') }}</div>
          <div class="priority-label">Faible</div>
        </div>
        <div class="priority-card total">
          <div class="priority-val">{{ pannes().length }}</div>
          <div class="priority-label">Total pannes</div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 10px;
      }
      .section-title mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .stat-table {
        width: 100%;
        border-collapse: collapse;
      }
      .stat-table th {
        font-size: 10px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.07em;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--border);
      }
      .stat-table td {
        font-size: 13px;
        color: var(--text-secondary);
        padding: 11px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .stat-table tr:last-child td {
        border-bottom: none;
      }
      .stat-table tr:hover td {
        background: var(--bg-hover);
      }
      .total-row td {
        background: rgba(255, 255, 255, 0.02) !important;
        border-top: 1px solid var(--border) !important;
        padding: 10px 16px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 0;
      }
      .mini-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .cat-row {
        margin-bottom: 14px;
      }
      .cat-bar-track {
        height: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 99px;
        overflow: hidden;
      }
      .cat-bar-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.5s ease;
      }
      .priority-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-top: 0;
      }
      .priority-card {
        border-radius: var(--radius-lg);
        padding: 20px;
        text-align: center;
        border: 1px solid var(--border);
      }
      .priority-card.critique {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.2);
      }
      .priority-card.moyenne {
        background: rgba(245, 158, 11, 0.08);
        border-color: rgba(245, 158, 11, 0.2);
      }
      .priority-card.faible {
        background: rgba(16, 185, 129, 0.08);
        border-color: rgba(16, 185, 129, 0.2);
      }
      .priority-card.total {
        background: var(--bg-surface);
      }
      .priority-val {
        font-size: 32px;
        font-weight: 700;
        font-family: var(--font-mono);
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: 6px;
      }
      .priority-card.critique .priority-val {
        color: #f87171;
      }
      .priority-card.moyenne .priority-val {
        color: #fbbf24;
      }
      .priority-card.faible .priority-val {
        color: #34d399;
      }
      .priority-label {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      @media (max-width: 768px) {
        .two-col {
          grid-template-columns: 1fr;
        }
        .priority-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `,
  ],
})
export class StatistiquesComponent implements OnInit {
  private api = inject(ApiService);

  equipements = signal<Equipement[]>([]);
  interventions = signal<Intervention[]>([]);
  techniciens = signal<Technicien[]>([]);
  pannes = signal<Panne[]>([]);
  loading = signal(true);

  ngOnInit() {
    forkJoin({
      eq: this.api.getEquipements(),
      iv: this.api.getInterventions(),
      tech: this.api.getTechniciens(),
      panne: this.api.getPannes(),
    }).subscribe({
      next: (res) => {
        this.equipements.set(res.eq);
        this.interventions.set(res.iv);
        this.techniciens.set(res.tech);
        this.pannes.set(res.panne);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Cost per equipement — aggregated from interventions
  coutParEquipement = computed(() => {
    return this.equipements()
      .map((eq) => {
        const eqInterventions = this.interventions().filter((i) => i.equipementId === eq.id);
        const coutTotal = eqInterventions.reduce((s, i) => s + (i.cout || 0), 0);
        const nb = eqInterventions.length;
        return {
          id: eq.id,
          nom: eq.nom,
          etat: eq.etat,
          localisation: (eq as any).localisation,
          nbInterventions: nb,
          coutTotal,
          coutMoyen: nb > 0 ? Math.round(coutTotal / nb) : 0,
        };
      })
      .sort((a, b) => b.coutTotal - a.coutTotal);
  });

  grandTotalCout = computed(() => this.coutParEquipement().reduce((s, r) => s + r.coutTotal, 0));

  // Technicien performance
  technicienPerf = computed(() => {
    return this.techniciens()
      .map((t) => {
        const mine = this.interventions().filter((i) => i.technicienId === t.id);
        const terminees = mine.filter((i) => i.statut === 'TERMINEE').length;
        const enCours = mine.filter((i) => i.statut === 'EN_COURS').length;
        const total = mine.length;
        const taux = total > 0 ? Math.round((terminees / total) * 100) : 0;
        return { nom: t.nom, disponibilite: t.disponibilite, total, terminees, enCours, taux };
      })
      .sort((a, b) => b.terminees - a.terminees);
  });

  // Pannes par categorie with percentages
  pannesParCategorie = computed(() => {
    const total = this.pannes().length || 1;
    const map: Record<string, number> = {};
    this.pannes().forEach((p) => {
      map[p.categorie] = (map[p.categorie] || 0) + 1;
    });
    return Object.entries(map)
      .map(([categorie, count]) => ({
        categorie,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  });

  prioriteCount(p: string): number {
    return this.pannes().filter((panne) => (panne as any).priorite === p).length;
  }

  etatLabel(e: string): string {
    const m: Record<string, string> = {
      OPERATIONNEL: 'Opérationnel',
      EN_PANNE: 'En panne',
      EN_MAINTENANCE: 'En maintenance',
      HORS_SERVICE: 'Hors service',
    };
    return m[e] || e;
  }

  catColor(cat: string): string {
    const map: Record<string, string> = {
      Électrique: '#6366f1',
      Mécanique: '#f59e0b',
      Hydraulique: '#10b981',
      Pneumatique: '#ef4444',
      Informatique: '#3b82f6',
      Autre: '#8b5cf6',
    };
    return map[cat] || '#6366f1';
  }

  avatarColor(nom: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
