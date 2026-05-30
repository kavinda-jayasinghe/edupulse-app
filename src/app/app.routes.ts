import { Routes } from '@angular/router';
import { authGuard, adminGuard, teacherGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Auth pages (redirect to /home if already logged in) ──
  { path: 'login',  loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),   canActivate: [guestGuard] },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent), canActivate: [guestGuard] },

  // ── Admin route ───────────────────────────────────────────
  { path: 'admin',   loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),     canActivate: [adminGuard] },
  { path: 'teacher', loadComponent: () => import('./pages/teacher/teacher.component').then(m => m.TeacherComponent), canActivate: [teacherGuard] },

  // ── Protected dashboard routes ────────────────────────────
  { path: 'home',          loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),                  canActivate: [authGuard] },
  { path: 'exams',         loadComponent: () => import('./modules/exams/exams.component').then(m => m.ExamsComponent),                  canActivate: [authGuard] },
  { path: 'rankings',      loadComponent: () => import('./modules/rankings/rankings.component').then(m => m.RankingsComponent),          canActivate: [authGuard] },
  { path: 'notifications', loadComponent: () => import('./modules/notifications/notifications.component').then(m => m.NotificationsComponent), canActivate: [authGuard] },
  { path: 'profile',       loadComponent: () => import('./modules/profile/profile.component').then(m => m.ProfileComponent),            canActivate: [authGuard] },
  { path: 'questions',     loadComponent: () => import('./modules/question/question.component').then(m => m.QuestionComponent),         canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' },
];
