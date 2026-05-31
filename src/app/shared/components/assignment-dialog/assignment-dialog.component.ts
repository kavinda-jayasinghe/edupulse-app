import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface ExistingFile { id: number; fileName: string; fileType: string; fileSize: number; }

export interface AssignmentDialogData {
  className: string;
  mode?: 'create' | 'edit';
  assignment?: { id: number; title: string; description: string; dueDate: string; files?: ExistingFile[] };
}

export interface AssignmentDialogResult {
  title: string;
  description: string;
  dueDate: string;
  files: File[];
  filesToDelete: number[];
}

@Component({
  selector: 'app-assignment-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTooltipModule,
  ],
  templateUrl: './assignment-dialog.component.html',
  styleUrl: './assignment-dialog.component.scss',
})
export class AssignmentDialogComponent {
  form = { title: '', description: '', dueDate: '' };
  filePreviews: { file: File; url: string | null; type: 'image' | 'pdf' | 'other' }[] = [];
  existingFiles: ExistingFile[] = [];
  removedFileIds: number[]      = [];
  dragOver = false;
  isEdit   = false;

  constructor(
    public dialogRef: MatDialogRef<AssignmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignmentDialogData,
  ) {
    if (data?.mode === 'edit' && data.assignment) {
      this.isEdit = true;
      this.form   = {
        title:       data.assignment.title       ?? '',
        description: data.assignment.description ?? '',
        dueDate:     data.assignment.dueDate     ?? '',
      };
      this.existingFiles = (data.assignment.files ?? []).map(f => ({ ...f }));
    }
  }

  removeExistingFile(index: number) {
    const removed = this.existingFiles.splice(index, 1)[0];
    this.removedFileIds.push(removed.id);
  }

  existingFileIcon(fileType: string): string {
    if (fileType.startsWith('image/'))     return 'image';
    if (fileType === 'application/pdf')    return 'picture_as_pdf';
    if (fileType.includes('word'))         return 'description';
    return 'insert_drive_file';
  }

  existingFileIconColor(fileType: string): string {
    if (fileType.startsWith('image/'))     return '#10b981';
    if (fileType === 'application/pdf')    return '#ef4444';
    if (fileType.includes('word'))         return '#3b82f6';
    return '#6b7280';
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) { this.addFiles(Array.from(input.files)); input.value = ''; }
  }

  onDragOver(event: DragEvent) { event.preventDefault(); this.dragOver = true; }
  onDragLeave() { this.dragOver = false; }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files) this.addFiles(Array.from(event.dataTransfer.files));
  }

  private addFiles(files: File[]) {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e =>
          this.filePreviews.push({ file, url: e.target?.result as string, type: 'image' });
        reader.readAsDataURL(file);
      } else {
        const type: 'pdf' | 'other' = file.type === 'application/pdf' ? 'pdf' : 'other';
        this.filePreviews.push({ file, url: null, type });
      }
    });
  }

  removeFile(index: number) { this.filePreviews.splice(index, 1); }

  getFileIcon(type: string): string {
    return type === 'pdf' ? 'picture_as_pdf' : 'insert_drive_file';
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  submit() {
    if (!this.form.title.trim()) return;
    this.dialogRef.close({
      ...this.form,
      files:         this.filePreviews.map(p => p.file),
      filesToDelete: this.removedFileIds,
    });
  }

  cancel() { this.dialogRef.close(null); }
}
