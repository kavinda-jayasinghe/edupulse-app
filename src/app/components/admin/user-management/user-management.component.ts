import { Component, inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { map } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogData, ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule,
      MatCardModule, MatButtonModule, MatIconModule,
      MatTableModule, MatSelectModule, MatFormFieldModule, MatInputModule,
      MatProgressSpinnerModule, MatDividerModule, MatTooltipModule,
      MatPaginatorModule, MatDialogModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private dialog = inject(MatDialog);

  loading         = true;
  error           = '';
  rankingsLoading = false;

  adminName     = '';
  stats: any    = null;
  classOverview: any[] = [];
  rankings: any[]      = [];
  selectedClassId: number | null = null;

  rankColumns = ['rank', 'name', 'exams', 'avgScore', 'totalScore'];

  // ── User management ──────────────────────────────────────
  searchMobile  = '';
  searchResult: any = null;
  searchError   = '';
  searching     = false;

  allUsers: any[]  = [];
  totalUsers       = 0;
  currentPage      = 0;
  pageSize         = 10;
  userColumns      = ['name', 'mobile', 'type', 'status', 'actions'];

  ngOnInit() {
    const user     = this.auth.getUser();
    this.adminName = user?.name ?? 'Admin';
    this.loading   = false;
    this.loadAllUsers();
  }

  // ── User loading ─────────────────────────────────────────

  loadAllUsers(page = this.currentPage, size = this.pageSize) {
    this.api.getAdminUsers(page, size).subscribe({
      next: res => {
        this.allUsers    = res.content;
        this.totalUsers  = res.totalElements;
        this.currentPage = res.page;
      },
      error: () => {},
    });
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize    = event.pageSize;
    this.loadAllUsers(event.pageIndex, event.pageSize);
  }

  // ── Search ───────────────────────────────────────────────

  searchUser() {
    if (!this.searchMobile.trim()) return;
    this.searching    = true;
    this.searchResult = null;
    this.searchError  = '';
    this.api.searchAdminUser(this.searchMobile.trim()).subscribe({
      next: user => { this.searchResult = user; this.searching = false; },
      error: err => {
        this.searchError = err.error?.message ?? 'User not found';
        this.searching   = false;
      },
    });
  }

  // ── CRUD with confirmation ────────────────────────────────

  changeProfileType(userId: number, newType: string, name: string) {
    const isTeacher = newType === 'TEACHER';
    this.openConfirm({
      title:        isTeacher ? 'Make Teacher?' : 'Make Student?',
      message:      `Are you sure you want to ${isTeacher ? 'promote' : 'demote'} ${name}?`,
      detail:       isTeacher
                      ? 'They will gain access to the Teacher Dashboard.'
                      : 'They will lose teacher access and see the Student Dashboard.',
      icon:         isTeacher ? 'school' : 'person',
      iconClass:    'icon-primary',
      confirmLabel: isTeacher ? 'Make Teacher' : 'Make Student',
      confirmColor: 'primary',
    }).subscribe(ok => {
      if (!ok) return;
      this.api.changeProfileType(userId, newType).subscribe({
        next: res => {
          if (this.searchResult?.id === userId) this.searchResult.profileType = res.profileType;
          const u = this.allUsers.find((x: any) => x.id === userId);
          if (u) u.profileType = res.profileType;
        },
        error: () => {},
      });
    });
  }

  toggleEnabled(userId: number, name: string, currentEnabled: boolean) {
    const willDisable = currentEnabled;
    this.openConfirm({
      title:        willDisable ? 'Disable Account?' : 'Enable Account?',
      message:      willDisable
                      ? `Disable ${name}'s account?`
                      : `Enable ${name}'s account?`,
      detail:       willDisable
                      ? 'They will not be able to log in until re-enabled.'
                      : 'They will be able to log in again.',
      icon:         willDisable ? 'block' : 'check_circle',
      iconClass:    willDisable ? 'icon-warn' : 'icon-primary',
      confirmLabel: willDisable ? 'Disable' : 'Enable',
      confirmColor: willDisable ? 'warn' : 'primary',
    }).subscribe(ok => {
      if (!ok) return;
      this.api.toggleUserEnabled(userId).subscribe({
        next: res => {
          if (this.searchResult?.id === userId) this.searchResult.enabled = res.enabled;
          const u = this.allUsers.find((x: any) => x.id === userId);
          if (u) u.enabled = res.enabled;
        },
        error: () => {},
      });
    });
  }

  deleteUser(userId: number, name: string) {
    this.openConfirm({
      title:        'Delete User?',
      message:      `Are you sure you want to delete "${name}"?`,
      detail:       'This cannot be undone. All exam records and notifications will also be permanently deleted.',
      icon:         'delete_forever',
      iconClass:    'icon-warn',
      confirmLabel: 'Delete',
      confirmColor: 'warn',
    }).subscribe(ok => {
      if (!ok) return;
      this.api.deleteAdminUser(userId).subscribe({
        next: () => {
          if (this.searchResult?.id === userId) this.searchResult = null;
          this.allUsers    = this.allUsers.filter((u: any) => u.id !== userId);
          this.totalUsers  = Math.max(0, this.totalUsers - 1);
        },
        error: () => {},
      });
    });
  }

  // ── Rankings ─────────────────────────────────────────────

  loadRankings(classId: number) {
    this.selectedClassId = classId;
    this.rankingsLoading = true;
    this.api.getAdminRankings(classId).subscribe({
      next: data => { this.rankings = data; this.rankingsLoading = false; },
      error: () => { this.rankingsLoading = false; },
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  private openConfirm(data: ConfirmDialogData) {
    return this.dialog
      .open(ConfirmDialogComponent, { width: '400px', data, disableClose: true })
      .afterClosed()
      .pipe(map((r: any) => !!r));
  }

  classNames(classes: any[]): string {
    if (!classes?.length) return '—';
    return classes.map((c: any) => c.name).join(', ');
  }

  rankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }
}
