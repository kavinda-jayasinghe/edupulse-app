import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private auth   = inject(AuthService);
  private api    = inject(ApiService);
  private router = inject(Router);

  userName    = '';
  userClass   = '';
  isAdmin     = false;
  isTeacher   = false;
  unreadCount = 0;

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      this.userName  = user.name;
      this.isAdmin   = user.profileType === 'ADMIN';
      this.isTeacher = user.profileType === 'TEACHER';
      this.userClass = this.isAdmin   ? 'Administrator'
                     : this.isTeacher ? 'Teacher'
                     : (user.class_name ?? '');
      this.loadUnread(user.id);
    }
  }

  private loadUnread(userId: number) {
    this.api.getNotifications(userId).subscribe({
      next: list => this.unreadCount = list.filter((n: any) => !n.is_read).length,
      error: () => {}
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
