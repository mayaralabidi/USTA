import { Component, OnInit, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../core/api.service';
import { Technicien } from '../../models';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

// ── Dialog ────────────────────────────────────
@Component({
  selector: 'app-technicien-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  template: `
    <div class="dialog-header">
      <span class="dialog-title">{{ data ? 'Modifier' : 'Ajouter' }} un technicien</span>
      <button mat-icon-button (click)="ref.close()"><mat-icon>close</mat-icon></button>
    </div>
    <div class="dialog-body">
      <mat-form-field appearance="outline">
        <mat-label>Nom complet</mat-label>
        <input
          matInput
          [formControl]="$any(form.controls['nom'])"
          placeholder="Ex: Ahmed Mansouri"
        />
        <mat-icon matPrefix style="color:var(--text-faint);margin-right:6px;font-size:18px"
          >person</mat-icon
        >
        <mat-error>Nom obligatoire (min. 2 caractères)</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Compétences</mat-label>
        <textarea
          matInput
          rows="2"
          [formControl]="$any(form.controls['competences'])"
          placeholder="Ex: Électricité, Automatisme, Hydraulique"
        ></textarea>
        <mat-hint>Séparez par des virgules</mat-hint>
      </mat-form-field>

      <div class="toggle-row">
        <div>
          <div class="toggle-label">Disponibilité</div>
          <div class="toggle-sub">Le technicien peut être assigné à des interventions</div>
        </div>
        <mat-slide-toggle
          [formControl]="$any(form.controls['disponibilite'])"
          color="primary"
        ></mat-slide-toggle>
      </div>
    </div>
    <div class="dialog-footer">
      <button mat-button class="btn-ghost" (click)="ref.close()">Annuler</button>
      <button mat-flat-button class="btn-primary" (click)="submit()" [disabled]="form.invalid">
        {{ data ? 'Enregistrer' : 'Ajouter' }}
      </button>
    </div>
  `,
  styles: [
    `
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border);
        padding: 12px 14px;
        border-radius: 8px;
      }
      .toggle-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
      }
      .toggle-sub {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 2px;
      }
    `,
  ],
})
export class TechnicienDialogComponent {
  form: FormGroup;
  constructor(
    public ref: MatDialogRef<TechnicienDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Technicien | null,
    fb: FormBuilder,
  ) {
    this.form = fb.group({
      nom: [data?.nom || '', [Validators.required, Validators.minLength(2)]],
      competences: [data?.competences || ''],
      disponibilite: [data?.disponibilite ?? true],
    });
  }
  submit() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

// ── Main Component ────────────────────────────
@Component({
  selector: 'app-techniciens',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div
      class="page-header"
      style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;"
    >
      <div>
        <h1 class="page-title">Techniciens</h1>
        <p class="page-subtitle">
          {{ techniciens().length }} technicien(s) · {{ disponibles() }} disponible(s)
        </p>
      </div>
      <button mat-flat-button class="btn-primary" (click)="openDialog()">
        <mat-icon style="font-size:16px;width:16px;height:16px;margin-right:5px"
          >person_add</mat-icon
        >
        Ajouter
      </button>
    </div>

    <div *ngIf="loading()" class="loading-state"><mat-spinner diameter="36"></mat-spinner></div>

    <!-- Cards grid -->
    <div *ngIf="!loading()" class="tech-grid">
      <div
        *ngFor="let t of techniciens()"
        class="tech-card"
        [class.dispo]="t.disponibilite"
        [class.indispo]="!t.disponibilite"
      >
        <div class="tech-top">
          <div class="tech-avatar" [style.background]="avatarColor(t.nom)">
            {{ initials(t.nom) }}
          </div>
          <div class="tech-info">
            <span class="tech-name">{{ t.nom }}</span>
            <span class="dispo-badge" [class.on]="t.disponibilite" [class.off]="!t.disponibilite">
              <span class="dispo-dot"></span>
              {{ t.disponibilite ? 'Disponible' : 'Non disponible' }}
            </span>
          </div>
          <div class="tech-actions">
            <button mat-icon-button matTooltip="Modifier" (click)="openDialog(t)">
              <mat-icon style="font-size:15px;color:var(--text-muted)">edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Supprimer" (click)="delete(t)">
              <mat-icon style="font-size:15px;color:#ef4444">delete_outline</mat-icon>
            </button>
          </div>
        </div>

        <div class="skills-row" *ngIf="t.competences">
          <span *ngFor="let s of getSkills(t.competences)" class="skill-tag">{{ s }}</span>
        </div>

        <div class="tech-footer">
          <mat-icon style="font-size:13px;width:13px;height:13px;color:var(--text-faint)"
            >build</mat-icon
          >
          <span>{{ t.interventionsEnCours || 0 }} intervention(s) en cours</span>
        </div>
      </div>

      <div *ngIf="techniciens().length === 0" class="empty-state" style="grid-column:1/-1">
        <mat-icon>engineering</mat-icon>
        <p>Aucun technicien enregistré</p>
        <button mat-flat-button class="btn-primary" style="margin-top:8px" (click)="openDialog()">
          Ajouter le premier
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .tech-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 14px;
      }
      .tech-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        padding: 16px;
        transition:
          transform 0.15s,
          box-shadow 0.15s;
      }
      .tech-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      }
      .tech-card.dispo {
        border-left: 2px solid #10b981;
      }
      .tech-card.indispo {
        border-left: 2px solid #ef4444;
      }

      .tech-top {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .tech-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
        font-family: var(--font-sans);
      }
      .tech-info {
        flex: 1;
        min-width: 0;
      }
      .tech-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dispo-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        font-weight: 500;
        margin-top: 3px;
      }
      .dispo-badge.on {
        color: #34d399;
      }
      .dispo-badge.off {
        color: #f87171;
      }
      .dispo-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
      .dispo-badge.on .dispo-dot {
        background: #10b981;
        box-shadow: 0 0 6px #10b981;
      }
      .dispo-badge.off .dispo-dot {
        background: #ef4444;
      }

      .tech-actions {
        display: flex;
        gap: 0;
        margin-left: auto;
      }

      .skills-row {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 12px;
      }
      .skill-tag {
        font-size: 10px;
        font-weight: 500;
        padding: 2px 10px;
        border-radius: 99px;
        background: var(--accent-dim);
        color: var(--accent-light);
      }

      .tech-footer {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: var(--text-faint);
        padding-top: 10px;
        border-top: 1px solid var(--border);
      }

      @media (max-width: 480px) {
        .tech-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TechniciensComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  techniciens = signal<Technicien[]>([]);
  loading = signal(true);

  disponibles = () => this.techniciens().filter((t) => t.disponibilite).length;

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getTechniciens().subscribe({
      next: (data) => {
        this.techniciens.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openDialog(t?: Technicien) {
    const ref = this.dialog.open(TechnicienDialogComponent, {
      width: '460px',
      data: t ?? null,
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const obs = t?.id
        ? this.api.updateTechnicien(t.id, result)
        : this.api.createTechnicien(result);
      obs.subscribe({
        next: () => {
          this.snack.open(t ? '✓ Technicien modifié' : '✓ Technicien ajouté', '', {
            panelClass: ['snack-success'],
          });
          this.load();
        },
      });
    });
  }

  delete(t: Technicien) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer le technicien',
        message: `Voulez-vous vraiment supprimer "${t.nom}" ?`,
        confirmLabel: 'Supprimer',
        danger: true,
      },
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.deleteTechnicien(t.id!).subscribe({
        next: () => {
          this.snack.open('✓ Technicien supprimé', '', { panelClass: ['snack-success'] });
          this.load();
        },
      });
    });
  }

  initials(nom: string): string {
    return nom
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getSkills(competences: string): string[] {
    return competences
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  avatarColor(nom: string): string {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'];
    let hash = 0;
    for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }
}
