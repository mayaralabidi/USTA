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
import { ApiService } from '../../core/api.service';
import { Equipement, EtatEquipement } from '../../models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// ── Dialog ────────────────────────────────────
@Component({
  selector: 'app-equipement-dialog',
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
      <span class="dialog-title">{{ data ? 'Modifier' : 'Ajouter' }} un équipement</span>
      <button mat-icon-button (click)="ref.close()"><mat-icon>close</mat-icon></button>
    </div>
    <div class="dialog-body">
      <mat-form-field appearance="outline">
        <mat-label>Nom de l'équipement</mat-label>
        <input
          matInput
          [formControl]="$any(form.controls['nom'])"
          placeholder="Ex: Pompe centrifuge #3"
        />
        <mat-error>Nom obligatoire (min. 2 caractères)</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>État</mat-label>
        <mat-select [formControl]="$any(form.controls['etat'])">
          <mat-option value="OPERATIONNEL">Opérationnel</mat-option>
          <mat-option value="EN_PANNE">En panne</mat-option>
          <mat-option value="EN_MAINTENANCE">En maintenance</mat-option>
          <mat-option value="HORS_SERVICE">Hors service</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date d'acquisition</mat-label>
        <input matInput type="date" [formControl]="$any(form.controls['dateAcquisition'])" />
      </mat-form-field>
    </div>
    <div class="dialog-footer">
      <button mat-button class="btn-ghost" (click)="ref.close()">Annuler</button>
      <button mat-flat-button class="btn-primary" (click)="submit()" [disabled]="form.invalid">
        {{ data ? 'Enregistrer' : 'Ajouter' }}
      </button>
    </div>
  `,
})
export class EquipementDialogComponent {
  form: FormGroup;
  constructor(
    public ref: MatDialogRef<EquipementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Equipement | null,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      nom: [data?.nom || '', [Validators.required, Validators.minLength(2)]],
      etat: [data?.etat || 'OPERATIONNEL', Validators.required],
      dateAcquisition: [data?.dateAcquisition || ''],
    });
  }
  submit() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

// ── Main ──────────────────────────────────────
@Component({
  selector: 'app-equipements',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Équipements</h1>
        <p class="page-subtitle">
          {{ filtered().length }} / {{ equipements().length }} équipement(s)
        </p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openDialog()">
        <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px">add</mat-icon>
        Ajouter
      </button>
    </div>

    <!-- Stats pills -->
    <div class="stats-row">
      <div class="stat-pill" style="background:rgba(16,185,129,.12);color:#34d399">
        <strong>{{ count('OPERATIONNEL') }}</strong> Opérationnels
      </div>
      <div class="stat-pill" style="background:rgba(239,68,68,.12);color:#f87171">
        <strong>{{ count('EN_PANNE') }}</strong> En panne
      </div>
      <div class="stat-pill" style="background:rgba(245,158,11,.12);color:#fbbf24">
        <strong>{{ count('EN_MAINTENANCE') }}</strong> En maintenance
      </div>
      <div class="stat-pill" style="background:rgba(255,255,255,.06);color:#6060a0">
        <strong>{{ count('HORS_SERVICE') }}</strong> Hors service
      </div>
    </div>

    <!-- Search bar -->
    <mat-form-field appearance="outline" style="width:100%;max-width:340px;margin-bottom:16px">
      <mat-label>Rechercher un équipement</mat-label>
      <input
        matInput
        [value]="search()"
        (input)="onSearch($event)"
        placeholder="Nom de l'équipement..."
      />
      <button *ngIf="search()" mat-icon-button matSuffix (click)="search.set('')">
        <mat-icon style="font-size:16px">close</mat-icon>
      </button>
    </mat-form-field>

    <div *ngIf="loading()" class="loading-state"><mat-spinner diameter="36"></mat-spinner></div>

    <div *ngIf="!loading()" class="card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td
            mat-cell
            *matCellDef="let e"
            style="font-family:var(--font-mono);color:var(--text-faint)"
          >
            {{ e.id }}
          </td>
        </ng-container>
        <ng-container matColumnDef="nom">
          <th mat-header-cell *matHeaderCellDef>Nom</th>
          <td mat-cell *matCellDef="let e">
            <span style="font-weight:500;color:var(--text-primary)">{{ e.nom }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="etat">
          <th mat-header-cell *matHeaderCellDef>État</th>
          <td mat-cell *matCellDef="let e">
            <span class="badge" [class]="'badge-' + e.etat.toLowerCase()">{{
              etatLabel(e.etat)
            }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="dateAcquisition">
          <th mat-header-cell *matHeaderCellDef>Acquisition</th>
          <td mat-cell *matCellDef="let e">{{ e.dateAcquisition || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="pannes">
          <th mat-header-cell *matHeaderCellDef>Pannes</th>
          <td mat-cell *matCellDef="let e">
            <span class="count-chip" [class.warn]="(e.nombrePannes || 0) > 0">{{
              e.nombrePannes || 0
            }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let e">
            <div style="display:flex;gap:2px;justify-content:flex-end">
              <button mat-icon-button matTooltip="Modifier" (click)="openDialog(e)">
                <mat-icon style="font-size:16px;color:#6366f1">edit</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Supprimer" (click)="delete(e)">
                <mat-icon style="font-size:16px;color:#ef4444">delete_outline</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let r; columns: cols"></tr>
      </table>
      <div *ngIf="equipements().length === 0" class="empty-state">
        <mat-icon>precision_manufacturing</mat-icon>
        <p>Aucun équipement enregistré</p>
        <button mat-flat-button class="btn-primary" style="margin-top:8px" (click)="openDialog()">
          Ajouter le premier
        </button>
      </div>
      <div *ngIf="equipements().length > 0 && filtered().length === 0" class="empty-state">
        <mat-icon>search_off</mat-icon>
        <p>Aucun résultat pour "{{ search() }}"</p>
      </div>
    </div>
  `,
  styles: [
    `
      .stats-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 14px;
      }
      .stat-pill {
        padding: 6px 14px;
        border-radius: 99px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .stat-pill strong {
        font-size: 15px;
        font-weight: 700;
        font-family: var(--font-mono);
      }
      .count-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        font-family: var(--font-mono);
      }
      .count-chip.warn {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }
    `,
  ],
})
export class EquipementsComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  equipements = signal<Equipement[]>([]);
  loading = signal(true);
  cols = ['id', 'nom', 'etat', 'dateAcquisition', 'pannes', 'actions'];

  search = signal('');

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.equipements();
    return this.equipements().filter((e) => e.nom.toLowerCase().includes(q));
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getEquipements().subscribe({
      next: (data) => {
        this.equipements.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  openDialog(eq?: Equipement) {
    const ref = this.dialog.open(EquipementDialogComponent, { width: '460px', data: eq ?? null });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = eq?.id
        ? this.api.updateEquipement(eq.id, result)
        : this.api.createEquipement(result);
      obs.subscribe({
        next: () => {
          this.snack.open(eq ? '✓ Équipement modifié' : '✓ Équipement ajouté', '', {
            panelClass: ['snack-success'],
          });
          this.load();
        },
      });
    });
  }

  delete(eq: Equipement) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: "Supprimer l'équipement",
        message: `Voulez-vous vraiment supprimer "${eq.nom}" ? Cette action est irréversible.`,
        confirmLabel: 'Supprimer',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.deleteEquipement(eq.id!).subscribe({
        next: () => {
          this.snack.open('✓ Équipement supprimé', '', { panelClass: ['snack-success'] });
          this.load();
        },
      });
    });
  }

  count(etat: EtatEquipement): number {
    return this.equipements().filter((e) => e.etat === etat).length;
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
}
