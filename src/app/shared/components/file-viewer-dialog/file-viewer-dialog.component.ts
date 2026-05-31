import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../../services/api.service';

export interface FileViewerDialogData {
  files: { id: number; fileName: string; fileType: string; fileSize: number }[];
  teacherId: number;
  classId: number;
  assignmentId: number;
  assignmentTitle: string;
}

@Component({
  selector: 'app-file-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './file-viewer-dialog.component.html',
  styleUrl: './file-viewer-dialog.component.scss',
})
export class FileViewerDialogComponent implements OnDestroy {
  selectedFile: { id: number; fileName: string; fileType: string; fileSize: number } | null = null;
  previewUrl: SafeResourceUrl | null = null;
  previewLoading = false;
  previewError   = false;
  private objectUrls: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<FileViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileViewerDialogData,
    private api: ApiService,
    private sanitizer: DomSanitizer,
  ) {
    if (data.files?.length > 0) this.selectFile(data.files[0]);
  }

  selectFile(file: { id: number; fileName: string; fileType: string; fileSize: number }) {
    if (this.selectedFile?.id === file.id) return;
    this.selectedFile  = file;
    this.previewUrl    = null;
    this.previewError  = false;
    this.previewLoading = true;

    this.api.getAssignmentFileBlob(
      this.data.teacherId, this.data.classId, this.data.assignmentId, file.id
    ).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.objectUrls.push(url);
        this.previewUrl     = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.previewLoading = false;
      },
      error: () => { this.previewLoading = false; this.previewError = true; },
    });
  }

  isImage(f: any) { return f?.fileType?.startsWith('image/'); }
  isPdf(f: any)   { return f?.fileType === 'application/pdf'; }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/'))        return 'image';
    if (fileType === 'application/pdf')        return 'picture_as_pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'description';
    if (fileType.includes('sheet') || fileType.includes('excel'))   return 'table_chart';
    return 'insert_drive_file';
  }

  getFileIconColor(fileType: string): string {
    if (fileType.startsWith('image/'))        return '#10b981';
    if (fileType === 'application/pdf')        return '#ef4444';
    if (fileType.includes('word') || fileType.includes('document')) return '#3b82f6';
    if (fileType.includes('sheet') || fileType.includes('excel'))   return '#22c55e';
    return '#6b7280';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024)      return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  download() {
    if (!this.previewUrl || !this.selectedFile) return;
    const a = document.createElement('a');
    a.href     = this.objectUrls[this.objectUrls.length - 1];
    a.download = this.selectedFile.fileName;
    a.click();
  }

  ngOnDestroy() { this.objectUrls.forEach(u => URL.revokeObjectURL(u)); }
}
