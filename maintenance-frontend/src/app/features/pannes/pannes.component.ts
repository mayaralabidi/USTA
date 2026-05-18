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
import { AuthService } from '../../core/auth.service';
import { Panne, Equipement } from '../../models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// ── Dialog ────────────────────────────────────
@Component({
  selector: 'app-panne-dialog',
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
      <span class="dialog-title">{{ data.panne ? 'Modifier' : 'Signaler' }} une panne</span>
      <button mat-icon-button (click)="ref.close()"><mat-icon>close</mat-icon></button>
    </div>
    <div class="dialog-body">
      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea
          matInput
          rows="3"
          [formControl]="$any(form.controls['description'])"
          placeholder="Décrivez la panne en détail..."
        ></textarea>
        <mat-error>Description obligatoire (min. 10 caractères)</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Catégorie</mat-label>
        <mat-select [formControl]="$any(form.controls['categorie'])">
          <mat-option value="Électrique">Électrique</mat-option>
          <mat-option value="Mécanique">Mécanique</mat-option>
          <mat-option value="Hydraulique">Hydraulique</mat-option>
          <mat-option value="Pneumatique">Pneumatique</mat-option>
          <mat-option value="Informatique">Informatique</mat-option>
          <mat-option value="Autre">Autre</mat-option>
        </mat-select>
        <mat-error>Catégorie obligatoire</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Équipement concerné</mat-label>
        <mat-select [formControl]="$any(form.controls['equipementId'])">
          <mat-option *ngFor="let eq of data.equipements" [value]="eq.id">{{ eq.nom }}</mat-option>
        </mat-select>
        <mat-error>Équipement obligatoire</mat-error>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Priorité</mat-label>
        <mat-select [formControl]="$any(form.controls['priorite'])">
          <mat-option value="FAIBLE">🟢 Faible</mat-option>
          <mat-option value="MOYENNE">🟡 Moyenne</mat-option>
          <mat-option value="CRITIQUE">🔴 Critique</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Statut</mat-label>
        <mat-select [formControl]="$any(form.controls['statut'])">
          <mat-option value="SIGNALE">Signalé</mat-option>
          <mat-option value="EN_COURS">En cours</mat-option>
          <mat-option value="RESOLU">Résolu</mat-option>
          <mat-option value="FERME">Fermé</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div class="dialog-footer">
      <button mat-button class="btn-ghost" (click)="ref.close()">Annuler</button>
      <button mat-flat-button class="btn-primary" (click)="submit()" [disabled]="form.invalid">
        {{ data.panne ? 'Enregistrer' : 'Signaler' }}
      </button>
    </div>
  `,
})
export class PanneDialogComponent {
  form: FormGroup;
  constructor(
    public ref: MatDialogRef<PanneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { panne: Panne | null; equipements: Equipement[] },
    fb: FormBuilder,
  ) {
    const p = data.panne;
    this.form = fb.group({
      description: [p?.description || '', [Validators.required, Validators.minLength(10)]],
      categorie: [p?.categorie || '', Validators.required],
      equipementId: [p?.equipementId || null, Validators.required],
      priorite: [p?.priorite || 'MOYENNE'],
      statut: [p?.statut || 'SIGNALE'],
    });
  }
  submit() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

// ── Main Component ────────────────────────────
@Component({
  selector: 'app-pannes',
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
        <h1 class="page-title">Pannes</h1>
        <p class="page-subtitle">
          {{ filtered().length }} affichée(s) · {{ pannes().length }} au total
        </p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openDialog()">
        <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px"
          >warning_amber</mat-icon
        >
        Signaler
      </button>
    </div>

    <mat-form-field appearance="outline" style="width:100%;max-width:340px;margin-bottom:14px">
      <mat-label>Rechercher</mat-label>
      <input
        matInput
        [value]="search()"
        (input)="onSearch($event)"
        placeholder="Description, équipement..."
      />
      <button *ngIf="search()" mat-icon-button matSuffix (click)="search.set('')">
        <mat-icon style="font-size:16px">close</mat-icon>
      </button>
    </mat-form-field>

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
        [class.active]="activeFilter() === 'SIGNALE'"
        (click)="activeFilter.set('SIGNALE')"
      >
        Signalées
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
        [class.active]="activeFilter() === 'RESOLU'"
        (click)="activeFilter.set('RESOLU')"
      >
        Résolues
      </button>
      <button
        class="filter-btn"
        [class.active]="activeFilter() === 'FERME'"
        (click)="activeFilter.set('FERME')"
      >
        Fermées
      </button>
    </div>

    <div *ngIf="loading()" class="loading-state"><mat-spinner diameter="36"></mat-spinner></div>

    <div *ngIf="!loading()" class="card">
      <table mat-table [dataSource]="filtered()">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td
            mat-cell
            *matCellDef="let p"
            style="font-family:var(--font-mono);color:var(--text-faint)"
          >
            {{ p.id }}
          </td>
        </ng-container>
        <ng-container matColumnDef="priorite">
          <th mat-header-cell *matHeaderCellDef>Priorité</th>
          <td mat-cell *matCellDef="let p">
            <span [class]="prioriteClass(p.priorite)">{{ prioriteLabel(p.priorite) }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Description</th>
          <td mat-cell *matCellDef="let p">
            <span class="desc">{{ p.description }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="categorie">
          <th mat-header-cell *matHeaderCellDef>Catégorie</th>
          <td mat-cell *matCellDef="let p">
            <span class="cat-tag">{{ p.categorie }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="equipement">
          <th mat-header-cell *matHeaderCellDef>Équipement</th>
          <td mat-cell *matCellDef="let p">{{ p.equipementNom || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let p" style="font-size:12px;color:var(--text-faint)">
            {{ p.dateSignalement | date: 'dd/MM/yyyy' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let p">
            <span class="badge" [class]="'badge-' + p.statut.toLowerCase()">{{
              statutLabel(p.statut)
            }}</span>
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            <div style="display:flex;gap:2px;justify-content:flex-end">
              <button
                *ngIf="auth.isAdmin()"
                mat-icon-button
                matTooltip="Modifier"
                (click)="openDialog(p)"
              >
                <mat-icon style="font-size:16px;color:#6366f1">edit</mat-icon>
              </button>
              <button
                *ngIf="auth.isAdmin()"
                mat-icon-button
                matTooltip="Supprimer"
                (click)="delete(p)"
              >
                <mat-icon style="font-size:16px;color:#ef4444">delete_outline</mat-icon>
              </button>
            </div>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let r; columns: cols"></tr>
      </table>
      <div *ngIf="filtered().length === 0" class="empty-state">
        <mat-icon>check_circle_outline</mat-icon>
        <p>Aucune panne trouvée</p>
      </div>
    </div>
  `,
  styles: [
    `
      .desc {
        max-width: 240px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-weight: 500;
        color: var(--text-primary);
      }
      .cat-tag {
        font-size: 11px;
        padding: 2px 10px;
        border-radius: 99px;
        background: rgba(99, 102, 241, 0.12);
        color: var(--accent-light);
        font-weight: 500;
      }
      .badge-faible {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 600;
      }
      .badge-moyenne {
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 600;
      }
      .badge-critique {
        background: rgba(239, 68, 68, 0.18);
        color: #f87171;
        display: inline-flex;
        align-items: center;
        padding: 3px 9px;
        border-radius: 99px;
        font-size: 10px;
        font-weight: 700;
      }
    `,
  ],
})
export class PannesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  pannes = signal<Panne[]>([]);
  equipements = signal<Equipement[]>([]);
  loading = signal(true);
  search = signal('');
  activeFilter = signal('');
  cols = ['id', 'priorite', 'description', 'categorie', 'equipement', 'date', 'statut', 'actions'];

  filtered = computed(() => {
    const f = this.activeFilter();
    const q = this.search().toLowerCase().trim();
    return [...this.pannes()]
      .sort(
        (a, b) => prioriteOrder(b.priorite ?? 'MOYENNE') - prioriteOrder(a.priorite ?? 'MOYENNE'),
      )
      .filter((p) => {
        const matchesFilter = !f || p.statut === f;
        const matchesSearch =
          !q ||
          p.description.toLowerCase().includes(q) ||
          (p.equipementNom || '').toLowerCase().includes(q) ||
          p.categorie.toLowerCase().includes(q);
        return matchesFilter && matchesSearch;
      });
  });

  ngOnInit() {
    this.api.getEquipements().subscribe((eq) => this.equipements.set(eq));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getPannes().subscribe({
      next: (data) => {
        this.pannes.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  openDialog(panne?: Panne) {
    const ref = this.dialog.open(PanneDialogComponent, {
      width: '480px',
      data: { panne: panne ?? null, equipements: this.equipements() },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = panne?.id ? this.api.updatePanne(panne.id, result) : this.api.createPanne(result);
      obs.subscribe({
        next: () => {
          this.snack.open(panne ? '✓ Panne modifiée' : '✓ Panne signalée', '', {
            panelClass: ['snack-success'],
          });
          this.load();
        },
      });
    });
  }

  delete(p: Panne) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer la panne',
        message: 'Voulez-vous vraiment supprimer cette panne ? Cette action est irréversible.',
        confirmLabel: 'Supprimer',
        danger: true,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.deletePanne(p.id!).subscribe({
        next: () => {
          this.snack.open('✓ Panne supprimée', '', { panelClass: ['snack-success'] });
          this.load();
        },
      });
    });
  }

  prioriteLabel(p: string): string {
    const m: Record<string, string> = {
      FAIBLE: 'Faible',
      MOYENNE: 'Moyenne',
      CRITIQUE: 'Critique',
    };
    return m[p] || p;
  }

  prioriteClass(p: string): string {
    const m: Record<string, string> = {
      FAIBLE: 'badge-faible',
      MOYENNE: 'badge-moyenne',
      CRITIQUE: 'badge-critique',
    };
    return m[p] || '';
  }

  statutLabel(s: string): string {
    const m: Record<string, string> = {
      SIGNALE: 'Signalé',
      EN_COURS: 'En cours',
      RESOLU: 'Résolu',
      FERME: 'Fermé',
    };
    return m[s] || s;
  }
}

function prioriteOrder(p: string): number {
  const order: Record<string, number> = { CRITIQUE: 3, MOYENNE: 2, FAIBLE: 1 };
  return order[p] ?? 0;
}
