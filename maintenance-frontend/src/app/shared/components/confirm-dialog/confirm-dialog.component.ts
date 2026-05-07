import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="dialog-header">
      <span class="dialog-title">{{ data.title }}</span>
      <button mat-icon-button (click)="ref.close(false)">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    <div class="dialog-body">
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">
        {{ data.message }}
      </p>
    </div>
    <div class="dialog-footer">
      <button mat-button class="btn-ghost" (click)="ref.close(false)">Annuler</button>
      <button mat-flat-button class="btn-danger" (click)="ref.close(true)">
        {{ data.confirmLabel || 'Confirmer' }}
      </button>
    </div>
  `,
  styles: [
    `
      .btn-danger {
        background: linear-gradient(135deg, #ef4444, #dc2626) !important;
        color: #fff !important;
        border-radius: 8px !important;
        font-weight: 600 !important;
        font-size: 12px !important;
        height: 34px !important;
        font-family: var(--font-sans) !important;
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
  ) {}
}
