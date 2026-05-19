import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
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
        <!-- Brand -->
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

        <h2 class="title">Connexion</h2>
        <p class="subtitle">Entrez vos identifiants pour continuer</p>

        <!-- Form -->
        <div class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom d'utilisateur</mat-label>
            <mat-icon matPrefix>person</mat-icon>
            <input
              matInput
              [(ngModel)]="username"
              (keydown.enter)="submit()"
              autocomplete="username"
            />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Mot de passe</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              [type]="showPassword() ? 'text' : 'password'"
              [(ngModel)]="password"
              (keydown.enter)="submit()"
              autocomplete="current-password"
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

          @if (error()) {
            <div class="error-banner">
              <mat-icon>error_outline</mat-icon>
              {{ error() }}
            </div>
          }

          <button mat-flat-button class="submit-btn" (click)="submit()" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="18" />
            } @else {
              <ng-container>
                <mat-icon>login</mat-icon>
                Se connecter
              </ng-container>
            }
          </button>

          <a class="setup-callout" routerLink="/setup-admin">
            <mat-icon>admin_panel_settings</mat-icon>
            <div>
              <div class="setup-title">Première installation ?</div>
              <div class="setup-subtitle">Créer l'administrateur initial</div>
            </div>
            <mat-icon class="setup-arrow">chevron_right</mat-icon>
          </a>
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
      .setup-callout {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 10px;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid rgba(129, 140, 248, 0.28);
        background: rgba(99, 102, 241, 0.08);
        color: var(--text-primary);
        text-decoration: none;
        transition:
          transform 0.15s,
          border-color 0.15s,
          background 0.15s;
      }
      .setup-callout:hover {
        transform: translateY(-1px);
        border-color: rgba(129, 140, 248, 0.45);
        background: rgba(99, 102, 241, 0.12);
      }
      .setup-callout mat-icon:first-child {
        color: #a5b4fc;
      }
      .setup-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-primary);
      }
      .setup-subtitle {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .setup-arrow {
        margin-left: auto;
        color: var(--text-faint);
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit() {
    if (!this.username || !this.password) {
      this.error.set('Veuillez remplir tous les champs.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error.set('Identifiants incorrects.');
        this.loading.set(false);
      },
    });
  }
}
