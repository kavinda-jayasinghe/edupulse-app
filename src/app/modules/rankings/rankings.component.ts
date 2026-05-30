import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.scss'
})
export class RankingsComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  loading    = true;
  error      = '';
  leaderboard: any[] = [];
  currentUserId = 0;

  columns = ['rank', 'name', 'exams', 'avgScore', 'totalScore'];

  ngOnInit() {
    const user     = this.auth.getUser();
    const classId  = user?.class_id ?? 1;
    this.currentUserId = user?.id ?? 3;

    this.api.getRankings(classId).subscribe({
      next:  data  => { this.leaderboard = data; this.loading = false; },
      error: ()    => { this.error = 'Could not load rankings. Is the backend running?'; this.loading = false; }
    });
  }

  rankMedal(rank: number): string {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }
}
