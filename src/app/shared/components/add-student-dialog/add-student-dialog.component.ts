import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api.service';

export interface AddStudentDialogData {
  className: string;
  teacherId: number;
  classId:   number;
}

@Component({
  selector: 'app-add-student-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './add-student-dialog.component.html',
  styleUrl:    './add-student-dialog.component.scss',
})
export class AddStudentDialogComponent {
  mobile          = '';
  searching       = false;
  adding          = false;
  foundStudent: { id: number; name: string; mobile: string } | null = null;
  searchError     = '';
  addError        = '';
  addSuccess      = false;

  constructor(
    public dialogRef: MatDialogRef<AddStudentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddStudentDialogData,
    private api: ApiService,
  ) {}

  search() {
    const m = this.mobile.trim();
    if (!m) return;
    this.searching    = true;
    this.foundStudent = null;
    this.searchError  = '';
    this.addError     = '';
    this.addSuccess   = false;

    this.api.searchStudentByMobile(this.data.teacherId, m).subscribe({
      next: (student) => { this.foundStudent = student; this.searching = false; },
      error: (err)    => {
        this.searchError = err?.error?.message ?? 'No student found with this mobile number.';
        this.searching   = false;
      },
    });
  }

  add() {
    if (!this.foundStudent) return;
    this.adding   = true;
    this.addError = '';

    this.api.addStudentToClass(this.data.teacherId, this.data.classId, this.foundStudent.mobile).subscribe({
      next: () => {
        this.addSuccess = true;
        this.adding     = false;
        setTimeout(() => this.dialogRef.close(true), 1200);
      },
      error: (err) => {
        this.addError = err?.error?.message ?? 'Could not add student.';
        this.adding   = false;
      },
    });
  }

  reset() {
    this.mobile       = '';
    this.foundStudent = null;
    this.searchError  = '';
    this.addError     = '';
    this.addSuccess   = false;
  }
}
