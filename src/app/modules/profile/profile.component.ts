import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  // ── Profile data ──────────────────────────────────────────
  loading      = true;
  error        = '';
  profile: any = null;

  // ── Edit name ─────────────────────────────────────────────
  editName        = false;
  nameValue       = '';
  nameSaving      = false;
  nameError       = '';
  nameSuccess     = '';

  // ── Edit mobile ───────────────────────────────────────────
  editMobile      = false;
  mobileValue     = '';
  mobileSaving    = false;
  mobileError     = '';
  mobileSuccess   = '';

  // ── Change password ───────────────────────────────────────
  currentPassword  = '';
  verifying        = false;
  verifyError      = '';
  passwordVerified = false;

  newPassword      = '';
  confirmPassword  = '';
  changingPassword = false;
  passwordError    = '';
  passwordSuccess  = '';

  showCurrentPw = false;
  showNewPw     = false;
  showConfirmPw = false;

  get userInitial(): string {
    return (this.profile?.name ?? 'U').charAt(0).toUpperCase();
  }

  ngOnInit() {
    const userId = this.auth.getUser()?.id ?? 0;
    this.api.getProfile(userId).subscribe({
      next: (data) => {
        this.profile     = data;
        this.nameValue   = data.name;
        this.mobileValue = data.mobile;
        this.loading     = false;
      },
      error: () => {
        this.error   = 'Could not load profile.';
        this.loading = false;
      },
    });
  }

  // ── Name edit ─────────────────────────────────────────────

  startEditName() {
    this.editName    = true;
    this.nameValue   = this.profile.name;
    this.nameError   = '';
    this.nameSuccess = '';
  }

  cancelEditName() {
    this.editName  = false;
    this.nameError = '';
  }

  saveName() {
    if (!this.nameValue.trim()) return;
    this.nameSaving = true;
    this.nameError  = '';
    const userId = this.auth.getUser()?.id ?? 0;
    this.api.updateProfile(userId, { name: this.nameValue.trim(), mobile: this.profile.mobile }).subscribe({
      next: (res) => {
        this.profile.name = res.name;
        this.auth.updateUserCache({ name: res.name });
        this.nameSuccess = 'Name updated.';
        this.editName    = false;
        this.nameSaving  = false;
        setTimeout(() => this.nameSuccess = '', 3000);
      },
      error: (err) => {
        this.nameError  = err?.error?.message ?? 'Could not update name.';
        this.nameSaving = false;
      },
    });
  }

  // ── Mobile edit ───────────────────────────────────────────

  startEditMobile() {
    this.editMobile    = true;
    this.mobileValue   = this.profile.mobile;
    this.mobileError   = '';
    this.mobileSuccess = '';
  }

  cancelEditMobile() {
    this.editMobile  = false;
    this.mobileError = '';
  }

  saveMobile() {
    if (!this.mobileValue.trim()) return;
    this.mobileSaving = true;
    this.mobileError  = '';
    const userId = this.auth.getUser()?.id ?? 0;
    this.api.updateProfile(userId, { name: this.profile.name, mobile: this.mobileValue.trim() }).subscribe({
      next: (res) => {
        this.profile.mobile = res.mobile;
        this.auth.updateUserCache({ mobile: res.mobile });
        this.mobileSuccess = 'Mobile updated.';
        this.editMobile    = false;
        this.mobileSaving  = false;
        setTimeout(() => this.mobileSuccess = '', 3000);
      },
      error: (err) => {
        this.mobileError  = err?.error?.message ?? 'Could not update mobile.';
        this.mobileSaving = false;
      },
    });
  }

  // ── Password ──────────────────────────────────────────────

  verifyCurrentPassword() {
    if (!this.currentPassword) return;
    this.verifying   = true;
    this.verifyError = '';
    const userId = this.auth.getUser()?.id ?? 0;
    this.api.verifyPassword(userId, this.currentPassword).subscribe({
      next: () => {
        this.passwordVerified = true;
        this.verifying        = false;
      },
      error: (err) => {
        this.verifyError = err?.error?.message ?? 'Incorrect password.';
        this.verifying   = false;
      },
    });
  }

  changePassword() {
    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.passwordError = this.newPassword !== this.confirmPassword
        ? 'Passwords do not match.' : 'Enter a new password.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
      return;
    }
    this.changingPassword = true;
    this.passwordError    = '';
    const userId = this.auth.getUser()?.id ?? 0;
    this.api.changePassword(userId, this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess  = 'Password changed successfully.';
        this.changingPassword = false;
        this.resetPasswordForm();
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: (err) => {
        this.passwordError    = err?.error?.message ?? 'Could not change password.';
        this.changingPassword = false;
      },
    });
  }

  resetPasswordForm() {
    this.currentPassword  = '';
    this.newPassword      = '';
    this.confirmPassword  = '';
    this.passwordVerified = false;
    this.verifyError      = '';
    this.passwordError    = '';
  }
}
