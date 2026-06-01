import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-upload-paper',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatButtonModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './upload-paper.component.html',
  styleUrl: './upload-paper.component.scss',
})
export class UploadPaperComponent implements OnInit {
  private api       = inject(ApiService);
  private auth      = inject(AuthService);
  private router    = inject(Router);
  private sanitizer = inject(DomSanitizer);

  // ── Classes ───────────────────────────────────────────────
  classes: { id: number; name: string }[] = [];
  classesLoading = true;
  selectedClassId: number | null = null;

  ngOnInit() {
    const teacherId = this.auth.getUser()?.id ?? 0;
    this.api.getTeacherOverview(teacherId).subscribe({
      next: data => { this.classes = data.classes ?? []; this.classesLoading = false; },
      error: ()   => { this.classesLoading = false; },
    });
  }

  // ── Form fields ───────────────────────────────────────────
  title       = '';
  instruction = '';
  timeDuration: number | null = null;
  dueDate     = '';

  // ── Paper file ────────────────────────────────────────────
  paperFile:     File | null = null;
  paperPreview:  SafeResourceUrl | null = null;
  paperIsImage   = false;
  paperDragOver  = false;

  // ── Excel file ────────────────────────────────────────────
  excelFile:    File | null = null;
  excelDragOver = false;

  // ── State ─────────────────────────────────────────────────
  uploading  = false;
  uploadError = '';
  result: any = null;

  // ── Title auto-capitalize ─────────────────────────────────
  onTitleInput() {
    if (!this.title) return;
    this.title = this.title.replace(/\b\w/g, c => c.toUpperCase());
  }

  // ── Paper file ────────────────────────────────────────────
  onPaperSelected(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.setPaperFile(f);
    (event.target as HTMLInputElement).value = '';
  }
  onPaperDragOver(e: DragEvent) { e.preventDefault(); this.paperDragOver = true; }
  onPaperDragLeave() { this.paperDragOver = false; }
  onPaperDrop(e: DragEvent) {
    e.preventDefault(); this.paperDragOver = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) this.setPaperFile(f);
  }
  private setPaperFile(f: File) {
    this.paperFile    = f;
    this.paperIsImage = f.type.startsWith('image/');
    const url = URL.createObjectURL(f);
    this.paperPreview = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  removePaper() { this.paperFile = null; this.paperPreview = null; }

  // ── Excel file ────────────────────────────────────────────
  onExcelSelected(event: Event) {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.excelFile = f;
    (event.target as HTMLInputElement).value = '';
  }
  onExcelDragOver(e: DragEvent) { e.preventDefault(); this.excelDragOver = true; }
  onExcelDragLeave() { this.excelDragOver = false; }
  onExcelDrop(e: DragEvent) {
    e.preventDefault(); this.excelDragOver = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) this.excelFile = f;
  }
  removeExcel() { this.excelFile = null; }

  // ── Helpers ───────────────────────────────────────────────
  formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1_048_576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1_048_576).toFixed(1) + ' MB';
  }

  get canSubmit() {
    return this.selectedClassId && this.title.trim() && this.timeDuration && this.paperFile && this.excelFile && !this.uploading;
  }

  // ── Submit ────────────────────────────────────────────────
  submit() {
    if (!this.canSubmit) return;
    this.uploading   = true;
    this.uploadError = '';

    const fd = new FormData();
    fd.append('teacherId',    String(this.auth.getUser()?.id ?? 0));
    fd.append('classId',      String(this.selectedClassId));
    fd.append('title',        this.title.trim());
    fd.append('timeDuration', String(this.timeDuration));
    if (this.instruction.trim()) fd.append('instruction', this.instruction.trim());
    if (this.dueDate)            fd.append('dueDate',     this.dueDate);
    fd.append('paper', this.paperFile!,  this.paperFile!.name);
    fd.append('excel', this.excelFile!, this.excelFile!.name);

    this.api.createQuiz(fd).subscribe({
      next:  (res) => { this.result = res; this.uploading = false; },
      error: (err) => { this.uploadError = err?.error?.message ?? 'Upload failed.'; this.uploading = false; },
    });
  }

  reset() {
    this.title = ''; this.instruction = ''; this.timeDuration = null; this.dueDate = '';
    this.selectedClassId = null;
    this.paperFile = null; this.paperPreview = null; this.excelFile = null;
    this.result = null; this.uploadError = '';
  }
}
