import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs/operators';

import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CreateClassDialogComponent } from '../../../shared/components/create-class-dialog/create-class-dialog.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatDialogModule, MatTooltipModule,
  ],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl:    './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent implements OnInit {
  private api        = inject(ApiService);
  private auth       = inject(AuthService);
  private dialog     = inject(MatDialog);
  private platformId = inject(PLATFORM_ID);

  // ── Initial load ──────────────────────────────────────────
  loading      = true;
  error        = '';
  teacherName  = '';
  teacherId    = 0;
  stats: any   = null;
  classOverview: any[] = [];

  // ── View state ────────────────────────────────────────────
  view: 'dashboard' | 'class-detail' = 'dashboard';

  // ── Class detail ──────────────────────────────────────────
  classDetail: any        = null;
  classDetailLoading      = false;
  classDetailError        = '';

  showAddStudentForm      = false;
  addStudentMobile        = '';
  addStudentLoading       = false;
  addStudentError         = '';

  showAddAssignmentForm   = false;
  assignmentForm          = { title: '', description: '', dueDate: '' };
  addAssignmentLoading    = false;
  addAssignmentError      = '';

  studentColumns    = ['name', 'mobile', 'actions'];
  assignmentColumns = ['title', 'dueDate', 'actions'];

  // ── Lifecycle ─────────────────────────────────────────────

  ngOnInit() {
    const user      = this.auth.getUser();
    this.teacherName = user?.name ?? 'Teacher';
    this.teacherId   = user?.id   ?? 0;
    this.loadOverview();
  }

  // ── Dashboard ─────────────────────────────────────────────

  private loadOverview() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading = true;
    this.api.getTeacherOverview(this.teacherId).subscribe({
      next: data => {
        this.stats = {
          totalClasses:     data.totalClasses,
          totalStudents:    data.totalStudents,
          totalSubmissions: data.totalSubmissions,
        };
        this.classOverview = data.classes;
        this.error         = '';
        this.loading       = false;
      },
      error: (err) => {
        if (err?.status === 403) {
          this.error = 'Access denied: this account does not have teacher permissions. Please log in with a teacher account.';
        } else {
          this.error = 'Could not load teacher data. Is the backend running?';
        }
        this.loading = false;
      },
    });
  }

  openCreateClassDialog() {
    this.dialog.open(CreateClassDialogComponent, { width: '460px', disableClose: true })
      .afterClosed()
      .subscribe((result: any) => {
        if (!result) return;
        this.api.createTeacherClass(this.teacherId, result).subscribe({
          next: (newClass) => {
            this.loadOverview();
            this.openClassDetail(newClass);
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'Could not create class.';
            alert(msg);
          },
        });
      });
  }

  // ── Class detail ──────────────────────────────────────────

  openClassDetail(cls: any) {
    this.view              = 'class-detail';
    this.classDetail       = null;
    this.classDetailLoading = true;
    this.classDetailError  = '';
    this.showAddStudentForm    = false;
    this.showAddAssignmentForm = false;
    this.addStudentMobile      = '';
    this.addStudentError       = '';
    this.addAssignmentError    = '';
    this.assignmentForm        = { title: '', description: '', dueDate: '' };

    this.api.getTeacherClassDetail(this.teacherId, cls.id).subscribe({
      next:  data  => { this.classDetail = data; this.classDetailLoading = false; },
      error: ()    => { this.classDetailError = 'Could not load class details.'; this.classDetailLoading = false; },
    });
  }

  closeClassDetail() {
    this.view        = 'dashboard';
    this.classDetail = null;
    this.loadOverview();
  }

  private refreshClassDetail() {
    this.api.getTeacherClassDetail(this.teacherId, this.classDetail.id).subscribe({
      next:  data => this.classDetail = data,
      error: ()   => {},
    });
  }

  // ── Students ──────────────────────────────────────────────

  addStudent() {
    const mobile = this.addStudentMobile.trim();
    if (!mobile) return;
    this.addStudentLoading = true;
    this.addStudentError   = '';

    this.api.addStudentToClass(this.teacherId, this.classDetail.id, mobile).subscribe({
      next: () => {
        this.addStudentMobile      = '';
        this.addStudentLoading     = false;
        this.showAddStudentForm    = false;
        this.refreshClassDetail();
      },
      error: (err) => {
        this.addStudentError   = err?.error?.message ?? 'Could not add student.';
        this.addStudentLoading = false;
      },
    });
  }

  confirmRemoveStudent(student: any) {
    this.openConfirm({
      title:        'Remove Student',
      message:      `Remove ${student.name} from ${this.classDetail.name}?`,
      detail:       'The student can be re-enrolled later.',
      icon:         'person_remove',
      iconClass:    'icon-warn',
      confirmLabel: 'Remove',
      confirmColor: 'warn',
    }).subscribe(confirmed => {
      if (confirmed) {
        this.api.removeStudentFromClass(this.teacherId, this.classDetail.id, student.id).subscribe({
          next:  () => this.refreshClassDetail(),
          error: () => {},
        });
      }
    });
  }

  // ── Assignments ───────────────────────────────────────────

  createAssignment() {
    if (!this.assignmentForm.title.trim()) return;
    this.addAssignmentLoading = true;
    this.addAssignmentError   = '';

    this.api.createAssignment(this.teacherId, this.classDetail.id, this.assignmentForm).subscribe({
      next: () => {
        this.assignmentForm        = { title: '', description: '', dueDate: '' };
        this.addAssignmentLoading  = false;
        this.showAddAssignmentForm = false;
        this.refreshClassDetail();
      },
      error: (err) => {
        this.addAssignmentError   = err?.error?.message ?? 'Could not create assignment.';
        this.addAssignmentLoading = false;
      },
    });
  }

  confirmDeleteAssignment(assignment: any) {
    this.openConfirm({
      title:        'Delete Assignment',
      message:      `Delete "${assignment.title}"?`,
      detail:       'This action cannot be undone.',
      icon:         'delete_forever',
      iconClass:    'icon-warn',
      confirmLabel: 'Delete',
      confirmColor: 'warn',
    }).subscribe(confirmed => {
      if (confirmed) {
        this.api.deleteAssignment(this.teacherId, this.classDetail.id, assignment.id).subscribe({
          next:  () => this.refreshClassDetail(),
          error: () => {},
        });
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  private openConfirm(data: ConfirmDialogData) {
    return this.dialog
      .open(ConfirmDialogComponent, { width: '400px', data, disableClose: true })
      .afterClosed()
      .pipe(map((r: any) => !!r));
  }
}
