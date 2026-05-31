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
import { ClassDialogData, CreateClassDialogComponent } from '../../../shared/components/create-class-dialog/create-class-dialog.component';
import { AssignmentDialogComponent, AssignmentDialogResult } from '../../../shared/components/assignment-dialog/assignment-dialog.component';
import { FileViewerDialogComponent } from '../../../shared/components/file-viewer-dialog/file-viewer-dialog.component';
import { AddStudentDialogComponent } from '../../../shared/components/add-student-dialog/add-student-dialog.component';

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

  addAssignmentLoading    = false;

  // ── Assignment pagination + filter ────────────────────────
  readonly ASGN_PAGE_SIZE = 6;
  assignmentPage          = 0;
  assignmentDateFrom      = '';

  get filteredAssignments(): any[] {
    const list: any[] = this.classDetail?.assignments ?? [];
    if (!this.assignmentDateFrom) return list;
    return list.filter((a: any) => (a.createdAt ?? '') >= this.assignmentDateFrom);
  }

  get pagedAssignments(): any[] {
    const s = this.assignmentPage * this.ASGN_PAGE_SIZE;
    return this.filteredAssignments.slice(s, s + this.ASGN_PAGE_SIZE);
  }

  get assignmentPageCount(): number {
    return Math.ceil(this.filteredAssignments.length / this.ASGN_PAGE_SIZE);
  }

  get assignmentPageEnd(): number {
    return Math.min((this.assignmentPage + 1) * this.ASGN_PAGE_SIZE, this.filteredAssignments.length);
  }

  onAssignmentFilterChange() { this.assignmentPage = 0; }

  // ── Clipboard ─────────────────────────────────────────────
  copiedCode = '';

  copyCode(code: string, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      setTimeout(() => this.copiedCode = '', 1800);
    });
  }

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
    const data: ClassDialogData = { mode: 'create' };
    this.dialog.open(CreateClassDialogComponent, { width: '460px', disableClose: true, data })
      .afterClosed()
      .subscribe((result: any) => {
        if (!result) return;
        this.api.createTeacherClass(this.teacherId, result).subscribe({
          next: (newClass) => { this.loadOverview(); this.openClassDetail(newClass); },
          error: (err)    => alert(err?.error?.message ?? 'Could not create class.'),
        });
      });
  }

  editClass(cls: any) {
    const data: ClassDialogData = { mode: 'edit', class: cls };
    this.dialog.open(CreateClassDialogComponent, { width: '460px', disableClose: true, data })
      .afterClosed()
      .subscribe((result: any) => {
        if (!result) return;
        this.api.updateTeacherClass(this.teacherId, cls.id, result).subscribe({
          next: () => {
            this.loadOverview();
            if (this.view === 'class-detail') this.refreshClassDetail();
          },
          error: (err) => alert(err?.error?.message ?? 'Could not update class.'),
        });
      });
  }

  confirmDeleteClass(cls: any) {
    this.openConfirm({
      title:        'Delete Class',
      message:      `Delete "${cls.name}"?`,
      detail:       'All assignments will be removed and students unenrolled.',
      icon:         'delete_forever',
      iconClass:    'icon-warn',
      confirmLabel: 'Delete',
      confirmColor: 'warn',
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.api.deleteTeacherClass(this.teacherId, cls.id).subscribe({
        next: () => {
          if (this.view === 'class-detail') this.closeClassDetail();
          else this.loadOverview();
        },
        error: (err) => alert(err?.error?.message ?? 'Could not delete class.'),
      });
    });
  }

  // ── Class detail ──────────────────────────────────────────

  openClassDetail(cls: any) {
    this.view               = 'class-detail';
    this.classDetail        = null;
    this.classDetailLoading = true;
    this.classDetailError   = '';
    this.showAddStudentForm = false;
    this.addStudentMobile   = '';
    this.addStudentError    = '';
    this.assignmentPage     = 0;
    this.assignmentDateFrom = '';

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

  openAssignmentDialog() {
    this.dialog
      .open(AssignmentDialogComponent, {
        width: '560px',
        disableClose: true,
        data: { className: this.classDetail?.name ?? '' },
      })
      .afterClosed()
      .subscribe((result: AssignmentDialogResult | null) => {
        if (!result) return;
        this.addAssignmentLoading = true;
        this.api.createAssignment(this.teacherId, this.classDetail.id, {
          title:       result.title,
          description: result.description,
          dueDate:     result.dueDate,
        }).subscribe({
          next: (assignment) => {
            const done = () => { this.addAssignmentLoading = false; this.refreshClassDetail(); };
            if (result.files?.length > 0) {
              this.api.uploadAssignmentFiles(this.teacherId, this.classDetail.id, assignment.id, result.files)
                .subscribe({ next: done, error: done });
            } else { done(); }
          },
          error: (err) => {
            this.addAssignmentLoading = false;
            alert(err?.error?.message ?? 'Could not create assignment.');
          },
        });
      });
  }

  editAssignment(assignment: any) {
    this.dialog
      .open(AssignmentDialogComponent, {
        width: '560px',
        disableClose: true,
        data: { className: this.classDetail?.name ?? '', mode: 'edit', assignment },
      })
      .afterClosed()
      .subscribe((result: AssignmentDialogResult | null) => {
        if (!result) return;
        this.api.updateAssignment(this.teacherId, this.classDetail.id, assignment.id, {
          title:       result.title,
          description: result.description,
          dueDate:     result.dueDate,
        }).subscribe({
          next: () => {
            const deletes  = result.filesToDelete ?? [];
            const newFiles = result.files         ?? [];
            let pending    = deletes.length + (newFiles.length > 0 ? 1 : 0);
            if (pending === 0) { this.refreshClassDetail(); return; }
            const done = () => { if (--pending === 0) this.refreshClassDetail(); };
            deletes.forEach(fid =>
              this.api.deleteAssignmentFile(this.teacherId, this.classDetail.id, assignment.id, fid)
                .subscribe({ next: done, error: done })
            );
            if (newFiles.length > 0) {
              this.api.uploadAssignmentFiles(this.teacherId, this.classDetail.id, assignment.id, newFiles)
                .subscribe({ next: done, error: done });
            }
          },
          error: (err) => alert(err?.error?.message ?? 'Could not update assignment.'),
        });
      });
  }

  openAddStudentDialog(cls: any, event: Event) {
    event.stopPropagation();
    this.dialog.open(AddStudentDialogComponent, {
      width: '480px',
      disableClose: false,
      data: { className: cls.name, teacherId: this.teacherId, classId: cls.id },
    }).afterClosed().subscribe(added => {
      if (added) this.loadOverview();
    });
  }

  openFileViewer(assignment: any) {
    this.dialog.open(FileViewerDialogComponent, {
      width: '820px',
      maxHeight: '88vh',
      data: {
        files:           assignment.files ?? [],
        teacherId:       this.teacherId,
        classId:         this.classDetail.id,
        assignmentId:    assignment.id,
        assignmentTitle: assignment.title,
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
