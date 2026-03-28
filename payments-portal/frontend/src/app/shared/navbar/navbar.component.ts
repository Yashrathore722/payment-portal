import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="brand">
          <span class="brand-icon">⬡</span>
          <span class="brand-name">PayPortal</span>
        </a>
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Payments</a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .navbar-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      text-decoration: none;
      color: var(--text-primary);
    }
    .brand-icon {
      font-size: 1.5rem;
      color: var(--accent);
      line-height: 1;
    }
    .brand-name {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-links a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color var(--transition);
    }
    .nav-links a:hover, .nav-links a.active { color: var(--text-primary); }
    .btn-new {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--accent);
      color: #0a0c10 !important;
      padding: 0.5rem 1rem;
      border-radius: var(--radius);
      font-weight: 700 !important;
      font-size: 0.85rem !important;
      transition: opacity var(--transition), transform var(--transition) !important;
    }
    .btn-new:hover { opacity: 0.88; transform: translateY(-1px); }
    .btn-new span { font-size: 1.1rem; }
  `]
})
export class NavbarComponent {}
