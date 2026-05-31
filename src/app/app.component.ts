import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

const AUTH_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private router = inject(Router);

  showHeader$ = this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map((e: any) => !AUTH_ROUTES.some(p => e.urlAfterRedirects.startsWith(p))),
    startWith(!AUTH_ROUTES.some(p => this.router.url.startsWith(p))),
  );
}
