import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title:        string;
  message:      string;
  detail?:      string;
  icon:         string;
  iconClass:    'icon-primary' | 'icon-warn' | 'icon-amber';
  confirmLabel: string;
  confirmColor: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-wrapper">
      <div class="confirm-icon" [ngClass]="data.iconClass">
        <mat-icon>{{ data.icon }}</mat-icon>
      </div>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <mat-dialog-content>
        <p class="main-msg">{{ data.message }}</p>
        <p class="detail-msg" *ngIf="data.detail">{{ data.detail }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button mat-dialog-close>Cancel</button>
        <button mat-raised-button [color]="data.confirmColor" [mat-dialog-close]="true">
          {{ data.confirmLabel }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-wrapper {
      padding: 8px 0;
      min-width: 300px;
      max-width: 400px;
    }
    .confirm-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px;
    }
    .confirm-icon mat-icon {
      font-size: 32px;
      height: 32px;
      width: 32px;
    }
    .icon-primary { background: #e0f2fe; }
    .icon-primary mat-icon { color: #0369a1; }
    .icon-warn    { background: #fef2f2; }
    .icon-warn    mat-icon { color: #dc2626; }
    .icon-amber   { background: #fef3c7; }
    .icon-amber   mat-icon { color: #d97706; }
    h2[mat-dialog-title] {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    mat-dialog-content {
      text-align: center;
    }
    .main-msg {
      font-size: 14px;
      color: rgba(0,0,0,0.7);
      margin: 0 0 6px;
    }
    .detail-msg {
      font-size: 12px;
      color: rgba(0,0,0,0.45);
      margin: 0;
    }
    mat-dialog-actions {
      padding: 16px 0 0;
      gap: 8px;
    }
  `],
})
export class ConfirmDialogComponent {
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
}
