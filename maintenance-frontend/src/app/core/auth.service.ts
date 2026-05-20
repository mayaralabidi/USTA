import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  username: string;
  role: 'ADMIN' | 'TECHNICIEN';
  token: string;
}

export interface SetupStatus {
  bootstrapRequired: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'auth_user';

  private _user = signal<AuthUser | null>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly token = computed(() => this._user()?.token ?? null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string) {
    return this.http.post<AuthUser>(`${this.API}/login`, { username, password }).pipe(
      tap((user) => {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
    );
  }

  logout() {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  register(username: string, password: string, role: 'ADMIN' | 'TECHNICIEN') {
    return this.http.post<AuthUser>(`${this.API}/register`, { username, password, role }).pipe(
      tap((user) => {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
    );
  }

  bootstrapAdmin(username: string, password: string) {
    return this.http.post<AuthUser>(`${this.API}/bootstrap-admin`, { username, password }).pipe(
      tap((user) => {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        this._user.set(user);
      }),
    );
  }

  getSetupStatus() {
    return this.http.get<SetupStatus>(`${this.API}/setup-status`);
  }

  private loadFromStorage(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
