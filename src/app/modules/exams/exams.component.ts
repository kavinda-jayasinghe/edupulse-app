import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './exams.component.html',
  styleUrl: './exams.component.scss'
})
export class ExamsComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  loading = true;
  error   = '';
  exams: any[] = [];

  ngOnInit() {
    const user      = this.auth.getUser();
    const studentId = user?.id ?? 3;

    this.api.getStudentExams(studentId).subscribe({
      next:  data  => { this.exams = data; this.loading = false; },
      error: ()    => { this.error = 'Could not load exams. Is the backend running?'; this.loading = false; }
    });
  }

  get available() { return this.exams.filter(e => e.status === 'available'); }
  get upcoming()  { return this.exams.filter(e => e.status === 'upcoming' || e.status === 'expired'); }
  get completed() { return this.exams.filter(e => e.status === 'completed'); }

  scorePercent(score: number, total: number): number {
    return total ? Math.round((score / total) * 100) : 0;
  }
}
