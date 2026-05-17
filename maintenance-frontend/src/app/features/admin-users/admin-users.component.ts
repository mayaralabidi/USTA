import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Administration</h1>
        <p class="page-subtitle">Créer des comptes métier ou administrateur</p>
      </div>
    </div>

    <div class="card form-card">
      <div class="form-grid">
        <mat-form-field appearance="outline">
          <mat-label>Nom d'utilisateur</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput [(ngModel)]="username" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Mot de passe</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input matInput [(ngModel)]="password" type="password" autocomplete="off" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Rôle</mat-label>
          <mat-select [(ngModel)]="role">
            <mat-option value="TECHNICIEN">Technicien</mat-option>
            <mat-option value="ADMIN">Administrateur</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (error()) {
        <div class="banner error">
          <mat-icon>error_outline</mat-icon>
          {{ error() }}
        </div>
      }

      @if (success()) {
        <div class="banner success">
          <mat-icon>check_circle_outline</mat-icon>
          Compte créé avec succès.
        </div>
      }

      <button mat-flat-button class="btn-primary" (click)="submit()" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="18" />
        } @else {
          <span class="submit-label">
            <mat-icon>person_add</mat-icon>
            <span>Créer le compte</span>
          </span>
        }
      </button>
    </div>
  `,
  styles: [
    `
      .form-card {
        max-width: 760px;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 14px;
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 13px;
      }
      .banner.error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #f87171;
      }
      .banner.success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.25);
        color: #4ade80;
      }
      .submit-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      @media (max-width: 900px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminUsersComponent {
  private api = inject(ApiService);

  username = '';
  password = '';
  role: 'ADMIN' | 'TECHNICIEN' = 'TECHNICIEN';

  loading = signal(false);
  error = signal('');
  success = signal(false);

  submit() {
    this.error.set('');
    this.success.set(false);

    if (!this.username.trim() || !this.password.trim()) {
      this.error.set('Merci de remplir tous les champs.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.loading.set(true);
    this.api
      .createUser({ username: this.username.trim(), password: this.password, role: this.role })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          this.username = '';
          this.password = '';
          this.role = 'TECHNICIEN';
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Impossible de créer le compte.');
        },
      });
  }
}
