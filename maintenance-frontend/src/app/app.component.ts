import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatIconModule,
    MatRippleModule,
    MatTooltipModule,
  ],
  template: `
    <div class="shell" [class.collapsed]="collapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          <div class="brand-text">
            <span class="brand-name">MaintenancePro</span>
            <span class="brand-sub">Gestion industrielle</span>
          </div>
          <button class="toggle-btn" (click)="collapsed.set(true)">
            <mat-icon>chevron_left</mat-icon>
          </button>
        </div>

        <!-- Collapsed toggle -->
        <div class="expand-btn" (click)="collapsed.set(false)">
          <mat-icon>chevron_right</mat-icon>
        </div>

        <!-- Nav -->
        <nav class="nav">
          <span class="nav-section-label">Navigation</span>
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.path"
            routerLinkActive="active"
            class="nav-item"
            matRipple
            [matTooltip]="collapsed() ? item.label : ''"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Footer -->
        <div class="sidebar-footer">
          <div class="api-dot"></div>
          <span class="api-label">API · localhost:8080</span>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .shell {
        display: flex;
        min-height: 100vh;
        background: var(--bg-base);
        font-family: var(--font-sans);
      }

      /* ── Sidebar ─────────────────────────── */
      .sidebar {
        width: 220px;
        min-height: 100vh;
        background: var(--bg-surface);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: hidden;
        transition: width 0.25s ease;
      }
      .shell.collapsed .sidebar {
        width: 56px;
      }

      /* Brand */
      .brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 18px 14px 14px;
        border-bottom: 1px solid var(--border);
        overflow: hidden;
      }
      .brand-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
      .brand-text {
        flex: 1;
        min-width: 0;
        transition: opacity 0.2s;
      }
      .shell.collapsed .brand-text {
        opacity: 0;
        pointer-events: none;
      }
      .brand-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
        display: block;
        white-space: nowrap;
      }
      .brand-sub {
        font-size: 10px;
        color: var(--text-faint);
        display: block;
        margin-top: 1px;
      }
      .toggle-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-faint);
        padding: 2px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        transition: color 0.15s;
      }
      .toggle-btn:hover {
        color: var(--text-muted);
      }
      .toggle-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .shell.collapsed .toggle-btn {
        display: none;
      }

      .expand-btn {
        display: none;
        align-items: center;
        justify-content: center;
        padding: 14px 0;
        cursor: pointer;
        color: var(--text-faint);
        border-bottom: 1px solid var(--border);
        transition: color 0.15s;
      }
      .expand-btn:hover {
        color: var(--text-muted);
      }
      .expand-btn mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .shell.collapsed .expand-btn {
        display: flex;
      }

      /* Nav */
      .nav {
        flex: 1;
        padding: 12px 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
      }
      .nav-section-label {
        font-size: 9px;
        font-weight: 600;
        color: var(--text-faint);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 4px 8px 8px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        transition: opacity 0.2s;
      }
      .shell.collapsed .nav-section-label {
        opacity: 0;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 10px;
        border-radius: 6px;
        text-decoration: none;
        color: var(--text-muted);
        font-size: 13px;
        font-weight: 500;
        transition: all 0.15s;
        white-space: nowrap;
        overflow: hidden;
        cursor: pointer;
      }
      .shell.collapsed .nav-item {
        justify-content: center;
        padding: 10px;
      }
      .nav-item:hover {
        background: var(--bg-hover);
        color: var(--text-secondary);
      }
      .nav-item.active {
        background: var(--bg-active);
        color: var(--accent-light);
        border: 1px solid rgba(99, 102, 241, 0.2);
      }
      .nav-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
        flex-shrink: 0;
      }
      .nav-label {
        transition: opacity 0.2s;
        overflow: hidden;
      }
      .shell.collapsed .nav-label {
        opacity: 0;
        width: 0;
      }

      /* Footer */
      .sidebar-footer {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 12px 16px;
        border-top: 1px solid var(--border);
        overflow: hidden;
        transition: opacity 0.2s;
      }
      .shell.collapsed .sidebar-footer {
        opacity: 0;
      }
      .api-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 6px var(--green);
        animation: blink 2s infinite;
        flex-shrink: 0;
      }
      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.4;
        }
      }
      .api-label {
        font-size: 10px;
        color: var(--text-faint);
        white-space: nowrap;
      }

      /* ── Main ────────────────────────────── */
      .main {
        flex: 1;
        min-width: 0;
        padding: 28px 32px;
        overflow-y: auto;
      }

      @media (max-width: 768px) {
        .shell {
          flex-direction: column;
        }
        .sidebar {
          width: 100% !important;
          height: auto;
          min-height: unset;
          flex-direction: row;
          position: relative;
          overflow-x: auto;
        }
        .brand {
          border-bottom: none;
          border-right: 1px solid var(--border);
        }
        .nav {
          flex-direction: row;
          padding: 8px;
        }
        .nav-section-label,
        .brand-text,
        .sidebar-footer,
        .toggle-btn,
        .expand-btn {
          display: none !important;
        }
        .nav-item {
          padding: 8px 10px;
        }
        .nav-label {
          display: none;
        }
        .main {
          padding: 16px;
        }
      }
    `,
  ],
})
export class AppComponent {
  collapsed = signal(false);

  navItems: NavItem[] = [
    { path: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: 'equipements', label: 'Équipements', icon: 'precision_manufacturing' },
    { path: 'pannes', label: 'Pannes', icon: 'warning_amber' },
    { path: 'techniciens', label: 'Techniciens', icon: 'engineering' },
    { path: 'interventions', label: 'Interventions', icon: 'build_circle' },
    { path: 'statistiques', label: 'Statistiques', icon: 'bar_chart' },
  ];
}
