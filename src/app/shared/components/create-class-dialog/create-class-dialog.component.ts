import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ClassDialogData {
  mode: 'create' | 'edit';
  class?: { id: number; name: string; classCode: string; subject: string };
}

@Component({
  selector: 'app-create-class-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatIconModule, MatTooltipModule,
  ],
  template: `
    <div class="create-dialog">
      <div class="dialog-icon-wrap" [class.edit-mode]="isEdit">
        <mat-icon>{{ isEdit ? 'edit' : 'add_circle' }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ isEdit ? 'Edit Class' : 'Create New Class' }}</h2>

      <mat-dialog-content>
        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Class Name</mat-label>
          <input matInput [(ngModel)]="form.name" placeholder="e.g. Grade 10 – Maths">
          <mat-icon matSuffix>class</mat-icon>
        </mat-form-field>

        <div class="code-row">
          <mat-form-field appearance="outline" class="code-field">
            <mat-label>Class Code</mat-label>
            <input matInput [(ngModel)]="form.classCode" maxlength="20"
                   placeholder="e.g. MTH101" (input)="upperCode()">
            <mat-icon matSuffix>vpn_key</mat-icon>
            <mat-hint>Students use this to join</mat-hint>
          </mat-form-field>
          <button mat-icon-button type="button" (click)="generateCode()"
                  matTooltip="Generate new code" class="refresh-btn">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <mat-form-field appearance="outline" class="full-w">
          <mat-label>Subject Area (Optional)</mat-label>
          <input matInput [(ngModel)]="form.subject" placeholder="e.g. Mathematics">
          <mat-icon matSuffix>subject</mat-icon>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary"
                [disabled]="!form.name.trim() || !form.classCode.trim()"
                [mat-dialog-close]="form">
          <mat-icon>check</mat-icon> {{ isEdit ? 'Update Class' : 'Create Class' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .create-dialog {
      padding: 8px 0;
      min-width: 340px;
      max-width: 460px;
    }
    .dialog-icon-wrap {
      width: 64px; height: 64px; border-radius: 50%;
      background: #e0f2fe;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 8px;
      mat-icon { font-size: 32px; height: 32px; width: 32px; color: #0369a1; }
    }
    .dialog-icon-wrap.edit-mode {
      background: #fef3c7;
      mat-icon { color: #d97706; }
    }
    h2[mat-dialog-title] {
      text-align: center; font-size: 18px; font-weight: 700; margin: 0 0 12px;
    }
    mat-dialog-content { display: flex; flex-direction: column; gap: 4px; }
    .full-w { width: 100%; }
    .code-row {
      display: flex; align-items: flex-start; gap: 8px;
      .code-field { flex: 1; }
      .refresh-btn { margin-top: 8px; }
    }
    mat-dialog-actions { padding: 16px 0 0; gap: 8px; }
  `],
})
export class CreateClassDialogComponent {
  form = { name: '', classCode: '', subject: '' };
  isEdit = false;

  constructor(@Inject(MAT_DIALOG_DATA) data: ClassDialogData | null) {
    if (data?.mode === 'edit' && data.class) {
      this.isEdit = true;
      this.form   = { name: data.class.name, classCode: data.class.classCode, subject: data.class.subject ?? '' };
    } else {
      this.generateCode();
    }
  }

  generateCode() {
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.form.classCode = Array.from({ length: 6 }, () => c[Math.floor(Math.random() * c.length)]).join('');
  }

  upperCode() {
    this.form.classCode = this.form.classCode.toUpperCase();
  }
}
