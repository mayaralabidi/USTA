import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-shell">
      <div class="login-card">
        <div class="brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5L1.5 5v6L8 14.5 14.5 11V5L8 1.5z"
                stroke="white"
                stroke-width="1.2"
                stroke-linejoin="round"
              />
              <path
                d="M8 1.5v13M1.5 5l6.5 3.5 6.5-3.5"
                stroke="white"
                stroke-width="1"
                stroke-linejoin="round"
                opacity=".55"
              />
            </svg>
          </div>
          <div>
            <div class="brand-name">MaintenanceUSTA</div>
            <div class="brand-sub">Gestion industrielle</div>
          </div>
        </div>

        <h2 class="title">Créer un compte</h2>
        <p class="subtitle">Remplissez les informations pour créer un utilisateur</p>

        <div class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input matInput [(ngModel)]="username" autocomplete="username" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              [(ngModel)]="password"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="showPassword.set(!showPassword())"
            >
              <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirmer le mot de passe</mat-label>
            <mat-icon matPrefix>lock_outline</mat-icon>
            <input
              matInput
              [type]="showConfirm() ? 'text' : 'password'"
              [(ngModel)]="confirmPassword"
              autocomplete="new-password"
            />
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="showConfirm.set(!showConfirm())"
            >
              <mat-icon>{{ showConfirm() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error()) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          @if (success()) {
            <div class="success-banner">
              <mat-icon>check_circle_outline</mat-icon>
              Compte créé avec succès !
            </div>
          }

          <button mat-flat-button class="submit-btn" (click)="submit()" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="18" />
            } @else {
              <ng-container>
                <mat-icon>person_add</mat-icon>
                Créer le compte
              </ng-container>
            }
          </button>

          <p class="login-link">
            Déjà un compte ?
            <a routerLink="/login">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-shell {
        min-height: 100vh;
        background: var(--bg-base);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .login-card {
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 40px;
        width: 100%;
        max-width: 400px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 32px;
      }
      .brand-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
      .brand-name {
        font-size: 15px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .brand-sub {
        font-size: 11px;
        color: var(--text-faint);
        margin-top: 1px;
      }
      .title {
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 6px;
      }
      .subtitle {
        font-size: 13px;
        color: var(--text-muted);
        margin: 0 0 28px;
      }
      .form {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .full-width {
        width: 100%;
      }
      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        padding: 10px 14px;
        color: #f87171;
        font-size: 13px;
      }
      .success-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        padding: 10px 14px;
        color: #4ade80;
        font-size: 13px;
      }
      .submit-btn {
        width: 100%;
        height: 44px;
        margin-top: 8px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        color: white !important;
        font-size: 14px;
        font-weight: 600;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .submit-btn:disabled {
        opacity: 0.6;
      }
      .login-link {
        text-align: center;
        font-size: 13px;
        color: var(--text-muted);
        margin: 8px 0 0;
      }
      .login-link a {
        color: #818cf8;
        text-decoration: none;
        font-weight: 500;
      }
      .login-link a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';

  loading = signal(false);
  error = signal('');
  success = signal(false);
  showPassword = signal(false);
  showConfirm = signal(false);

  private readonly API = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  submit() {
    this.error.set('');
    this.success.set(false);

    if (!this.username || !this.password || !this.confirmPassword) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    this.loading.set(true);

    this.http
      .post(`${this.API}/register`, {
        username: this.username,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set(true);
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err.error?.message ?? 'Erreur lors de la création du compte.');
        },
      });
  }
}
