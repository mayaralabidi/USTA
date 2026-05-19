import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ExportService } from '../../core/export.service';
import { Intervention, Panne, DashboardStats } from '../../models';

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Rapport mensuel</h1>
        <p class="page-subtitle">Synthèse des opérations de maintenance</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button mat-flat-button class="btn-ghost" (click)="exportExcel()" [disabled]="loading()">
          <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px"
            >table_chart</mat-icon
          >
          Exporter Excel
        </button>
        <button mat-flat-button class="btn-primary" (click)="printPDF()" [disabled]="loading()">
          <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px"
            >picture_as_pdf</mat-icon
          >
          Exporter PDF
        </button>
      </div>
    </div>

    <div *ngIf="loading()" class="loading-state">
      <mat-spinner diameter="36"></mat-spinner>
      <p>Chargement du rapport...</p>
    </div>

    <!-- Report content — this div is what gets printed -->
    <div id="rapport-content" *ngIf="!loading()">
      <!-- Header band -->
      <div class="report-header">
        <div class="report-logo">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1.5L1.5 5v6L8 14.5 14.5 11V5L8 1.5z"
              stroke="white"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div>
          <div class="report-title">MaintenanceUSTA — Rapport mensuel</div>
          <div class="report-period">{{ periodLabel }} · Généré le {{ today }}</div>
        </div>
      </div>

      <!-- KPI summary -->
      <div class="section-title">Indicateurs clés</div>
      <div class="kpi-grid" *ngIf="stats()">
        <div class="rpt-kpi">
          <div class="rpt-kpi-val">{{ stats()!.totalPannes }}</div>
          <div class="rpt-kpi-label">Pannes totales</div>
        </div>
        <div class="rpt-kpi">
          <div class="rpt-kpi-val" style="color:#10b981">{{ stats()!.pannesResolues }}</div>
          <div class="rpt-kpi-label">Pannes résolues</div>
        </div>
        <div class="rpt-kpi">
          <div class="rpt-kpi-val">{{ stats()!.interventionsTerminees }}</div>
          <div class="rpt-kpi-label">Interventions terminées</div>
        </div>
        <div class="rpt-kpi">
          <div class="rpt-kpi-val" style="color:#f59e0b">
            {{ stats()!.coutTotalMois | number: '1.0-0' }} DT
          </div>
          <div class="rpt-kpi-label">Coût total du mois</div>
        </div>
        <div class="rpt-kpi">
          <div class="rpt-kpi-val">{{ stats()!.techniciensDispo }}</div>
          <div class="rpt-kpi-label">Techniciens disponibles</div>
        </div>
        <div class="rpt-kpi">
          <div class="rpt-kpi-val" style="color:#ef4444">{{ stats()!.pannesEnCours }}</div>
          <div class="rpt-kpi-label">Pannes en cours</div>
        </div>
      </div>

      <!-- Pannes par catégorie -->
      <div class="section-title" style="margin-top:28px">Pannes par catégorie</div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th style="text-align:right">Nombre</th>
              <th style="text-align:right">% du total</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of catEntries()">
              <td>
                <span class="cat-dot" [style.background]="catColor(entry[0])"></span>
                {{ entry[0] }}
              </td>
              <td style="text-align:right;font-family:var(--font-mono);font-weight:600">
                {{ entry[1] }}
              </td>
              <td style="text-align:right;color:var(--text-muted)">
                {{ pct(entry[1]) | number: '1.0-1' }}%
              </td>
            </tr>
            <tr class="total-row">
              <td><strong>Total</strong></td>
              <td style="text-align:right">
                <strong>{{ stats()?.totalPannes }}</strong>
              </td>
              <td style="text-align:right"><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Interventions du mois -->
      <div class="section-title" style="margin-top:28px">
        Interventions du mois
        <span class="section-count">{{ monthInterventions().length }}</span>
      </div>
      <div class="rpt-table-wrap">
        <table class="rpt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Équipement</th>
              <th>Technicien</th>
              <th>Date</th>
              <th>Statut</th>
              <th style="text-align:right">Coût (DT)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of monthInterventions()">
              <td style="font-family:var(--font-mono);color:var(--text-faint)">{{ i.id }}</td>
              <td style="font-weight:500;color:var(--text-primary)">
                {{ i.equipementNom || '—' }}
              </td>
              <td>{{ i.technicienNom || 'Non assigné' }}</td>
              <td style="font-size:12px">{{ i.date | date: 'dd/MM/yyyy' }}</td>
              <td>
                <span class="badge" [class]="'badge-' + i.statut.toLowerCase()">
                  {{ statutLabel(i.statut) }}
                </span>
              </td>
              <td style="text-align:right;font-family:var(--font-mono);font-weight:600">
                {{ i.cout ? (i.cout | number: '1.0-0') : '—' }}
              </td>
            </tr>
            <tr *ngIf="monthInterventions().length === 0">
              <td colspan="6" style="text-align:center;color:var(--text-muted);padding:20px">
                Aucune intervention ce mois
              </td>
            </tr>
          </tbody>
          <tfoot *ngIf="monthInterventions().length > 0">
            <tr class="total-row">
              <td colspan="5"><strong>Coût total</strong></td>
              <td style="text-align:right">
                <strong>{{ totalCout() | number: '1.0-0' }} DT</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Footer -->
      <div class="report-footer">
        MaintenanceUSTA · Rapport généré automatiquement · {{ today }}
      </div>
    </div>
  `,
  styles: [
    `
      .report-header {
        display: flex;
        align-items: center;
        gap: 14px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: var(--radius-lg);
        padding: 18px 20px;
        margin-bottom: 24px;
      }
      .report-logo {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .report-title {
        font-size: 15px;
        font-weight: 600;
        color: #fff;
      }
      .report-period {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
        margin-top: 2px;
      }

      .section-title {
        font-size: 10px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-count {
        background: var(--accent-dim);
        color: var(--accent-light);
        font-size: 10px;
        padding: 1px 8px;
        border-radius: 99px;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
      .rpt-kpi {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 14px 16px;
      }
      .rpt-kpi-val {
        font-size: 24px;
        font-weight: 600;
        font-family: var(--font-mono);
        color: var(--text-primary);
        line-height: 1;
        margin-bottom: 5px;
      }
      .rpt-kpi-label {
        font-size: 11px;
        color: var(--text-muted);
      }

      .rpt-table-wrap {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }
      .rpt-table {
        width: 100%;
        border-collapse: collapse;
      }
      .rpt-table th {
        font-size: 10px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.07em;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--border);
      }
      .rpt-table td {
        font-size: 12px;
        color: var(--text-secondary);
        padding: 10px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .rpt-table tr:last-child td {
        border-bottom: none;
      }
      .rpt-table tr:hover td {
        background: var(--bg-hover);
      }
      .total-row td {
        background: rgba(255, 255, 255, 0.02) !important;
        border-top: 1px solid var(--border) !important;
        font-size: 12px;
      }
      .cat-dot {
        display: inline-block;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        margin-right: 8px;
        vertical-align: middle;
      }
      .report-footer {
        text-align: center;
        font-size: 11px;
        color: var(--text-faint);
        padding: 24px 0 8px;
        border-top: 1px solid var(--border);
        margin-top: 28px;
      }

      /* Print styles — clean white output */
      @media print {
        :host {
          background: #fff !important;
        }
        .page-header button {
          display: none !important;
        }
        .report-header {
          background: #6366f1 !important;
          -webkit-print-color-adjust: exact;
        }
        .rpt-kpi {
          border: 1px solid #ddd !important;
          background: #f9f9f9 !important;
        }
        .rpt-kpi-val {
          color: #111 !important;
        }
        .rpt-kpi-label {
          color: #666 !important;
        }
        .rpt-table th {
          color: #666 !important;
          background: #f5f5f5 !important;
        }
        .rpt-table td {
          color: #333 !important;
        }
        .section-title {
          color: #666 !important;
        }
      }
    `,
  ],
})
export class RapportComponent implements OnInit {
  private api = inject(ApiService);
  private exporter = inject(ExportService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  interventions = signal<Intervention[]>([]);
  pannes = signal<Panne[]>([]);

  today = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  periodLabel = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  ngOnInit() {
    forkJoin({
      stats: this.api.getDashboardStats(),
      interventions: this.api.getInterventions(),
      pannes: this.api.getPannes(),
    }).subscribe({
      next: (res) => {
        this.stats.set(res.stats);
        this.interventions.set(res.interventions);
        this.pannes.set(res.pannes);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Interventions in the current month
  monthInterventions(): Intervention[] {
    const now = new Date();
    return this.interventions().filter((i) => {
      const d = new Date(i.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }

  totalCout(): number {
    return this.monthInterventions().reduce((sum, i) => sum + (i.cout || 0), 0);
  }

  catEntries(): [string, number][] {
    const cat = this.stats()?.pannesParCategorie;
    if (!cat) return [];
    return Object.entries(cat).sort((a, b) => b[1] - a[1]);
  }

  pct(val: number): number {
    const total = this.stats()?.totalPannes || 1;
    return (val / total) * 100;
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

  statutLabel(s: string): string {
    const m: Record<string, string> = {
      PLANIFIEE: 'Planifiée',
      EN_COURS: 'En cours',
      TERMINEE: 'Terminée',
      ANNULEE: 'Annulée',
    };
    return m[s] || s;
  }

  printPDF() {
    window.print();
  }

  exportExcel() {
    this.exporter.exportInterventions(this.monthInterventions());
  }
}
