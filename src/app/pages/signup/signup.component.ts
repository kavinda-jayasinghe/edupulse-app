import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw  = control.get('password')?.value;
  const cpw = control.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl:    './signup.component.scss',
})
export class SignupComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private http   = inject(HttpClient);

  loading  = false;
  success  = false;
  error    = '';
  showPass = false;
  dots     = Array(40).fill(false).map((_, i) => i % 3 === 0 || i % 7 === 0);

  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(3)]],
    mobile:          ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password:        ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  ngOnInit() {
    if (this.auth.isLoggedIn()) this.router.navigateByUrl('/home');
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';

    const { name, mobile, password } = this.form.value;
    this.http.post(`${environment.apiUrl}/auth/register`, { name, mobile, password }).subscribe({
      next:  () => { this.success = true; this.loading = false; },
      error: (err) => {
        this.error   = err.error?.message ?? 'Registration failed. Please try again.';
        this.loading = false;
      },
    });
  }

  fieldErr(field: string, label: string): string {
    const c = this.form.get(field);
    if (!c?.touched) return '';
    if (c.hasError('required'))  return `${label} is required`;
    if (c.hasError('pattern'))   return `${label} must be a valid 10-digit number`;
    if (c.hasError('minlength')) return `Minimum ${c.errors?.['minlength'].requiredLength} characters`;
    return '';
  }

  get confirmErr(): string {
    const c = this.form.get('confirmPassword');
    if (!c?.touched) return '';
    if (c.hasError('required')) return 'Please confirm your password';
    if (this.form.hasError('mismatch')) return 'Passwords do not match';
    return '';
  }
}
