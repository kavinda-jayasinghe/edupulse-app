import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http       = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private base       = environment.apiUrl;

  login(mobile: string, password: string) {
    return this.http.post<{ token: string; user: any }>(`${this.base}/auth/login`, { mobile, password }).pipe(
      tap(res => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user',  JSON.stringify(res.user));
        }
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('token') : null;
  }

  getUser(): any | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  updateUserCache(partial: { name?: string; mobile?: string }) {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = this.getUser();
    if (user) localStorage.setItem('user', JSON.stringify({ ...user, ...partial }));
  }
}
