import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 9999;
      max-width: 380px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius);
      background: var(--surface-2);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-lg);
      animation: slideIn 200ms ease;
      font-size: 0.9rem;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast--success { border-color: var(--accent); }
    .toast--error   { border-color: var(--danger); }
    .toast-icon { font-size: 1rem; flex-shrink: 0; }
    .toast-msg  { flex: 1; color: var(--text-primary); }
    .toast-close {
      background: none; border: none; cursor: pointer;
      color: var(--text-muted); font-size: 0.75rem;
      padding: 0.2rem; transition: color var(--transition);
    }
    .toast-close:hover { color: var(--text-primary); }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly icons = { success: '✓', error: '✕', info: 'ℹ' };
}
