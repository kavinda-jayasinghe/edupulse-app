import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl:    './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    mobile:   ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading  = false;
  error    = '';
  showPass = false;
  dots     = Array(40).fill(false).map((_, i) => i % 3 === 0 || i % 5 === 0);

  ngOnInit() {
    if (this.auth.isLoggedIn()) this.router.navigateByUrl('/home');
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = '';

    const { mobile, password } = this.form.value;
    this.auth.login(mobile!, password!).subscribe({
      next:  (res) => {
        const pt = res.user?.profileType;
        this.router.navigateByUrl(pt === 'ADMIN' ? '/admin' : pt === 'TEACHER' ? '/teacher' : '/home');
      },
      error: (err) => {
        this.error   = err.error?.message ?? 'Login failed. Please try again.';
        this.loading = false;
      },
    });
  }

  get mobileErr() {
    const c = this.form.get('mobile');
    if (c?.hasError('required') && c.touched) return 'Mobile number is required';
    if (c?.hasError('pattern')  && c.touched) return 'Enter a valid 10-digit mobile number';
    return '';
  }

  get passErr() {
    const c = this.form.get('password');
    if (c?.hasError('required')   && c.touched) return 'Password is required';
    if (c?.hasError('minlength')  && c.touched) return 'Minimum 6 characters';
    return '';
  }
}
