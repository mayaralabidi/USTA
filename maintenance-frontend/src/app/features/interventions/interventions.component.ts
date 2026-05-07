import { Component, OnInit, inject, signal, computed, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Intervention, Equipement, Technicien, Panne, StatutIntervention } from '../../models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

interface DialogData {
  intervention: Intervention | null;
  equipements: Equipement[];
  techniciens: Technicien[];
  pannes: Panne[];
}

// ── Dialog ────────────────────────────────────
@Component({
  selector: 'app-intervention-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  template: `
    <div class="dialog-header">
      <span class="dialog-title"
        >{{ data.intervention ? 'Modifier' : 'Planifier' }} une intervention</span
      >
      <button mat-icon-button (click)="ref.close()"><mat-icon>close</mat-icon></button>
    </div>
    <div class="dialog-body" style="max-height:500px;overflow-y:auto;">
      <mat-form-field appearance="outline">
        <mat-label>Équipement</mat-label>
        <mat-select [formControl]="$any(form.controls['equipementId'])">
          <mat-option *ngFor="let e of data.equipements" [value]="e.id">{{ e.nom }}</mat-option>
        </mat-select>
        <mat-error>Équipement obligatoire</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Technicien assigné</mat-label>
        <mat-select [formControl]="$any(form.controls['technicienId'])">
          <mat-option [value]="null">— Aucun —</mat-option>
          <mat-option *ngFor="let t of data.techniciens" [value]="t.id">
            {{ t.nom }}
            <span *ngIf="t.disponibilite" style="color:#10b981"> ✓</span>
            <span *ngIf="!t.disponibilite" style="color:#ef4444"> ✗</span>
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Panne liée</mat-label>
        <mat-select [formControl]="$any(form.controls['panneId'])">
          <mat-option [value]="null">— Aucune —</mat-option>
          <mat-option *ngFor="let p of data.pannes" [value]="p.id">
            {{ p.description | slice: 0 : 50 }}{{ p.description.length > 50 ? '...' : '' }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Date d'intervention</mat-label>
        <input matInput type="date" [formControl]="$any(form.controls['date'])" />
        <mat-error>Date obligatoire</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Statut</mat-label>
        <mat-select [formControl]="$any(form.controls['statut'])">
          <mat-option value="PLANIFIEE">Planifiée</mat-option>
          <mat-option value="EN_COURS">En cours</mat-option>
          <mat-option value="TERMINEE">Terminée</mat-option>
          <mat-option value="ANNULEE">Annulée</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Coût estimé (DT)</mat-label>
        <input
          matInput
          type="number"
          min="0"
          step="0.01"
          [formControl]="$any(form.controls['cout'])"
        />
        <span matSuffix style="color:var(--text-muted);padding-right:8px">DT</span>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Notes</mat-label>
        <textarea
          matInput
          rows="2"
          [formControl]="$any(form.controls['notes'])"
          placeholder="Observations, matériel nécessaire..."
        ></textarea>
      </mat-form-field>
    </div>
    <div class="dialog-footer">
      <button mat-button class="btn-ghost" (click)="ref.close()">Annuler</button>
      <button mat-flat-button class="btn-primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.intervention ? 'Enregistrer' : 'Planifier' }}
      </button>
    </div>
  `,
})
export class InterventionDialogComponent {
  form: FormGroup;
  today = new Date().toISOString().split('T')[0];

  constructor(
    public ref: MatDialogRef<InterventionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    fb: FormBuilder,
  ) {
    const iv = data.intervention;
    this.form = fb.group({
      equipementId: [iv?.equipementId || null, Validators.required],
      technicienId: [iv?.technicienId || null],
      panneId: [iv?.panneId || null],
      date: [iv?.date || this.today, Validators.required],
      statut: [iv?.statut || 'PLANIFIEE', Validators.required],
      cout: [iv?.cout || null],
      notes: [iv?.notes || ''],
    });
  }

  submit() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

// ── Main Component ────────────────────────────
@Component({
  selector: 'app-interventions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Interventions</h1>
        <p class="page-subtitle">
          {{ filtered().length }} affichée(s) · {{ interventions().length }} au total
        </p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openDialog()">
        <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px">add</mat-icon>
        Planifier
      </button>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <button
        class="filter-btn"
        [class.active]="activeFilter() === ''"
        (click)="activeFilter.set('')"
      >
        Toutes
      </button>
      <button
        class="filter-btn"
        [class.active]="activeFilter() === 'PLANIFIEE'"
        (click)="activeFilter.set('PLANIFIEE')"
      >
        Planifiées
      </button>
      <button
        class="filter-btn"
        [class.active]="activeFilter() === 'EN_COURS'"
        (click)="activeFilter.set('EN_COURS')"
      >
        En cours
      </button>
      <button
        class="filter-btn"
        [class.active]="activeFilter() === 'TERMINEE'"
        (click)="activeFilter.set('TERMINEE')"
      >
        Terminées
      </button>
      <button
        class="filter-btn"
        [class.active]="activeFilter() === 'ANNULEE'"
        (click)="activeFilter.set('ANNULEE')"
      >
        Annulées
      </button>
    </div>

    <!-- Search -->
    <mat-form-field appearance="outline" style="width:100%;max-width:340px;margin-bottom:10px">
      <mat-label>Rechercher</mat-label>
      <input
        matInput
        [value]="search()"
        (input)="onSearch($event)"
        placeholder="Équipement, technicien..."
      />
      <button *ngIf="search()" mat-icon-button matSuffix (click)="search.set('')">
        <mat-icon style="font-size:16px">close</mat-icon>
      </button>
    </mat-form-field>

    <!-- Total cost summary -->
    <div *ngIf="filtered().length > 0" class="cost-summary">
      <mat-icon style="font-size:14px;width:14px;height:14px;color:var(--text-faint)"
        >payments</mat-icon
      >
      <span>Coût total affiché :</span>
      <strong style="font-family:var(--font-mono);color:var(--text-primary)">
        {{ totalCout() | number: '1.0-0' }} DT
      </strong>
    </div>

    <div *ngIf="loading()" class="loading-state"><mat-spinner diameter="36"></mat-spinner></div>

    <div *ngIf="!loading()" class="card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td
            mat-cell
            *matCellDef="let i"
            style="font-family:var(--font-mono);color:var(--text-faint)"
          >
            {{ i.id }}
          </td>
        </ng-container>

        <ng-container matColumnDef="equipement">
          <th mat-header-cell *matHeaderCellDef>Équipement</th>
          <td mat-cell *matCellDef="let i">
            <span style="font-weight:500;color:var(--text-primary)">{{
              i.equipementNom || '—'
            }}</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="technicien">
          <th mat-header-cell *matHeaderCellDef>Technicien</th>
          <td mat-cell *matCellDef="let i">
            <div *ngIf="i.technicienNom" class="tech-chip">
              <span class="chip-avatar">{{ i.technicienNom[0] }}</span>
              {{ i.technicienNom }}
            </div>
            <span *ngIf="!i.technicienNom" style="color:var(--text-faint);font-size:12px"
              >Non assigné</span
            >
          </td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let i" style="font-size:12px">
            {{ i.date | date: 'dd/MM/yyyy' }}
          </td>
        </ng-container>

        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let i">
            <span class="badge" [class]="'badge-' + i.statut.toLowerCase()">
              {{ statutLabel(i.statut) }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="cout">
          <th mat-header-cell *matHeaderCellDef>Coût</th>
          <td mat-cell *matCellDef="let i">
            <span
              *ngIf="i.cout"
              style="font-weight:600;color:var(--text-primary);font-family:var(--font-mono)"
            >
              {{ i.cout | number: '1.0-0' }} DT
            </span>
            <span *ngIf="!i.cout" style="color:var(--text-faint)">—</span>
          </td>
        </ng-container>

        <!-- Notes tooltip column -->
        <ng-container matColumnDef="notes">
          <th mat-header-cell *matHeaderCellDef>Notes</th>
          <td mat-cell *matCellDef="let i">
            <button
              *ngIf="i.notes"
              mat-icon-button
              [matTooltip]="i.notes"
              matTooltipPosition="left"
              style="width:28px;height:28px"
            >
              <mat-icon style="font-size:15px;color:var(--text-muted)">sticky_note_2</mat-icon>
            </button>
            <span *ngIf="!i.notes" style="color:var(--text-faint);font-size:12px">—</span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let i">
            <div style="display:flex;gap:2px;justify-content:flex-end;align-items:center">
              <!-- Quick statut change -->
              <button
                mat-icon-button
                matTooltip="Changer statut"
                [matMenuTriggerFor]="menu"
                [disabled]="i.statut === 'TERMINEE' || i.statut === 'ANNULEE'"
              >
                <mat-icon style="font-size:16px;color:var(--text-muted)">swap_horiz</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button
                  mat-menu-item
                  *ngIf="i.statut === 'PLANIFIEE'"
                  (click)="changeStatut(i, 'EN_COURS')"
                >
                  <mat-icon style="color:#f59e0b">autorenew</mat-icon> Démarrer
                </button>
                <button
                  mat-menu-item
                  *ngIf="i.statut === 'EN_COURS'"
                  (click)="changeStatut(i, 'TERMINEE')"
                >
                  <mat-icon style="color:#10b981">check_circle</mat-icon> Terminer
                </button>
                <button
                  mat-menu-item
                  *ngIf="i.statut === 'PLANIFIEE' || i.statut === 'EN_COURS'"
                  (click)="changeStatut(i, 'ANNULEE')"
                >
                  <mat-icon style="color:#ef4444">cancel</mat-icon> Annuler
                </button>
              </mat-menu>

              <button mat-icon-button matTooltip="Modifier" (click)="openDialog(i)">
                <mat-icon style="font-size:16px;color:#6366f1">edit</mat-icon>
              </button>

              <button mat-icon-button matTooltip="Supprimer" (click)="delete(i)">
                <mat-icon style="font-size:16px;color:#ef4444">delete_outline</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let r; columns: cols"></tr>
      </table>

      <div *ngIf="filtered().length === 0" class="empty-state">
        <mat-icon>event_available</mat-icon>
        <p>Aucune intervention dans cette catégorie</p>
      </div>
    </div>
  `,
  styles: [
    `
      .cost-summary {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 12px;
        padding: 6px 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        border: 1px solid var(--border);
        width: fit-content;
      }
      .tech-chip {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
      }
      .chip-avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--accent-dim);
        color: var(--accent-light);
        font-weight: 700;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      ::ng-deep .mat-mdc-menu-panel {
        background: var(--bg-elevated) !important;
        border: 1px solid var(--border-strong) !important;
        border-radius: var(--radius-md) !important;
      }
      ::ng-deep .mat-mdc-menu-item {
        color: var(--text-secondary) !important;
        font-family: var(--font-sans) !important;
        font-size: 13px !important;
      }
      ::ng-deep .mat-mdc-menu-item:hover {
        background: var(--bg-hover) !important;
      }
    `,
  ],
})
export class InterventionsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  interventions = signal<Intervention[]>([]);
  equipements = signal<Equipement[]>([]);
  techniciens = signal<Technicien[]>([]);
  pannes = signal<Panne[]>([]);
  activeFilter = signal('');
  search = signal('');
  loading = signal(true);

  cols = ['id', 'equipement', 'technicien', 'date', 'statut', 'cout', 'notes', 'actions'];

  filtered = computed(() => {
    const f = this.activeFilter();
    const q = this.search().toLowerCase().trim();
    return this.interventions().filter((i) => {
      const matchesFilter = !f || i.statut === f;
      const matchesSearch =
        !q ||
        (i.equipementNom || '').toLowerCase().includes(q) ||
        (i.technicienNom || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  });

  // Feature 2 — total cost of visible interventions
  totalCout = computed(() => this.filtered().reduce((sum, i) => sum + (i.cout || 0), 0));

  ngOnInit() {
    forkJoin({
      eq: this.api.getEquipements(),
      tech: this.api.getTechniciens(),
      pannes: this.api.getPannes(),
    }).subscribe((res) => {
      this.equipements.set(res.eq);
      this.techniciens.set(res.tech);
      this.pannes.set(res.pannes);
    });

    this.load();

    // Feature 1 — read filter set by dashboard KPI click
    const savedFilter = sessionStorage.getItem('filter_interventions');
    if (savedFilter) {
      this.activeFilter.set(savedFilter);
      sessionStorage.removeItem('filter_interventions');
    }
  }

  load() {
    this.loading.set(true);
    this.api.getInterventions().subscribe({
      next: (data) => {
        this.interventions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  openDialog(iv?: Intervention) {
    const ref = this.dialog.open(InterventionDialogComponent, {
      width: '500px',
      data: {
        intervention: iv ?? null,
        equipements: this.equipements(),
        techniciens: this.techniciens(),
        pannes: this.pannes(),
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = iv?.id
        ? this.api.updateIntervention(iv.id, result)
        : this.api.createIntervention(result);
      obs.subscribe({
        next: () => {
          this.snack.open(iv ? '✓ Intervention modifiée' : '✓ Intervention planifiée', '', {
            panelClass: ['snack-success'],
          });
          this.load();
        },
      });
    });
  }

  changeStatut(i: Intervention, statut: StatutIntervention) {
    this.api.updateStatut(i.id!, statut).subscribe({
      next: () => {
        this.snack.open('✓ Statut mis à jour', '', { panelClass: ['snack-success'] });
        this.load();
      },
    });
  }

  delete(i: Intervention) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: "Supprimer l'intervention",
        message: `Supprimer l'intervention #${i.id} (${i.equipementNom}) ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.deleteIntervention(i.id!).subscribe({
        next: () => {
          this.snack.open('✓ Intervention supprimée', '', { panelClass: ['snack-success'] });
          this.load();
        },
      });
    });
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
}
