import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  user;
  isLoading = false;
  disponibilite = false;
  techEmail = '';

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.user = this.auth.user;
  }

  ngOnInit() {
    // Load technician data if user is technician
    if (this.user()?.role === 'TECHNICIEN') {
      this.loadTechnicianData();
    }
  }

  loadTechnicianData() {
    // Fetch the current user's technicien record from the server
    this.api.getMyTechnicien().subscribe({
      next: (tech) => {
        if (tech) {
          setTimeout(() => {
            this.disponibilite = tech.disponibilite;
            this.techEmail = tech.email || '';
            this.cdr.detectChanges();
          });
        }
      },
      error: (err) => {
        console.error('Error loading technician data', err);
      },
    });
  }

  getRoleDisplay(): string {
    const role = this.user()?.role;
    return role === 'ADMIN' ? 'Administrateur' : 'Technicien';
  }

  getRoleBadgeClass(): string {
    return this.user()?.role === 'ADMIN' ? 'badge-admin' : 'badge-tech';
  }

  toggleDisponibilite(event: any) {
    // Defer updating bound UI values to the next macrotask to avoid
    // ExpressionChangedAfterItHasBeenCheckedError during the current change detection.
    const newValue = event?.checked ?? !this.disponibilite;
    this.isLoading = true;

    // Apply the user's action after the current tick so Angular won't complain
    setTimeout(() => {
      this.disponibilite = newValue;
      this.cdr.detectChanges();
    });

    this.api.patch<any>('/techniciens/me/disponibilite', { disponibilite: newValue }).subscribe({
      next: (response) => {
        console.debug('Disponibilite toggle response:', response);
        this.loadTechnicianData();
        this.api.notifyTechniciensChanged();
        this.snackBar.open(
          newValue ? 'Vous êtes maintenant disponible' : 'Vous êtes maintenant indisponible',
          'Fermer',
          { duration: 3000 },
        );
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        // revert UI on error after the tick
        setTimeout(() => {
          this.disponibilite = !newValue;
          this.cdr.detectChanges();
        });
        this.isLoading = false;
      },
    });
  }
}
