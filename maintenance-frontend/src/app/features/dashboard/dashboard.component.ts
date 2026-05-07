import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { DashboardStats, Panne, STATUT_PANNE_LABELS, StatutPanne } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Tableau de bord</h1>
        <p class="page-subtitle">Vue générale des opérations · {{ today }}</p>
      </div>
      <a routerLink="/interventions">
        <button mat-flat-button class="btn-primary">
          <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px">add</mat-icon>
          Nouvelle intervention
        </button>
      </a>
    </div>

    <div *ngIf="loading()" class="loading-state">
      <mat-spinner diameter="36"></mat-spinner>
      <p>Chargement des données...</p>
    </div>

    <ng-container *ngIf="!loading() && stats()">
      <!-- KPI cards — each one navigates to the relevant filtered page -->
      <div class="kpi-grid">
        <div class="kpi-card accent clickable" (click)="go('/pannes')">
          <div class="kpi-label">Total pannes</div>
          <div class="kpi-value">{{ pad(stats()!.totalPannes) }}</div>
          <div class="kpi-sub">voir toutes →</div>
        </div>

        <div class="kpi-card amber clickable" (click)="go('/pannes', 'EN_COURS')">
          <div class="kpi-label">Pannes en cours</div>
          <div class="kpi-value">{{ pad(stats()!.pannesEnCours) }}</div>
          <div class="kpi-sub">voir en cours →</div>
        </div>

        <div class="kpi-card green clickable" (click)="go('/pannes', 'RESOLU')">
          <div class="kpi-label">Résolues</div>
          <div class="kpi-value">{{ pad(stats()!.pannesResolues) }}</div>
          <div class="kpi-sub">voir résolues →</div>
        </div>

        <div class="kpi-card blue clickable" (click)="go('/techniciens')">
          <div class="kpi-label">Techniciens dispo</div>
          <div class="kpi-value">{{ pad(stats()!.techniciensDispo) }}</div>
          <div class="kpi-sub">voir techniciens →</div>
        </div>

        <div class="kpi-card red clickable" (click)="go('/interventions')">
          <div class="kpi-label">Coût du mois</div>
          <div class="kpi-value" style="font-size:20px">
            {{ stats()!.coutTotalMois | number: '1.0-0' }}
          </div>
          <div class="kpi-sub">DT total →</div>
        </div>

        <div class="kpi-card accent clickable" (click)="go('/interventions', 'PLANIFIEE')">
          <div class="kpi-label">Interventions planif.</div>
          <div class="kpi-value">{{ pad(stats()!.interventionsPlanifiees) }}</div>
          <div class="kpi-sub">voir planifiées →</div>
        </div>

        <div class="kpi-card amber clickable" (click)="go('/interventions', 'EN_COURS')">
          <div class="kpi-label">Interventions en cours</div>
          <div class="kpi-value">{{ pad(stats()!.interventionsEnCours) }}</div>
          <div class="kpi-sub">voir en cours →</div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="charts-row">
        <!-- Pannes par catégorie -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Pannes par catégorie</span>
          </div>
          <div class="chart-body">
            <div *ngFor="let entry of categorieEntries()" class="bar-row">
              <span class="bar-label">{{ entry[0] }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  [style.width.%]="pct(entry[1], maxCategorie())"
                  [style.background]="barColor(entry[0])"
                ></div>
              </div>
              <span class="bar-num">{{ entry[1] }}</span>
            </div>
            <div *ngIf="categorieEntries().length === 0" class="empty-state">
              <mat-icon>bar_chart</mat-icon>
              <p>Aucune donnée</p>
            </div>
          </div>
        </div>

        <!-- Interventions par statut -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Interventions par statut</span>
          </div>
          <div class="chart-body">
            <div class="statut-row">
              <div class="statut-info">
                <span class="statut-dot" style="background:#6366f1"></span>
                <span class="statut-name">Planifiées</span>
              </div>
              <div class="statut-bar-wrap">
                <div
                  class="statut-bar"
                  style="background:#6366f1"
                  [style.width.%]="pct(stats()!.interventionsPlanifiees, maxInterv())"
                ></div>
              </div>
              <span class="statut-count">{{ stats()!.interventionsPlanifiees }}</span>
            </div>
            <div class="statut-row">
              <div class="statut-info">
                <span class="statut-dot" style="background:#f59e0b"></span>
                <span class="statut-name">En cours</span>
              </div>
              <div class="statut-bar-wrap">
                <div
                  class="statut-bar"
                  style="background:#f59e0b"
                  [style.width.%]="pct(stats()!.interventionsEnCours, maxInterv())"
                ></div>
              </div>
              <span class="statut-count">{{ stats()!.interventionsEnCours }}</span>
            </div>
            <div class="statut-row">
              <div class="statut-info">
                <span class="statut-dot" style="background:#10b981"></span>
                <span class="statut-name">Terminées</span>
              </div>
              <div class="statut-bar-wrap">
                <div
                  class="statut-bar"
                  style="background:#10b981"
                  [style.width.%]="pct(stats()!.interventionsTerminees, maxInterv())"
                ></div>
              </div>
              <span class="statut-count">{{ stats()!.interventionsTerminees }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent pannes -->
      <div class="card" style="margin-top:16px">
        <div class="card-header">
          <span class="card-title">Pannes récentes</span>
          <a routerLink="/pannes" class="see-all">voir tout →</a>
        </div>
        <div *ngFor="let p of recentPannes()" class="panne-row">
          <div class="panne-dot" [class]="'dot-' + p.statut.toLowerCase()"></div>
          <div class="panne-info">
            <span class="panne-desc">{{ p.description }}</span>
            <span class="panne-meta">{{ p.equipementNom }} · {{ p.categorie }}</span>
          </div>
          <span class="badge" [class]="'badge-' + p.statut.toLowerCase()">
            {{ statutLabel(p.statut) }}
          </span>
        </div>
        <div *ngIf="recentPannes().length === 0" class="empty-state">
          <mat-icon>check_circle_outline</mat-icon>
          <p>Aucune panne signalée</p>
        </div>
      </div>
    </ng-container>
  `,
  styles: [
    `
      .kpi-card.clickable {
        cursor: pointer;
      }
      .kpi-card.clickable:hover {
        border-color: var(--border-strong);
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }
      .kpi-card.clickable:hover .kpi-sub {
        color: var(--accent-light);
      }
      .charts-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        margin-bottom: 0;
      }
      .chart-body {
        padding: 14px 18px;
      }
      .bar-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .bar-label {
        width: 90px;
        font-size: 12px;
        color: var(--text-muted);
        flex-shrink: 0;
      }
      .bar-track {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 99px;
        overflow: hidden;
      }
      .bar-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.5s ease;
      }
      .bar-num {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        width: 20px;
        text-align: right;
        font-family: var(--font-mono);
      }
      .statut-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 16px;
      }
      .statut-info {
        display: flex;
        align-items: center;
        gap: 7px;
        width: 90px;
        flex-shrink: 0;
      }
      .statut-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .statut-name {
        font-size: 12px;
        color: var(--text-muted);
      }
      .statut-bar-wrap {
        flex: 1;
        height: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 99px;
        overflow: hidden;
      }
      .statut-bar {
        height: 100%;
        border-radius: 99px;
        transition: width 0.5s ease;
      }
      .statut-count {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        font-family: var(--font-mono);
        min-width: 24px;
        text-align: right;
      }
      .panne-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        transition: background 0.1s;
      }
      .panne-row:hover {
        background: var(--bg-hover);
      }
      .panne-row:last-child {
        border-bottom: none;
      }
      .panne-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .dot-signale {
        background: #f59e0b;
      }
      .dot-en_cours {
        background: #fcd34d;
      }
      .dot-resolu {
        background: #10b981;
      }
      .dot-ferme {
        background: #4a4a6a;
      }
      .panne-info {
        flex: 1;
        min-width: 0;
      }
      .panne-desc {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .panne-meta {
        font-size: 11px;
        color: var(--text-faint);
        display: block;
        margin-top: 2px;
      }
      .see-all {
        font-size: 11px;
        color: var(--accent-light);
        text-decoration: none;
      }
      .see-all:hover {
        text-decoration: underline;
      }
      @media (max-width: 768px) {
        .charts-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentPannes = signal<Panne[]>([]);
  maxCategorie = signal(1);
  maxInterv = signal(1);

  today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  ngOnInit() {
    forkJoin({
      stats: this.api.getDashboardStats(),
      pannes: this.api.getPannes(),
    }).subscribe({
      next: ({ stats, pannes }) => {
        this.stats.set(stats);
        this.recentPannes.set(pannes.slice(0, 5));
        const cats = Object.values(stats.pannesParCategorie);
        this.maxCategorie.set(cats.length ? Math.max(...cats) : 1);
        this.maxInterv.set(
          Math.max(
            stats.interventionsPlanifiees,
            stats.interventionsEnCours,
            stats.interventionsTerminees,
            1,
          ),
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Navigate to a page, optionally storing a filter in sessionStorage
  // The target page reads this filter on init and applies it
  go(path: string, filter?: string) {
    if (filter) {
      sessionStorage.setItem('filter_' + path.replace('/', ''), filter);
    }
    this.router.navigate([path]);
  }

  categorieEntries(): [string, number][] {
    const cat = this.stats()?.pannesParCategorie;
    if (!cat) return [];
    return Object.entries(cat).sort((a, b) => b[1] - a[1]);
  }

  pct(val: number, max: number): number {
    return max > 0 ? Math.round((val / max) * 100) : 0;
  }

  pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  barColor(cat: string): string {
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
    return STATUT_PANNE_LABELS[s as StatutPanne] || s;
  }
}
