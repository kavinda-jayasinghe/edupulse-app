import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  loading       = true;
  error         = '';
  notifications: any[] = [];
  userId        = 3;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  ngOnInit() {
    const user   = this.auth.getUser();
    this.userId  = user?.id ?? 3;

    this.api.getNotifications(this.userId).subscribe({
      next:  data  => { this.notifications = data; this.loading = false; },
      error: ()    => { this.error = 'Could not load notifications. Is the backend running?'; this.loading = false; }
    });
  }

  markRead(n: any) {
    if (n.is_read) return;
    n.is_read = true;
    this.api.markNotificationRead(n.id).subscribe();
  }

  markAllRead() {
    this.notifications.forEach(n => n.is_read = true);
    this.api.markAllNotificationsRead(this.userId).subscribe();
  }
}
