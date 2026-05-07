import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let msg = 'Une erreur est survenue.';

      switch (error.status) {
        case 0:
          msg =
            'Impossible de contacter le serveur. Vérifiez que le backend tourne sur le port 8080.';
          break;
        case 400:
          const errors = error.error?.errors as Record<string, string> | undefined;
          if (errors && Object.keys(errors).length > 0) {
            msg = Object.values(errors).join(' • ');
          } else {
            msg = error.error?.message || 'Données invalides.';
          }
          break;
        case 404:
          msg = error.error?.message || 'Ressource introuvable.';
          break;
        case 422:
          // BusinessRuleException — shows exact French message from backend
          msg = error.error?.message || 'Règle métier violée.';
          break;
        case 500:
          msg = 'Erreur interne du serveur.';
          break;
        default:
          msg = error.error?.message || `Erreur ${error.status}.`;
      }

      notify.error(msg);
      return throwError(() => error);
    }),
  );
};
