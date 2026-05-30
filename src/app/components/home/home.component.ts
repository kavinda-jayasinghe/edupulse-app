import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressBarModule, MatDividerModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  loading = true;
  error   = '';

  studentName  = '';
  studentClass = '';
  totalExams   = 0;
  currentRank: number | null = null;
  totalScore   = 0;
  totalDots    = 0;
  maxDots      = 500;

  dotsArray: boolean[] = [];
  recentExams: any[]   = [];
  topRankings: any[]   = [];

  displayedColumns = ['title', 'score', 'rank', 'date'];

  get dotsProgress(): number {
    return Math.min((this.totalDots / this.maxDots) * 100, 100);
  }

  ngOnInit() {
    const user = this.auth.getUser();

    // fallback to seed user id=3 if not logged in yet
    const studentId = user?.id ?? 3;
    const classId   = user?.class_id ?? 1;

    this.studentName  = user?.name ?? 'Student';
    this.studentClass = user?.class_name ?? 'Class';

    this.api.getDashboard(studentId).subscribe({
      next: data => {
        this.studentName  = data.student.name;
        this.totalExams   = data.totalExams;
        this.totalScore   = data.totalScore;
        this.currentRank  = data.currentRank;
        this.totalDots    = data.totalDots;
        this.recentExams  = data.recentExams;
        this.dotsArray    = Array(this.maxDots).fill(false).map((_, i) => i < this.totalDots);
        this.loading      = false;
      },
      error: () => {
        this.error   = 'Could not load dashboard. Is the backend running?';
        this.loading = false;
        this.dotsArray = Array(this.maxDots).fill(false);
      }
    });

    this.api.getRankings(classId).subscribe({
      next: data => {
        this.topRankings = data.slice(0, 5).map(r => ({
          ...r,
          isCurrentUser: r.id === studentId,
        }));
      },
      error: () => {}
    });
  }

  rankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  scorePercent(score: number, total: number): number {
    return total ? Math.round((score / total) * 100) : 0;
  }
}
