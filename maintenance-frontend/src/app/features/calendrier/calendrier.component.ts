import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Intervention, StatutIntervention, STATUT_INTERVENTION_LABELS } from '../../models';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  interventions: Intervention[];
}

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink,
  ],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Calendrier des interventions</h1>
        <p class="page-subtitle">
          {{ monthLabel() }} · {{ interventions().length }} intervention(s)
        </p>
      </div>
      <a routerLink="/interventions">
        <button mat-flat-button class="btn-primary">
          <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px">add</mat-icon>
          Planifier
        </button>
      </a>
    </div>

    <!-- Navigation + legend -->
    <div
      style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;"
    >
      <div style="display:flex;align-items:center;gap:8px;">
        <button mat-icon-button (click)="prevMonth()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <span
          style="font-size:15px;font-weight:600;color:var(--text-primary);min-width:140px;text-align:center"
        >
          {{ monthLabel() }}
        </span>
        <button mat-icon-button (click)="nextMonth()">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button mat-button class="btn-ghost" style="font-size:11px;height:28px" (click)="goToday()">
          Aujourd'hui
        </button>
      </div>

      <!-- Legend -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div class="legend-item" *ngFor="let s of statuts">
          <span class="legend-dot" [style.background]="statutColor(s)"></span>
          <span>{{ statutLabel(s) }}</span>
        </div>
      </div>
    </div>

    <div *ngIf="loading()" class="loading-state">
      <mat-spinner diameter="36"></mat-spinner>
      <p>Chargement...</p>
    </div>

    <div *ngIf="!loading()" class="card" style="overflow:visible">
      <!-- Day headers -->
      <div class="cal-header">
        <div *ngFor="let d of dayNames" class="cal-day-name">{{ d }}</div>
      </div>

      <!-- Calendar grid -->
      <div class="cal-grid">
        <div
          *ngFor="let day of calendarDays()"
          class="cal-cell"
          [class.other-month]="!day.isCurrentMonth"
          [class.today]="day.isToday"
          [class.has-events]="day.interventions.length > 0"
        >
          <div class="cal-date">{{ day.date.getDate() }}</div>

          <div class="cal-events">
            <div
              *ngFor="let i of day.interventions.slice(0, 3)"
              class="cal-event"
              [style.background]="statutColor(i.statut) + '22'"
              [style.border-left]="'2px solid ' + statutColor(i.statut)"
              [matTooltip]="i.equipementNom + (i.technicienNom ? ' · ' + i.technicienNom : '')"
              matTooltipPosition="above"
            >
              <span class="cal-event-dot" [style.background]="statutColor(i.statut)"></span>
              <span class="cal-event-text">{{ i.equipementNom }}</span>
            </div>
            <div *ngIf="day.interventions.length > 3" class="cal-more">
              +{{ day.interventions.length - 3 }} autre(s)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected day detail -->
    <div
      *ngIf="selectedDay() && selectedDay()!.interventions.length > 0"
      class="card day-detail"
      style="margin-top:14px"
    >
      <div class="card-header">
        <span class="card-title">
          {{ selectedDay()!.date | date: 'EEEE dd MMMM' : '' : 'fr' }}
          — {{ selectedDay()!.interventions.length }} intervention(s)
        </span>
      </div>
      <div *ngFor="let i of selectedDay()!.interventions" class="detail-row">
        <span class="detail-dot" [style.background]="statutColor(i.statut)"></span>
        <div class="detail-info">
          <span class="detail-equip">{{ i.equipementNom }}</span>
          <span class="detail-tech">{{ i.technicienNom || 'Non assigné' }}</span>
        </div>
        <span class="badge" [class]="'badge-' + i.statut.toLowerCase()">{{
          statutLabel(i.statut)
        }}</span>
        <span
          *ngIf="i.cout"
          style="font-size:12px;font-family:var(--font-mono);color:var(--text-muted)"
        >
          {{ i.cout | number: '1.0-0' }} DT
        </span>
      </div>
    </div>
  `,
  styles: [
    `
      .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: var(--text-muted);
      }
      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .cal-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        border-bottom: 1px solid var(--border);
      }
      .cal-day-name {
        font-size: 10px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 10px 0;
        text-align: center;
      }

      .cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }
      .cal-cell {
        min-height: 96px;
        padding: 8px;
        border-right: 1px solid var(--border);
        border-bottom: 1px solid var(--border);
        transition: background 0.1s;
        cursor: default;
      }
      .cal-cell:nth-child(7n) {
        border-right: none;
      }
      .cal-cell.other-month {
        opacity: 0.35;
      }
      .cal-cell.today {
        background: rgba(99, 102, 241, 0.06);
      }
      .cal-cell.today .cal-date {
        background: var(--accent);
        color: #fff;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cal-date {
        font-size: 12px;
        font-weight: 500;
        color: var(--text-muted);
        margin-bottom: 4px;
        font-family: var(--font-mono);
      }
      .cal-events {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cal-event {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 5px;
        border-radius: 3px;
        cursor: pointer;
        transition: opacity 0.1s;
      }
      .cal-event:hover {
        opacity: 0.8;
      }
      .cal-event-dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .cal-event-text {
        font-size: 10px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cal-more {
        font-size: 9px;
        color: var(--text-faint);
        padding: 1px 5px;
      }

      .day-detail {
      }
      .detail-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .detail-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .detail-info {
        flex: 1;
        min-width: 0;
      }
      .detail-equip {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
        display: block;
      }
      .detail-tech {
        font-size: 11px;
        color: var(--text-faint);
        display: block;
        margin-top: 1px;
      }

      @media (max-width: 600px) {
        .cal-cell {
          min-height: 60px;
          padding: 4px;
        }
        .cal-event-text {
          display: none;
        }
      }
    `,
  ],
})
export class CalendrierComponent implements OnInit {
  private api = inject(ApiService);

  interventions = signal<Intervention[]>([]);
  loading = signal(true);
  selectedDay = signal<CalendarDay | null>(null);

  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth()); // 0-indexed

  dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  statuts: StatutIntervention[] = ['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];

  monthLabel = computed(() => {
    return new Date(this.currentYear(), this.currentMonth(), 1).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  });

  calendarDays = computed((): CalendarDay[] => {
    const year = this.currentYear();
    const month = this.currentMonth();
    const today = new Date();

    // First day of month (adjust for Mon-start: Sun=6, Mon=0)
    const firstDay = new Date(year, month, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    // Last day of month
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Build array of 42 cells (6 rows × 7 cols)
    const days: CalendarDay[] = [];

    // Previous month tail
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(this.makeDay(d, false, today));
    }

    // Current month
    for (let d = 1; d <= lastDay; d++) {
      const date = new Date(year, month, d);
      days.push(this.makeDay(date, true, today));
    }

    // Next month head — fill to complete the grid
    let next = 1;
    while (days.length < 42) {
      days.push(this.makeDay(new Date(year, month + 1, next++), false, today));
    }

    return days;
  });

  ngOnInit() {
    this.api.getInterventions().subscribe({
      next: (data) => {
        this.interventions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private makeDay(date: Date, isCurrentMonth: boolean, today: Date): CalendarDay {
    const isToday = date.toDateString() === today.toDateString();
    const dateStr = date.toISOString().split('T')[0]; // yyyy-mm-dd

    const dayInterventions = this.interventions().filter((i) => {
      // i.date is "yyyy-mm-dd" string from backend
      return i.date === dateStr;
    });

    return { date, isCurrentMonth, isToday, interventions: dayInterventions };
  }

  prevMonth() {
    if (this.currentMonth() === 0) {
      this.currentMonth.set(11);
      this.currentYear.set(this.currentYear() - 1);
    } else {
      this.currentMonth.set(this.currentMonth() - 1);
    }
    this.selectedDay.set(null);
  }

  nextMonth() {
    if (this.currentMonth() === 11) {
      this.currentMonth.set(0);
      this.currentYear.set(this.currentYear() + 1);
    } else {
      this.currentMonth.set(this.currentMonth() + 1);
    }
    this.selectedDay.set(null);
  }

  goToday() {
    this.currentYear.set(new Date().getFullYear());
    this.currentMonth.set(new Date().getMonth());
    this.selectedDay.set(null);
  }

  statutColor(s: string): string {
    const m: Record<string, string> = {
      PLANIFIEE: '#6366f1',
      EN_COURS: '#f59e0b',
      TERMINEE: '#10b981',
      ANNULEE: '#ef4444',
    };
    return m[s] || '#6366f1';
  }

  statutLabel(s: string): string {
    return STATUT_INTERVENTION_LABELS[s as StatutIntervention] || s;
  }
}
