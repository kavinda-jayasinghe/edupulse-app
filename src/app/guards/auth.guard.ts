import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.parseUrl('/login');
};

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.parseUrl('/login');
  const user = auth.getUser();
  if (user?.profileType === 'ADMIN') return true;
  return router.parseUrl('/home');
};

export const teacherGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return router.parseUrl('/login');
  const user = auth.getUser();
  if (user?.profileType === 'TEACHER') return true;
  return router.parseUrl('/home');
};

export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;
  const user = auth.getUser();
  if (user?.profileType === 'ADMIN')   return router.parseUrl('/admin');
  if (user?.profileType === 'TEACHER') return router.parseUrl('/teacher');
  return router.parseUrl('/home');
};
