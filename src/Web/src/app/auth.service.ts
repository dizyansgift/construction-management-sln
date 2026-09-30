import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';

export interface AuthSession {
  accessToken: string;
  expiresUtc: string;
  userId: string;
  displayName: string;
}

const STORAGE_KEY = 'slate.auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = apiUrl('/api/auth');
  readonly session = signal<AuthSession | null>(readSession());
  readonly isLoggedIn = computed(() => {
    const current = this.session();
    if (!current?.accessToken) return false;
    const expires = Date.parse(current.expiresUtc);
    return Number.isNaN(expires) || expires > Date.now();
  });
  readonly displayName = computed(() => this.session()?.displayName || 'SLATE user');
  readonly initials = computed(() =>
    this.displayName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'SU',
  );

  login(email: string, password: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.endpoint}/login`, { email, password }).pipe(
      tap((session) => this.store(session)),
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not sign in.')))),
    );
  }

  register(email: string, password: string, displayName: string): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.endpoint}/register`, { email, password, displayName }).pipe(
      tap((session) => this.store(session)),
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not create the account.')))),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
  }

  token(): string {
    return this.session()?.accessToken ?? '';
  }

  private store(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }
}

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed?.accessToken ? parsed : null;
  } catch {
    return null;
  }
}
