import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const notify = inject(NotificationService);
  const router = inject(Router);
  const auth = inject(AuthService);

  // Attach JWT token
  const token = auth.token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let msg = 'Une erreur est survenue.';

      switch (error.status) {
        case 0:
          msg =
            'Impossible de contacter le serveur. Vérifiez que le backend tourne sur le port 8080.';
          break;
        case 400:
          const errors = error.error?.errors as Record<string, string> | undefined;
          msg =
            errors && Object.keys(errors).length > 0
              ? Object.values(errors).join(' • ')
              : error.error?.message || 'Données invalides.';
          break;
        case 401:
          auth.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        case 403:
          msg = 'Accès refusé. Droits insuffisants.';
          break;
        case 404:
          msg = error.error?.message || 'Ressource introuvable.';
          break;
        case 422:
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
